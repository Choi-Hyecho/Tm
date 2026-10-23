// 승빈 타이틀곡 토론 — 규칙 기반 (AI API 없음). 대사는 content/quests/seungbin.ts
//
// 단계는 채팅방 flow에 'titleDebate:<단계>:<반박 횟수>:<매니저 편 곡>'으로 저장 (새로고침해도 이어짐)
//   pick   — 곡을 고르는 중: 곡을 인식하면 이유를 물음
//   reason — 이유를 기다리는 중: 이유를 말하면 반대 곡 편을 들며 반박
//   argue  — 반박한 뒤 계속 토론: 다른 곡을 말하면 편을 바꿔 이유를 다시 묻고, 그 밖의 말은 이유로 보고 반박
// 반박이 debateRounds번 나오면 매니저의 다음 말에 더블 타이틀 결정 → 업무 완료
import { normalize } from '../chat/intent'
import type { LinePicker } from '../chat/ruleEngine'
import { findOtherTrack } from '../content/discography'
import { seungbinQuest, type ReasonKey, type TitleSong } from '../content/quests/seungbin'

const PREFIX = 'titleDebate:'
const FLOW_END = 'titleDebate-end'

type Stage = 'pick' | 'reason' | 'argue'
interface DebateState {
  stage: Stage
  /** 지금까지 한 반박 수 */
  rebuttals: number
  /** 매니저가 편드는 곡 (pick 단계에서는 없음) */
  side?: TitleSong
}

export interface DebateResult {
  replies: string[]
  flow: string
  category: string
  /** 마지막 답장이 도착하면 업무 완료 */
  complete?: boolean
  /** 그다음 팀장님 카톡 */
  managerFollowup?: { text: string; delayMs: number }
}

export interface DebateInput {
  flow: string
  text: string
  /** 승빈이 최근에 한 말 — 같은 반박 반복 방지 */
  recent: string[]
  /** 대사를 고를 때 섞는 값 */
  turn: number
}

const SONGS: TitleSong[] = ['fallen', 'byeol']
/** 곡을 깎아내리는 말 — 이유 속에 곡 이름이 나와도 그 곡 편으로 바꾸지 않음 */
const NEGATIVE = /별로|싫|약해|약하|부족|애매|지루|평범/
/** 곡 이름을 지운 문장 — "이 별로 해요"의 '별로'를 부정으로 오해하지 않게 */
const withoutSongs = (t: string) =>
  SONGS.reduce((acc, song) => seungbinQuest.songPatterns[song].reduce((a, p) => a.replace(new RegExp(p, 'g'), ' '), acc), t)

function parseFlow(flow: string): DebateState {
  if (flow.startsWith(PREFIX)) {
    const [stage, rebuttals, side] = flow.slice(PREFIX.length).split(':')
    if (stage === 'pick' || stage === 'reason' || stage === 'argue') {
      return { stage, rebuttals: Number(rebuttals) || 0, side: SONGS.find((s) => s === side) }
    }
  }
  // 업무 요청 직후('greeted') 또는 예전 저장 데이터 — 곡 고르기부터
  return { stage: 'pick', rebuttals: 0 }
}

const toFlow = ({ stage, rebuttals, side }: DebateState) => `${PREFIX}${stage}:${rebuttals}${side ? `:${side}` : ''}`

const fill = (line: string, song: TitleSong) => line.replaceAll('{song}', seungbinQuest.songNames[song])

/** 여러 줄 묶음 중 최근에 안 한 묶음을 고름 — 모두 했으면 아무거나 */
function pickGroup(groups: string[][], recent: string[], seed: number) {
  const fresh = groups.filter((g) => !g.some((line) => recent.includes(line)))
  const pool = fresh.length > 0 ? fresh : groups
  return pool[Math.abs(seed * 7919 + 13) % pool.length]
}

export type SongChoice = { kind: 'song'; song: TitleSong } | { kind: 'ambiguous' } | { kind: 'none' }

/**
 * 매니저가 고른 곡 — "이 별 말고 Fallen Angel", "이 별보다 Fallen Angel"이면 Fallen Angel.
 * 두 곡이 다 나오는데 어느 쪽인지 모르거나, 한 곡뿐인데 부정("이 별은 아니에요")이면 ambiguous
 */
