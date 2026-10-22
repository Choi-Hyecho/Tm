import type { GalleryPhoto } from '../../content/gallery'
import { FallbackImage } from '../messenger/FallbackImage'

// 사진 한 장 — 이미지가 아직 없으면 임시 이미지(placeholderLabel) 표시
export function PhotoTile({ photo, className = '' }: { photo: GalleryPhoto; className?: string }) {
  return (
    <FallbackImage src={photo.src} fallback={photo.fallback} className={`justify-center ${className}`}>
      <span className="flex flex-col items-center gap-1 text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m4 17 5-5 4 4 3-3 4 4" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] font-semibold">{photo.placeholderLabel}</span>
      </span>
    </FallbackImage>
  )
}
