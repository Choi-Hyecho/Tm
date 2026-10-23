// 승빈 타이틀곡 토론 — 매니저가 고른 곡의 반대편을 들다가, 토론이 끝나면 결국 더블 타이틀
// 진행 횟수는 채팅방 flow에 'titleDebate-<횟수>'로 저장 (새로고침해도 이어짐)
import { normalize } from '../chat/intent'
import type { LinePicker } from '../chat/ruleEngine'
import { seungbinQuest, type TitleSong } from '../content/quests/seungbin'

const FLOW_PREFIX = 'titleDebate-'
const FLOW_END = 'titleDebate-end'

export interface DebateResult {
  replies: string[]
  flow: string
  category: string
  /** 마지막 답장이 도착하면 업무 완료 */
  complete?: boolean
  /** 그다음 팀장님 카톡 */
  managerFollowup?: { text: string; delayMs: number }
}

const roundsDone = (flow: string) => (flow.startsWith(FLOW_PREFIX) ? Number(flow.slice(FLOW_PREFIX.length)) || 0 : 0)

/**
 * 매니저가 고른 곡 — 두 곡이 다 나오면 "A보다 B"의 B.
 * 둘 다 언급만 하고 비교가 없으면 판단하지 않음
 */
export function detectSong(text: string): TitleSong | null {
  const t = normalize(text)
  const found = (Object.keys(seungbinQuest.songPatterns) as TitleSong[])
    .map((song) => {
      const match = seungbinQuest.songPatterns[song].map((p) => t.match(p)).find(Boolean)
      return match ? { song, end: (match.index ?? 0) + match[0].length } : null
    })
    .filter((f) => f !== null)
  if (found.length === 1) return found[0].song
  // "이 별보다 Fallen Angel" — '보다' 바로 앞에 있는 곡은 탈락
  const rejected = found.find((f) => /^\S{0,2}보다/.test(t.slice(f.end)))
  return found.length === 2 && rejected ? (found.find((f) => f !== rejected)?.song ?? null) : null
}

/** 토론에 해당하는 말이 아니면 null — 일반 대화 규칙으로 넘어감 */
export function respondTitleDebate(flow: string, text: string, pick: LinePicker): DebateResult | null {
  const t = normalize(text)
  const done = roundsDone(flow)
  const { against, ending, bothTooEarly, whatever, bothPatterns, whateverPatterns } = seungbinQuest
  // 두 곡의 반박 묶음 수가 다르면 짧은 쪽에 맞춤
  const total = Math.min(against.fallen.length, against.byeol.length)
  // 이미 더블 타이틀로 정함 (완료 답장이 도착하기 전) — 일반 대화로
  if (flow === FLOW_END) return null
  const finish: DebateResult = {
    replies: ending,
    flow: FLOW_END,
    category: 'debateEnd',
    complete: true,
    managerFollowup: seungbinQuest.managerReaction,
  }

  // "둘 다" — 토론 중엔 회피라며 거절, 토론이 끝났으면 본인이 정한 것처럼 더블 타이틀
  if (bothPatterns.some((p) => p.test(t))) {
    return done >= total ? finish : { replies: [pick(bothTooEarly)], flow, category: 'debateBoth' }
  }

  const song = detectSong(text)
  if (song) {
    if (done >= total) return finish
    // 매니저가 고른 곡의 반대편 — 같은 곡을 다시 골라도 매번 반박
    return { replies: against[song][done], flow: `${FLOW_PREFIX}${done + 1}`, category: `debate-${done}` }
  }

  if (whateverPatterns.some((p) => p.test(t))) return { replies: [pick(whatever)], flow, category: 'debateWhatever' }
  return null
}
