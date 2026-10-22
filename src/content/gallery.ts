// 게임 속 사진 — 사진첩 앱과 카카오톡 앨범 첨부가 함께 사용
// 이미지는 public/ 기준 경로. 파일이 없으면 임시 이미지(placeholderLabel)가 보입니다.
// 미션 정답은 화면 표시 이름/파일명이 아니라 고유 id(asset ID)로 판별합니다.
import type { MemberId } from './chats'

export type PhotoOwner = MemberId | 'group'

export interface GalleryPhoto {
  /** 고유 asset ID — 미션 정답 판별에 사용 */
  id: string
  /** 사진 주인 (멤버 ID 또는 단체) */
  owner: PhotoOwner
  src: string
  /** 사진 보기 화면에 표시되는 파일명 */
  fileName: string
  /** 이미지가 아직 없을 때 임시 이미지에 표시할 글자 */
  placeholderLabel: string
  fallback: string
}

// 순서는 사진첩/앨범에 보이는 순서 (정답이 맨 앞에 오지 않도록 섞어 둠)
export const galleryPhotos: GalleryPhoto[] = [
  {
    id: 'asset-jacket-group',
    owner: 'group',
    src: 'images/photos/jacket_group.jpg',
    fileName: 'IMG_1014_01.jpg',
    placeholderLabel: '단체',
    fallback: 'linear-gradient(135deg, #0f2c5e, #3b86f5)',
  },
  {
    id: 'asset-jacket-seungbin',
    owner: 'seungbin',
    src: 'images/photos/jacket_seungbin.jpg',
    fileName: 'IMG_1014_02.jpg',
    placeholderLabel: '승빈',
    fallback: 'linear-gradient(135deg, #1a4fa8, #9cc8ff)',
  },
  {
    id: 'asset-jacket-yunmin',
    owner: 'yunmin',
    src: 'images/photos/jacket_yunmin.jpg',
    fileName: 'IMG_1014_03.jpg',
    placeholderLabel: '윤민',
    fallback: 'linear-gradient(135deg, #2468d6, #c8e0ff)',
  },
  {
    id: 'asset-jacket-johnbekim',
    owner: 'johnbekim',
    src: 'images/photos/jacket_johnbekim.jpg',
    fileName: 'IMG_1014_04.jpg',
    placeholderLabel: '존비킴',
    fallback: 'linear-gradient(135deg, #0f2c5e, #6aa9ff)',
  },
  {
    id: 'asset-jacket-dohyun',
    owner: 'dohyun',
    src: 'images/photos/jacket_dohyun.jpg',
    fileName: 'IMG_1014_05.jpg',
    placeholderLabel: '도현',
    fallback: 'linear-gradient(135deg, #3b86f5, #e3efff)',
  },
]

export const findPhoto = (id: string | undefined) => galleryPhotos.find((p) => p.id === id)
