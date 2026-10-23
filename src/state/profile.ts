// 플레이어 카톡 프로필 — 화면에 보일 이름/상태 메시지/사진, 대사 속 호칭 바꾸기
import { myProfile } from '../config/kakao'
import { findPhoto } from '../content/gallery'
import type { GameState } from './types'

/** 입력 글자 수 제한 */
export const PROFILE_LIMITS = { name: 12, status: 40 }

/** 지금 보여줄 내 프로필 — 비워 둔 항목은 기본값 */
export function getMyProfile(state: GameState) {
  const { name, status, photoId } = state.profile
  const defaultStatus = state.released ? myProfile.statusMessageReleased : myProfile.statusMessage
  return {
    name: name || myProfile.name,
    status: status || defaultStatus,
    avatar: findPhoto(photoId ?? undefined)?.src ?? myProfile.avatar,
  }
}

/**
 * 멤버/팀장님 대사 속 '매니저님'을 플레이어가 정한 이름으로 — "윤민님" 이 아니라 "○○님".
 * 이름을 안 정했으면 그대로. 지난 대화도 화면에 보일 때 바뀜(저장된 원문은 그대로)
 */
export function addressPlayer(text: string, state: GameState) {
  const name = state.profile.name.trim()
  if (!name) return text
  const title = name.endsWith('님') ? name : `${name}님`
  return text.replaceAll('매니저님', title)
}
