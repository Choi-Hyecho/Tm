// TODO 업무 정의 — 문구는 여기서 교체
import type { MemberId } from './chats'

/** 멤버 업무 4개 — 멤버에게 실제 요청을 받기 전까지 내용이 숨겨짐 */
export type MemberMissionId = MemberId
/** 마지막 순차 업무 2개 */
export type FinalMissionId = 'tracklist' | 'report'
export type MissionId = MemberMissionId | FinalMissionId

export interface MissionDef {
  id: MissionId
  title: string
  /** 담당 멤버 표시 이름 — 업무 내용 공개 전에는 이름만 보임 */
  assignee?: string
  /** 완료되어야 열리는 선행 업무 (마지막 두 업무용) */
  requires: MissionId[]
}

export const memberMissionIds: MemberMissionId[] = ['yunmin', 'seungbin', 'dohyun', 'johnbekim']

export const missions: MissionDef[] = [
  { id: 'yunmin', assignee: '윤민', title: '앨범 자켓 사진 전달', requires: [] },
  { id: 'seungbin', assignee: '승빈', title: '더블 타이틀곡 선정', requires: [] },
  { id: 'dohyun', assignee: '도현', title: 'LIAR 가사 최종 검수', requires: [] },
  { id: 'johnbekim', assignee: '존비킴', title: '베이스 믹싱 파일 확인', requires: [] },
  { id: 'tracklist', title: '트랙리스트 최종 검수', requires: memberMissionIds },
  { id: 'report', title: '팀장님 최종 보고', requires: ['tracklist'] },
]

export const isMemberMission = (id: MissionId): id is MemberMissionId =>
  (memberMissionIds as MissionId[]).includes(id)

export const todoContent = {
  title: 'TODO',
  subtitle: '극야 발매 준비',
  statusInProgress: '진행 중',
  statusAllDone: '업무 완료',
  statusReleased: 'RELEASED',
  /** 업무 행 상태 표시 */
  missionHidden: '업무 확인 전',
  missionLocked: '잠김',
  missionActive: '진행 중',
  missionCompleted: '완료 ✓',
  notice: '업무를 실제로 마치면 자동으로 체크돼요. 멤버 업무는 직접 연락해서 요청을 받으면 공개돼요.',
}