export function detectSong(text: string): SongChoice {
  const t = normalize(text)
  const { songPatterns, rejectAfterSong } = seungbinQuest
  const found = SONGS.flatMap((song) => {
    const match = songPatterns[song].map((p) => t.match(p)).find(Boolean)
    if (!match) return []
    const rejected = rejectAfterSong.test(t.slice((match.index ?? 0) + match[0].length))
    return [{ song, rejected }]
  })
  const chosen = found.filter((f) => !f.rejected)
  if (found.length === 0) return { kind: 'none' }
  if (chosen.length === 1 && (found.length === 1 || found.some((f) => f.rejected))) return { kind: 'song', song: chosen[0].song }
  return { kind: 'ambiguous' }
}

/** 곡이나 이유가 들어간 토론 발언인지 — "이 별은 윤민이가 작곡해서 좋아요"처럼 다른 사람 이름이 있어도 미루기가 아님 */
export function isDebateTalk(text: string) {
  return detectSong(text).kind !== 'none' || reasonKey(normalize(text)) !== undefined
}

const reasonKey = (t: string) =>
  (Object.keys(seungbinQuest.reasonPatterns) as ReasonKey[]).find((key) => seungbinQuest.reasonPatterns[key].test(t))

/** 토론에 해당하지 않으면 null (더블 타이틀로 정한 뒤) — 일반 대화 규칙으로 넘어감 */
export function respondTitleDebate({ flow, text, recent, turn }: DebateInput, pick: LinePicker): DebateResult | null {
  if (flow === FLOW_END) return null
  const q = seungbinQuest
  const state = parseFlow(flow)
  const t = normalize(text)
  const reply = (lines: string[], next: DebateState, category: string): DebateResult => ({
    replies: lines,
    flow: toFlow(next),
    category,
  })

  // 반박을 다 했으면 무슨 말을 해도 결국 더블 타이틀
  if (state.rebuttals >= q.debateRounds) {
    return { replies: q.ending, flow: FLOW_END, category: 'debateEnd', complete: true, managerFollowup: q.managerReaction }
  }

  const askReason = (song: TitleSong) =>
    reply([fill(pick(q.askReason), song)], { stage: 'reason', rebuttals: state.rebuttals, side: song }, 'debateAskReason')
  const rebut = (side: TitleSong) => {
    const key = reasonKey(t)
    const groups = key ? q.reasonRebuttals[key][side] : q.against[side]
    const lines = pickGroup(groups, recent, turn + text.length)
    return reply(lines, { stage: 'argue', rebuttals: state.rebuttals + 1, side }, `debate-${state.rebuttals}`)
  }

  // "둘 다" / "못 고르겠어요" — 우선 한 곡을 고르라고 함 (단계는 그대로)
  if (q.bothPatterns.some((p) => p.test(t))) return reply([pick(q.bothTooEarly)], state, 'debateBoth')
  if (q.whateverPatterns.some((p) => p.test(t))) return reply([pick(q.whatever)], state, 'debateWhatever')

  const choice = detectSong(text)

  if (state.stage === 'pick' || !state.side) {
    if (choice.kind === 'song') return askReason(choice.song)
    if (choice.kind === 'ambiguous') return reply([pick(q.ambiguous)], state, 'debateAmbiguous')
    const track = findOtherTrack(t)
    if (track) {
      const lines = q.otherTrackSpecial[track.title] ?? [pick(q.otherTrack).replaceAll('{track}', track.title)]
      return reply(lines, state, `debateOtherTrack-${track.title}`)
    }
    return reply([pick(q.guide)], state, 'debateGuide')
  }

  // 이유를 기다리는 중 / 토론 중 — 이유 키워드가 있으면 이유로 봄 ("이 별은 가사가 별로"도 이유)
  const hasReason = reasonKey(t) !== undefined
  if (!hasReason) {
    // 다른 곡으로 바꿈 → 이유를 다시 물음
    if (choice.kind === 'song' && choice.song !== state.side) return askReason(choice.song)
    if (choice.kind === 'ambiguous') return reply([pick(q.ambiguous)], state, 'debateAmbiguous')
    // 토론 중 같은 곡만 다시 말함 → 이유를 물음
    if (state.stage === 'argue' && choice.kind === 'song') return askReason(choice.song)
  }
  // 이유와 함께 다른 곡 편으로 넘어간 경우 그 곡 기준으로 반박 — 단 "이 별은 가사가 별로"처럼 깎아내리는 말이면 편은 그대로
  const switched = hasReason && choice.kind === 'song' && !NEGATIVE.test(withoutSongs(t))
  return rebut(switched ? choice.song : state.side)
}
