// 채팅방별 답장 규칙 — 대화 흐름(flow)·대화 맥락과 입력 문장으로 다음 답장을 결정하는 순수 함수
// 다른 멤버/미션 대화는 여기에 responder를 추가해서 연결
import { managerScript, type ChatId, type MemberId } from '../content/chats'
import { contextFollowups, managerAck, managerFallback, managerReplyRules } from '../content/managerReplies'
import { memberGreetings } from '../content/memberGreetings'
import { isAffection, isAffirmative, isGreeting, isMealQuestion, isNegative, isYesOnly } from './intent'
import { findRule, resolveFollowup, resolveReply, type ReplyContext } from './ruleEngine'

export interface RespondInput {
  /** 대화 단계 — 예: 첫 대화 중(awaitingConfirm) / 일반 대화(free) */
  flow: string
  /** 직전 질문의 맥락 — 예: 카페 제안 직후(cafeInvitation) */
  conversationContext: string | null
  text: string
  /** 지금까지의 메시지 수 — 대사를 돌아가며 고를 때 사용 (무작위 대신 결정적으로) */
  turn: number
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
}

type Responder = (input: RespondInput) => RespondResult

const pick = (lines: string[], turn: number) => lines[turn % lines.length]

const respondManager: Responder = ({ flow, conversationContext, text, turn, game }) => {
  // 1) 직전 제안에 대한 답 — '네'가 업무 확인이 아니라 카페 수락일 수 있음
  const followup = conversationContext ? contextFollowups[conversationContext] : undefined
  if (followup) {
    const reply = resolveFollowup(followup, text)
    if (reply) return { replies: [reply], flow, conversationContext: null }
  }

  const rule = findRule(managerReplyRules, text)
  const ruleResult = (): RespondResult | null =>
    rule
      ? { replies: [resolveReply(rule, game, turn)], flow, conversationContext: rule.setContext ?? null }
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
  if (isYesOnly(text)) return { replies: [pick(managerAck, turn)], flow, conversationContext: null }
  return { replies: [managerFallback], flow, conversationContext: null }
}

/**
 * 멤버: 첫 인사는 한 번만 (flow가 'greeted'로 저장되어 다시 들어와도 반복되지 않음).
 * 인사 직후 업무 요청까지 이어서 보냄. 다른 멤버 업무가 진행 중이면 이 함수는 호출되지 않음(state/chat.ts에서 보류)
 */
const memberResponder =
  (id: MemberId): Responder =>
  ({ flow, text, turn, game }) => {
    const lines = memberGreetings[id]
    const status = game.missionStatuses[id]
    // 업무 요청을 이미 보냈거나(도착 전 포함) 끝난 경우
    const requested = status !== 'hidden' || game.activeMissionId === id

    const withRequest = (replies: string[]): RespondResult =>
      requested
        ? { replies, flow: 'greeted', conversationContext: null }
        : {
            replies: [...replies, ...lines.request],
            flow: 'greeted',
            conversationContext: null,
            startMission: true,
            missionRequestIndex: replies.length,
          }

    if (flow === 'awaitingGreeting') {
      if (isGreeting(text)) return withRequest(lines.greeting)
      // 인사도 안 했는데 애정 표현부터 — "갑자기요?"
      if (isAffection(text)) return { replies: [pick(lines.affection, turn)], flow, conversationContext: null, hesitate: true }
      return { replies: [lines.beforeGreeting], flow, conversationContext: null }
    }
    // 인사는 했지만 업무를 아직 못 받은 경우 — 바로 업무 요청
    if (!requested) return withRequest([])

    if (isGreeting(text)) return { replies: [pick(lines.greetAgain, turn)], flow, conversationContext: null }
    if (isAffection(text)) return { replies: [pick(lines.affection, turn)], flow, conversationContext: null, hesitate: true }
    if (isMealQuestion(text)) return { replies: [pick(lines.meal, turn)], flow, conversationContext: null }
    const pool = status === 'completed' ? lines.afterMission : lines.missionIdle
    return { replies: [pick(pool, turn)], flow, conversationContext: null }
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
