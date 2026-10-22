import { useEffect, useEffectEvent, useRef, useState, type PointerEvent } from 'react'
import { apps } from '../config/apps'
import { chatContent } from '../content/chats'
import { IconTile } from './home/AppIcon'

const AUTO_HIDE_MS = 6000
const EXIT_MS = 350
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface NotificationBannerProps {
  sender: string
  message: string
  /** 배너를 눌렀을 때 — el은 앱 열림 애니메이션 시작 위치 */
  onOpen: (el: HTMLElement) => void
  /** 시간이 지나거나 위로 밀어 닫았을 때 */
  onDismiss: () => void
}

// 웹페이지 안에서만 보이는 가상 알림 (실제 푸시 알림 권한 사용 안 함)
export function NotificationBanner({ sender, message, onOpen, onDismiss }: NotificationBannerProps) {
  const [shown, setShown] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(0)
  const exitTimer = useRef<number>(undefined)

  function hide() {
    setShown(false)
    exitTimer.current = window.setTimeout(onDismiss, EXIT_MS)
  }
  const autoHide = useEffectEvent(() => hide())

  useEffect(() => {
    // 숨긴 위치에서 먼저 그린 뒤 내려오도록 다음 프레임에 표시
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    const timer = window.setTimeout(() => autoHide(), AUTO_HIDE_MS)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.clearTimeout(exitTimer.current)
    }
  }, [])

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientY
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setDragY(Math.min(0, e.clientY - dragStart.current))
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const dy = e.clientY - dragStart.current
    setDragging(false)
    setDragY(0)
    if (dy < -24) hide() // 위로 밀어서 닫기
    else if (Math.abs(dy) < 8) onOpen(e.currentTarget)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-2 pt-2 desk:pt-[50px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${chatContent.appName} ${sender}: ${message}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setDragging(false)
          setDragY(0)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen(e.currentTarget)
        }}
        className="pointer-events-auto flex touch-none items-center gap-3 rounded-[22px] bg-white/80 py-3 pr-4 pl-3 text-black shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl backdrop-saturate-150 select-none active:bg-white/90"
        style={{
          transform: shown ? `translateY(${dragY}px)` : 'translateY(calc(-100% - 60px))',
          opacity: shown ? 1 : 0.6,
          transition: dragging ? 'none' : `transform ${EXIT_MS + 150}ms ${EASE}, opacity 300ms ease`,
        }}
      >
        <div className="size-[38px] shrink-0">
          <IconTile app={apps.kakaotalk} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[14px] font-semibold">{sender}</p>
            <span className="shrink-0 text-[12px] text-black/45">{chatContent.justNow}</span>
          </div>
          <p className="line-clamp-2 text-[14px] leading-snug text-black/85">{message}</p>
          <p className="mt-0.5 text-[11px] text-black/40">{chatContent.appName}</p>
        </div>
      </div>
    </div>
  )
}
