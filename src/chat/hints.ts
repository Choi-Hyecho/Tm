// 도움 요청 시 TODO 진행 상태에 맞는 힌트 고르기
import type { MissionId } from '../content/missions'
import type { ReplyContext } from './ruleEngine'

/** 업무별 힌트 — 고정 문구 또는 진행 상황(오답 횟수 등)에 따라 달라지는 문구 */
export type MissionHint = string | ((context: ReplyContext) => string)

/** 지금 진행할 수 있는 업무 중 힌트가 준비된 첫 업무의 힌트. 없으면 null */
export function getHint(context: ReplyContext, hints: Partial<Record<MissionId, MissionHint>>): string | null {
  const mission = context.availableMissions.find((id) => hints[id])
  const hint = mission ? hints[mission] : undefined
  if (!hint) return null
  return typeof hint === 'function' ? hint(context) : hint
}
