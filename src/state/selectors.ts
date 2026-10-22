import { meta } from '../content/meta'
import { isMemberMission, missions, type MissionId } from '../content/missions'
import type { GameState, MissionStatus } from './types'

/** 화면에 보일 업무 상태 — 마지막 두 업무는 선행 업무가 모두 끝나면 active(진행 가능) */
export function getMissionStatus(state: GameState, id: MissionId): MissionStatus {
  const stored = state.missionStatuses[id]
  if (isMemberMission(id) || stored === 'completed') return stored
  const def = missions.find((m) => m.id === id)
  return def?.requires.every((r) => state.missionStatuses[r] === 'completed') ? 'active' : 'locked'
}

/** 게임 속 날짜 — 발매 전 10/14, 발매 후 10/15 */
export function getVirtualDate(state: GameState) {
  return state.released ? meta.releaseDate : meta.startDate
}

export function getProgress(state: GameState) {
  const done = missions.filter((m) => state.missionStatuses[m.id] === 'completed').length
  return { done, total: missions.length, allDone: done === missions.length }
}

/** 지금 진행 중이거나 진행 가능한 업무 */
export function getActiveMissions(state: GameState) {
  return missions.filter((m) => getMissionStatus(state, m.id) === 'active').map((m) => m.id)
}
