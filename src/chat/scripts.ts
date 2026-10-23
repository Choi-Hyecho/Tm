// 채팅방별 답장 규칙 — 대화 흐름(flow)·대화 맥락과 입력 문장으로 다음 답장을 결정하는 순수 함수
// 다른 멤버/미션 대화는 여기에 responder를 추가해서 연결
import { managerScript, type ChatId, type MemberId } from '../content/chats'
import type { SharedFile } from '../state/types'
import { contextFollowups, managerAck, managerFallback, managerReplyRules } from '../content/managerReplies'
import { memberScripts } from '../content/members'
import { isAffection, isAffirmative, isGreeting, isNegative, isYesOnly } from './intent'
import { respondTitleDebate } from '../missions/titleDebate'
import { detectMemberIntent } from './memberIntents'
import { findRule, pickFresh, resolveFollowup, resolveReply, type LinePicker, type ReplyContext } from './ruleEngine'

export interface RespondInput {
  /** 대화 단계 — 예: 첫 대화 중(awaitingConfirm) / 일반 대화(free) */
  flow: string
  /** 직전 질문의 맥락 — 예: 카페 제안 직후(cafeInvitation) */
  conversationContext: string | null
  text: string
  /** 지금까지의 메시지 수 — 대사를 고를 때 섞는 값 (무작위 대신 결정적으로) */
  turn: number
  /** 상대가 최근에 한 말 (도착 예정 포함) — 같은 대사 반복 방지 */
  recent: string[]
  game: ReplyContext
}

export interface RespondResult {
  replies: string[]
  flow: string
  conversationContext: string | null
  /** 멤버 업무 시작 — replies[missionRequestIndex]가 도착할 때 TODO에 공개 */
  startMission?: boolean
  missionRequestIndex?: number
  /** 첫 답장 전에 '입력 중…'이 사라졌다 다시 나오는 고민 연출 */
  hesitate?: boolean
  /** 답의 종류 — 한꺼번에 읽은 메시지가 같은 종류로 이어지면 답은 한 번만 (state/chat.ts) */
  category?: string
  /** 답장 다음에 이어서 보내는 파일들 */
  attachments?: SharedFile[]
  /** 마지막 답장이 도착하면 이 멤버 업무 완료 (승빈 타이틀곡 토론) */
  completeMission?: boolean
  /** 이 답장들이 도착하고 delayMs 뒤 팀장님 카톡 (승빈 더블 타이틀 선언 후) */
  managerFollowup?: { text: string; delayMs: number }
}

type Responder = (input: RespondInput) => RespondResult

/** 최근에 한 말을 피해서 고르는 picker — 입력 문장 길이도 섞어 같은 순서로만 나오지 않게 */
const makePicker =
  ({ recent, turn, text }: RespondInput): LinePicker =>
  (lines) =>
    pickFresh(lines, recent, turn * 31 + text.length)

const respondManager: Responder = (input) => {
  const { flow, conversationContext, text, game } = input
  const pick = makePicker(input)

  // 1) 직전 제안에 대한 답 — '네'가 업무 확인이 아니라 카페 수락일 수 있음
  const followup = conversationContext ? contextFollowups[conversationContext] : undefined
  if (followup) {
    const reply = resolveFollowup(followup, text)
    if (reply) return { replies: [reply], flow, conversationContext: null }
  }

  const rule = findRule(managerReplyRules, text)
  const ruleResult = (): RespondResult | null =>
    rule
      ? { replies: [resolveReply(rule, game, pick)], flow, conversationContext: rule.setContext ?? null, category: rule.id }
      : null

  // 2) 첫 대화: "확인했습니다" 계열 답변이 일반 키워드 답변보다 우선
  if (flow === 'awaitingConfirm') {
    if (isAffirmative(text)) return { replies: managerScript.confirmed, flow: 'free', conversationContext: null }
    if (isNegative(text)) return { replies: [managerScript.notYet], flow, conversationContext: null }
    // 다른 질문에는 답하되, 첫 대화는 아직 끝나지 않은 상태로 유지
    return ruleResult() ?? { replies: [managerScript.nudge], flow, conversationContext: null }
  }

  // 3) 일반 대화
  const result = ruleResult()
  if (result) return result
  if (isYesOnly(text)) return { replies: [pick(managerAck)], flow, conversationContext: null }
  return { replies: [managerFallback], flow, conversationContext: null }
}

