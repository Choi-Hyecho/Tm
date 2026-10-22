// 규칙형 답변 엔진 — AI API 없이 정규화된 문장을 패턴과 비교해 답변을 고름
import type { MemberId } from '../content/chats'
import type { MissionId } from '../content/missions'
import type { MissionStatus } from '../state/types'
import { normalize } from './intent'

/** 답변을 고를 때 참고하는 게임 상태 (TODO 진행도, 미션 상태 등) */
export interface ReplyContext {
  progress: { done: number; total: number }
  released: boolean
  /** 지금 진행 중이거나 진행 가능한 업무 — 힌트용 */
  availableMissions: MissionId[]
  /** 지금 진행 중인 멤버 업무 */
  activeMissionId: MemberId | null
  missionStatuses: Record<MissionId, MissionStatus>
}

export interface ReplyRule {
  id: string
  /** 정규화된 문장(공백/문장부호 제거, 소문자)에 대해 검사 — 하나라도 맞으면 해당 */
  patterns: RegExp[]
  /** 이 패턴이 있으면 제외 — 우연히 단어가 겹쳐 엉뚱하게 답하는 것 방지 */
  exclude?: RegExp[]
  /** 고정 답변, 여러 개(돌아가며 사용), 또는 게임 상태에 따른 동적 답변 */
  reply: string | string[] | ((context: ReplyContext) => string)
  /** 답변 후 기억할 대화 맥락 — 다음 메시지의 '네/아니요'를 이 질문에 대한 답으로 해석 */
  setContext?: string
}

/** 맥락이 있을 때 다음 메시지의 수락/거절 처리 */
export interface ContextFollowup {
  accept: RegExp[]
  decline: RegExp[]
  acceptReply: string
  declineReply: string
}

const matches = (patterns: RegExp[], t: string) => patterns.some((p) => p.test(t))

/** 배열 순서가 우선순위 — 더 구체적인 규칙을 앞에 둘 것 */
export function findRule(rules: ReplyRule[], text: string): ReplyRule | null {
  const t = normalize(text)
  if (!t) return null
  return rules.find((rule) => matches(rule.patterns, t) && !(rule.exclude && matches(rule.exclude, t))) ?? null
}

export function resolveReply(rule: ReplyRule, context: ReplyContext, turn: number) {
  if (typeof rule.reply === 'function') return rule.reply(context)
  if (Array.isArray(rule.reply)) return rule.reply[turn % rule.reply.length]
  return rule.reply
}

/** 맥락에 대한 답이면 수락/거절 답변, 아니면 null (거절 표현을 먼저 검사 — '네 괜찮아요'는 거절) */
export function resolveFollowup(followup: ContextFollowup, text: string): string | null {
  const t = normalize(text)
  if (!t) return null
  if (matches(followup.decline, t)) return followup.declineReply
  if (matches(followup.accept, t)) return followup.acceptReply
  return null
}
