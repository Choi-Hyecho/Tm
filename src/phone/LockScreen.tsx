import { useEffect, useEffectEvent, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { wallpapers } from '../config/media'
import { theme } from '../config/theme'
import { lockContent } from '../content/lock'
import { useClock } from '../hooks/useClock'
import { formatClock, formatDate } from '../lib/date'
import { HomeIndicator } from './HomeIndicator'
import { NowPlaying } from './NowPlaying'
import { PasscodePad } from './PasscodePad'
import { StatusBar } from './StatusBar'
import { Wallpaper } from './Wallpaper'

const SWIPE_THRESHOLD = 60
const TAP_SLOP = 8
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface LockScreenProps {
  /** 게임 속 가상 날짜 'YYYY-MM-DD' */
  date: string
  /** 극야 발매 완료 여부 — 잠금화면 배경이 극야 단체 자켓으로 바뀜 */
  released: boolean
  onUnlock: () => void
}

export function LockScreen({ date, released, onUnlock }: LockScreenProps) {
  const cfg = theme.lockScreen
  const wallpaper = released ? wallpapers.lockScreen.afterRelease : wallpapers.lockScreen.beforeRelease
  const now = useClock()
  const [mode, setMode] = useState<'idle' | 'passcode'>('idle')
  const [padKey, setPadKey] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(0)
  const passcode = mode === 'passcode'

  function openPasscode() {
    setPadKey((k) => k + 1) // 열 때마다 입력 상태 초기화
    setMode('passcode')
    setDragY(0)
  }

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
    setDragging(false)
    const dy = e.clientY - dragStart.current
    // 위로 쓸어올리거나 가볍게 탭하면 암호 입력
    if (dy < -SWIPE_THRESHOLD || Math.abs(dy) < TAP_SLOP) openPasscode()
    else setDragY(0)
  }

  function handlePointerCancel() {
    setDragging(false)
    setDragY(0)
  }

  // 데스크톱: 아무 키나 누르면 암호 입력 화면
  const handleKey = useEffectEvent(() => openPasscode())
  useEffect(() => {
    if (passcode) return
    const listener = () => handleKey()
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [passcode])

  return (
    <div className="absolute inset-0 overflow-hidden text-white select-none">
      <Wallpaper config={wallpaper} />

      {/* 잠금화면: 시계 + 날짜 + 음악 플레이어 */}
      <div
        className="absolute inset-0 flex touch-none flex-col items-center pt-[54px]"
        inert={passcode}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: passcode ? 'translateY(-48px)' : `translateY(${dragY}px)`,
          opacity: passcode ? 0 : Math.max(0, 1 + dragY / 250),
          transition: dragging ? 'none' : `transform 350ms ${EASE}, opacity 300ms ease`,
        }}
      >
        <div className="mt-[2cqh] flex flex-col items-center" style={{ textShadow: cfg.textShadow }}>
          {cfg.showDate && (
            <p className="text-[20px] font-semibold" style={{ color: cfg.dateColor }}>
              {formatDate(date, cfg.dateFormat)}
            </p>
          )}
          {cfg.showTime && (
            <p
              className="text-[min(92px,11cqh)] leading-[1.05] font-semibold tracking-[-0.02em]"
              style={{ color: cfg.clockColor }}
            >
              {formatClock(now, theme.clockFormat)}
            </p>
          )}
        </div>

        <div className="mt-auto w-full">
          <div className="mb-[3cqh] px-[3.5cqw]">
            <NowPlaying />
          </div>
          <p className="animate-hint mb-[3cqh] text-center text-[13px] font-medium">{lockContent.swipeHint}</p>
          <div className="flex justify-between px-[12cqw] pb-[5.5cqh]">
            <QuickAction label="손전등" onPress={openPasscode}>
              <path d="M9 3h6v3l-1.5 3v10.5a1.5 1.5 0 0 1-3 0V9L9 6Z" />
              <path d="M9 6h6" />
            </QuickAction>
            <QuickAction label="카메라" onPress={openPasscode}>
              <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" />
              <circle cx="12" cy="12.5" r="3.2" />
            </QuickAction>
          </div>
        </div>
      </div>

      {/* 암호 입력 화면 */}
      <div
        className="absolute inset-0"
        inert={!passcode}
        style={{
          opacity: passcode ? 1 : 0,
          transform: passcode ? 'none' : 'scale(1.04)',
          transition: `opacity 300ms ease, transform 350ms ${EASE}`,
        }}
      >
        <Wallpaper config={wallpaper} blur={cfg.passcodeBlur} extraDim={cfg.passcodeDim} />
        <div className="relative h-full pt-[54px]">
          <PasscodePad key={padKey} active={passcode} onSuccess={onUnlock} onCancel={() => setMode('idle')} />
        </div>
      </div>

      <div className="absolute inset-x-0 top-0">
        <StatusBar variant="lock" />
      </div>
      <HomeIndicator />
    </div>
  )
}

interface QuickActionProps {
  label: string
  onPress: () => void
  children: ReactNode
}

// 손전등/카메라 — 실제 기능 대신 암호 입력 화면을 엶
function QuickAction({ label, onPress, children }: QuickActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      // 잠금화면 스와이프 처리와 겹치지 않도록 차단
      onPointerDown={(e) => e.stopPropagation()}
      className="flex size-[50px] items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-transform duration-150 active:scale-110 active:bg-white/30"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  )
}
