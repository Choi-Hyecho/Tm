// 플레이어 카톡 프로필 — 화면에 보일 이름/상태 메시지/사진, 대사 속 호칭 바꾸기
import { myProfile } from '../config/kakao'
import { findPhoto } from '../content/gallery'
import type { GameState } from './types'

/** 입력 글자 수 제한 */
export const PROFILE_LIMITS = { name: 12, status: 40 }

/** 지금 보여줄 내 프로필 — 비워 둔 항목은 기본값 */
export function getMyProfile(state: GameState) {
  const { name, status, photoId, photoData } = state.profile
  const defaultStatus = state.released ? myProfile.statusMessageReleased : myProfile.statusMessage
  return {
    name: name || myProfile.name,
    status: status || defaultStatus,
    avatar: photoData || findPhoto(photoId ?? undefined)?.src || myProfile.avatar,
  }
}

/** 휴대폰에서 고른 사진을 가운데 정사각형으로 잘라 size px JPEG data URL로 — 저장 용량을 작게 */
export function resizeImageFile(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

/**
 * 멤버/팀장님 대사 속 '매니저님'을 플레이어가 정한 이름으로 — "윤민님" 이 아니라 "○○님".
 * 이름을 안 정했으면 그대로. 지난 대화도 화면에 보일 때 바뀜(저장된 원문은 그대로)
 */
export function addressPlayer(text: string, state: GameState) {
  const name = state.profile.name.trim()
  if (!name) return text
  const title = name.endsWith('님') ? name : `${name}님`
  // "새 매니저님", "새로 오신 매니저님"처럼 직책으로 부르는 말은 그대로
  return text.replace(/(?<!새\s?|오신\s?)매니저님/g, title)
}
