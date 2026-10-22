import { theme } from '../config/theme'
import { useClock } from '../hooks/useClock'
import { formatClock } from '../lib/date'

interface StatusBarProps {
  /** lock: 잠금화면처럼 시간 대신 통신사 표시 */
  variant?: 'default' | 'lock'
  color?: string
}

// 휴대폰에서는 실제 상태바(시계·배터리)와 겹치지 않도록 내용은 숨기고 높이만 비워 둠.
// 데스크톱 아이폰 프레임(desk)에서만 게임 속 상태바를 표시
export function StatusBar({ variant = 'default', color = '#ffffff' }: StatusBarProps) {
  const now = useClock()

  return (
    <div
      className="pointer-events-none invisible flex h-[54px] shrink-0 items-center justify-between px-8 pt-1 select-none desk:visible"
      style={{ color }}
    >
      {variant === 'lock' ? (
        <span className="text-[15px] font-medium">{theme.statusBar.carrier}</span>
      ) : (
        <span className="w-16 text-center text-[16px] font-semibold">{formatClock(now, theme.clockFormat)}</span>
      )}
      <div className="flex items-center gap-[6px]">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon level={theme.statusBar.battery} />
      </div>
    </div>
  )
}

function SignalIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
      <rect x="0" y="7" width="3" height="4" rx="1" />
      <rect x="4.5" y="5" width="3" height="6" rx="1" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
      <rect x="13.5" y="0" width="3" height="11" rx="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
      <path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 0 0 8 .5 10.3 10.3 0 0 0 .8 3.4L2 4.7a8.6 8.6 0 0 1 6-2.4Z" />
      <path d="M8 5.9c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 0 0 8 4.1a6.6 6.6 0 0 0-4.6 1.8l1.2 1.3A4.9 4.9 0 0 1 8 5.9Z" />
      <path d="M8 9.3c.5 0 .9.2 1.2.4L8 11.5 6.8 9.7c.3-.2.7-.4 1.2-.4Z" />
    </svg>
  )
}

function BatteryIcon({ level }: { level: number }) {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width={20 * Math.min(1, Math.max(0, level))} height="9" rx="2" fill="currentColor" />
      <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.4" />
    </svg>
  )
}
