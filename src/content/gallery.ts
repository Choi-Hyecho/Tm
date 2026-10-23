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
  /** 앨범 구분 — 'polar'가 이번 정규 1집 「극야」 */
  album: string
  src: string
  /** 이미지가 아직 없을 때 임시 이미지에 표시할 글자 */
  placeholderLabel: string
  fallback: string
  /** 사진 보기 화면에 표시되는 파일명 (자동 생성) */
  fileName: string
}

type PhotoInput = Omit<GalleryPhoto, 'fileName' | 'fallback' | 'placeholderLabel'> & { placeholderLabel?: string }

const FALLBACK = 'linear-gradient(135deg, #1a4fa8, #9cc8ff)'
/** 사진 속 사람 이름 — 임시 이미지, 공유 반응 대사({owner})에 사용 */
export const PHOTO_OWNER_LABELS: Record<PhotoOwner, string> ={ yunmin: '윤민', seungbin: '승빈', dohyun: '도현', johnbekim: '존비킴', group: '단체' }

/**
 * 오래된 앨범 → 최신 앨범 순서 (폴더 순서). 같은 폴더 안은 적힌 순서대로.
 * 화면에는 최신 앨범(극야)이 맨 앞에 보이도록 뒤집어서 표시
 */
const PHOTOS_OLDEST_FIRST: PhotoInput[] = [
  { id: 'asset-album1-yunmin-5', owner: 'yunmin', album: 'album1', src: 'images/photos/1/YM5.webp' },
  { id: 'asset-album1-yunmin-6', owner: 'yunmin', album: 'album1', src: 'images/photos/1/YM6.webp' },
  { id: 'asset-album2-yunmin-1', owner: 'yunmin', album: 'album2', src: 'images/photos/2/YM1.webp' },
  { id: 'asset-album3-yunmin-3', owner: 'yunmin', album: 'album3', src: 'images/photos/3/YM3.webp' },
  { id: 'asset-album4-yunmin-2', owner: 'yunmin', album: 'album4', src: 'images/photos/4/YM2.webp' },
  { id: 'asset-album5-yunmin-4', owner: 'yunmin', album: 'album5', src: 'images/photos/5/YM4.webp' },
  // 정규 1집 「극야」 자켓
  { id: 'asset-polar-dohyun', owner: 'dohyun', album: 'polar', src: 'images/photos/polar/CD.jpg' },
  { id: 'asset-polar-seungbin', owner: 'seungbin', album: 'polar', src: 'images/photos/polar/SB.jpg' },
  { id: 'asset-polar-yunmin', owner: 'yunmin', album: 'polar', src: 'images/photos/polar/YM.jpg' },
  // 존비킴 극야 자켓, 단체 사진은 파일을 받으면 여기에 추가
]

/** 화면 표시 순서: 최신 앨범부터 (같은 앨범 안의 순서는 유지) */
export const galleryPhotos: GalleryPhoto[] = (() => {
  const withMeta = PHOTOS_OLDEST_FIRST.map((p, i) => ({
    ...p,
    placeholderLabel: p.placeholderLabel ?? PHOTO_OWNER_LABELS[p.owner],
    fallback: FALLBACK,
    fileName: `IMG_${String(2000 + i * 37).padStart(4, '0')}.${p.src.split('.').pop()}`,
  }))
  const albums = [...new Set(withMeta.map((p) => p.album))].reverse()
  return albums.flatMap((album) => withMeta.filter((p) => p.album === album))
})()

export const findPhoto = (id: string | undefined) => galleryPhotos.find((p) => p.id === id)