/**
 * 멤버: 첫 인사는 한 번만 (flow가 'greeted'로 저장되어 다시 들어와도 반복되지 않음).
 * 인사 직후 업무 요청까지 이어서 보냄. 다른 멤버 업무가 진행 중이면 이 함수는 호출되지 않음(state/chat.ts에서 보류).
 * 대사는 content/members/<멤버>.ts
 */
const memberResponder =
  (id: MemberId): Responder =>
  (input) => {
    const { flow, text, game } = input
    const script = memberScripts[id]
    const pick = makePicker(input)
    const reply = (line: string, extra: Partial<RespondResult> = {}): RespondResult => ({
      replies: [line],
      flow,
      conversationContext: null,
      ...extra,
    })

    const status = game.missionStatuses[id]
    // 업무 요청을 이미 보냈거나(도착 전 포함) 끝난 경우
    const requested = status !== 'hidden' || game.activeMissionId === id
    const withRequest = (replies: string[]): RespondResult =>
      requested
        ? { replies, flow: 'greeted', conversationContext: null }
        : {
            replies: [...replies, ...script.request],
            flow: 'greeted',
            conversationContext: null,
            startMission: true,
            missionRequestIndex: replies.length,
            attachments: script.requestAttachments,
          }

    if (flow === 'awaitingGreeting') {
      if (isGreeting(text)) return withRequest(script.greeting)
      // 인사도 안 했는데 애정 표현부터 — "갑자기요?"
      if (isAffection(text)) return reply(pick(script.affection), { hesitate: true, category: 'affection' })
      return reply(pick(script.beforeGreeting), { category: 'beforeGreeting' })
    }
    // 인사는 했지만 업무를 아직 못 받은 경우 — 바로 업무 요청
    if (!requested) return withRequest([])

    if (isGreeting(text)) return reply(pick(script.greetAgain), { category: 'greetAgain' })
    if (isAffection(text)) return reply(pick(script.affection), { hesitate: true, category: 'affection' })

    // 승빈 타이틀곡 토론 — 곡을 고르면 반박, 끝나면 더블 타이틀로 업무 완료
    if (id === 'seungbin' && status === 'active') {
      const debate = respondTitleDebate({ flow, text, recent: input.recent, turn: input.turn }, pick)
      if (debate) {
        return {
          replies: debate.replies,
          flow: debate.flow,
          conversationContext: null,
          category: debate.category,
          completeMission: debate.complete,
          managerFollowup: debate.managerFollowup,
        }
      }
    }

    // 멤버 전용 이스터에그 → 상황별 반응 → 업무 중/후 기본 답
    const extra = findRule(script.extraRules, text)
    if (extra) return reply(resolveReply(extra, game, pick), { category: extra.id })
    const intent = detectMemberIntent(text, script.names)
    if (intent) return reply(pick(script.intents[intent]), { category: intent })
    return reply(pick(status === 'completed' ? script.afterMission : script.missionIdle), { category: 'idle' })
  }

export const responders: Record<ChatId, Responder> = {
  manager: respondManager,
  yunmin: memberResponder('yunmin'),
  seungbin: memberResponder('seungbin'),
  dohyun: memberResponder('dohyun'),
  johnbekim: memberResponder('johnbekim'),
}

/** 채팅방 생성 시 시작 흐름 */
export const initialFlows: Record<ChatId, string> = {
  manager: 'awaitingConfirm',
  yunmin: 'awaitingGreeting',
  seungbin: 'awaitingGreeting',
  dohyun: 'awaitingGreeting',
  johnbekim: 'awaitingGreeting',
}

/** 멤버에게 첫 인사를 마쳤는지 */
export const hasGreeted = (flow: string) => flow !== 'awaitingGreeting'
