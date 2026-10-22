import { findPhoto } from '../../content/gallery'
import { PhotoTile } from './PhotoTile'

// 사진 확대 보기 — 사진첩 앱과 카카오톡 사진 메시지가 함께 사용
export function PhotoViewer({ photoId, onClose }: { photoId: string; onClose: () => void }) {
  const photo = findPhoto(photoId)
  if (!photo) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-black text-white" role="dialog" aria-label="사진 보기">
      <div className="flex h-[54px] shrink-0 items-end justify-between px-4 pb-1">
        <button type="button" onClick={onClose} aria-label="닫기" className="flex size-10 items-center justify-center active:opacity-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
        <span className="pb-2.5 text-[13px] text-white/70">{photo.fileName}</span>
        <span className="size-10" />
      </div>
      <button type="button" onClick={onClose} className="flex flex-1 items-center justify-center p-2" aria-label="닫기">
        <PhotoTile photo={photo} className="aspect-square w-full object-contain" />
      </button>
      <div className="h-[34px] shrink-0" />
    </div>
  )
}
