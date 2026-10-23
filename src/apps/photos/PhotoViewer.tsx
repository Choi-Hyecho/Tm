import { useEffect, useEffectEvent, useRef, useState, type PointerEvent } from 'react'
import { findPhoto } from '../../content/gallery'
import { shareContent } from '../../content/share'
import { useToast } from '../../hooks/useToast'
import { ShareIcon, ShareSheet } from '../../phone/ShareSheet'
import { StatusBar } from '../../phone/StatusBar'
import { Toast } from '../../phone/Toast'
import { PhotoTile } from './PhotoTile'

const SWIPE_THRESHOLD = 50
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface PhotoViewerProps {
  /** 좌우로 넘겨 볼 사진들 (순서대로) */
  photoIds: string[]
  initialId: string
  onClose: () => void
}

// 아이폰 사진 앱처럼 흰 배경 + 좌우 스와이프로 이전/다음 사진. 사진첩 앱과 카카오톡 사진 메시지가 함께 사용
export function PhotoViewer({ photoIds, initialId, onClose }: PhotoViewerProps) {
  const photos = photoIds.map(findPhoto).filter((p) => p !== undefined)
  const [index, setIndex] = useState(() => Math.max(0, photos.findIndex((p) => p.id === initialId)))
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  const [sharing, setSharing] = useState(false)
  const { toast, showToast } = useToast()

  const go = (delta: number) => setIndex((i) => Math.min(photos.length - 1, Math.max(0, i + delta)))

  // 데스크톱: ←/→로 넘기기, Esc로 닫기
  const handleKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKey(e)
    window.addEventListener('keydown', listener, true)
    return () => window.removeEventListener('keydown', listener, true)
  }, [])

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    start.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    let dx = e.clientX - start.current.x
    // 처음/마지막 사진에서는 살짝만 끌리게
    if ((index === 0 && dx > 0) || (index === photos.length - 1 && dx < 0)) dx /= 3
    setDragX(dx)
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setDragging(false)
    const dx = e.clientX - start.current.x
    if (dx < -SWIPE_THRESHOLD) go(1)
    else if (dx > SWIPE_THRESHOLD) go(-1)
    setDragX(0)
  }

  const current = photos[index]
  if (!current) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white text-black" role="dialog" aria-label="사진 보기">
      <StatusBar color="#000000" />
      <div className="flex h-11 shrink-0 items-center justify-between px-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-10 items-center gap-0.5 px-2 text-[16px] text-[#007aff] active:opacity-50"
        >
          <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center leading-tight">
          <p className="text-[14px] font-semibold">{current.fileName}</p>
          <p className="text-[11px] text-black/45">
            {index + 1} / {photos.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSharing(true)}
          aria-label={shareContent.shareButton}
          className="flex size-10 items-center justify-center text-[#007aff] active:opacity-50"
        >
          <ShareIcon />
        </button>
      </div>

      {/* 사진 트랙 — 손가락을 따라 움직이고 놓으면 이전/다음으로 */}
      <div
        className="relative flex-1 touch-none overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setDragging(false)
          setDragX(0)
        }}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: dragging ? 'none' : `transform 320ms ${EASE}`,
          }}
        >
          {photos.map((p, i) => (
            <div key={p.id} className="flex h-full w-full shrink-0 items-center justify-center">
              {/* 지금 사진과 양옆 사진만 불러옴 */}
              {Math.abs(i - index) <= 1 && <PhotoTile photo={p} fit="contain" className="h-full w-full" />}
            </div>
          ))}
        </div>
      </div>

      <div className="h-[calc(34px+var(--ui-bottom,0px))] shrink-0" />

      {sharing && (
        <ShareSheet
          item={{
            kind: 'image',
            id: current.id,
            title: current.fileName,
            preview: <PhotoTile photo={current} className="size-11 shrink-0 rounded-lg" />,
          }}
          onClose={() => setSharing(false)}
          onSent={(name) => showToast(shareContent.sent(name))}
        />
      )}
      <Toast {...toast} />
    </div>
  )
}
