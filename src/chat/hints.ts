// 도움 요청 시 TODO 진행 상태에 맞는 힌트 고르기
import type { MissionId } from '../content/missions'
import type { ReplyContext } from './ruleEngine'

/** 지금 진행할 수 있는 업무 중 힌트가 준비된 첫 업무의 힌트. 없으면 null */
export function getHint(context: ReplyContext, hints: Partial<Record<MissionId, string>>): string | null {
  const mission = context.availableMissions.find((id) => hints[id])
  return mission ? (hints[mission] ?? null) : null
}
