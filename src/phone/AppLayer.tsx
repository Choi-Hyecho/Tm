import { useEffect, useEffectEvent, useRef, type PointerEvent, type ReactNode } from 'react'
import { HomeIndicator } from './HomeIndicator'

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SWIPE_THRESHOLD = 30
const TAP_SLOP = 8

interface AppLayerProps {
  /** 아이콘 중심 좌표 — 이 지점에서 앱이 확대되며 열림 */
  origin: { x: number; y: number }
  visible: boolean
  onClose: () => void
  children: ReactNode
}

export function AppLayer({ origin, visible, onClose, children }: AppLayerProps) {
  const dragStart = useRef<number | null>(null)

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return
    const dy = e.clientY - dragStart.current
    dragStart.current = null
    // 홈 인디케이터를 위로 쓸어올리거나 탭하면 홈으로
    if (dy < -SWIPE_THRESHOLD || Math.abs(dy) < TAP_SLOP) onClose()
  }

  // 데스크톱: Esc로 닫기
  const handleKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKey(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden bg-white will-change-transform"
      style={{
        transformOrigin: `${origin.x}px ${origin.y}px`,
        transform: visible ? 'scale(1)' : 'scale(0.15)',
        opacity: visible ? 1 : 0,
        borderRadius: visible ? 0 : 48,
        transition: `transform 400ms ${EASE}, opacity 250ms ease, border-radius 400ms ${EASE}`,
      }}
    >
      {children}
      <div
        aria-label="홈으로"
        className="absolute inset-x-0 bottom-0 z-40 h-[34px] touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (dragStart.current = null)}
      />
      <HomeIndicator color="#0f2c5e" />
    </div>
  )
}
