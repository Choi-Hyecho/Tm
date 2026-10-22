import { useState } from 'react'
import type { AppDef } from '../../config/apps'
import { assetUrl } from '../../lib/asset'
import { parseLocalDate } from '../../lib/date'
import { u } from '../../lib/units'
import { getVirtualDate } from '../../state/selectors'
import { useGame } from '../../state/context'

interface AppIconProps {
  app: AppDef
  badge?: number
  showLabel?: boolean
  onPress: (app: AppDef, el: HTMLElement) => void
}

export function AppIcon({ app, badge = 0, showLabel = true, onPress }: AppIconProps) {
  return (
    <button
      type="button"
      aria-label={app.name}
      onClick={(e) => onPress(app, e.currentTarget)}
      className="group flex min-w-0 flex-col items-center"
    >
      <div
        className="relative transition-[transform,filter] duration-150 group-active:scale-90 group-active:brightness-75"
        style={{ width: u(15.4), height: u(15.4) }}
      >
        <IconTile app={app} />
        {badge > 0 && <Badge count={badge} />}
      </div>
      {showLabel && (
        <span
          className="w-full truncate text-center leading-tight font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
          style={{ fontSize: u(3.05), marginTop: u(1.4) }}
        >
          {app.name}
        </span>
      )}
    </button>
  )
}

const ICON_RADIUS = '22.5%'

export function IconTile({ app }: { app: AppDef }) {
  const [failed, setFailed] = useState(false)

  if (app.builtinIcon === 'calendar') return <CalendarIcon />
  if (app.builtinIcon === 'todo') return <TodoIcon />

  if (app.icon && !failed) {
    return (
      <img
        src={assetUrl(app.icon)}
        alt=""
        draggable={false}
        onError={() => setFailed(true)}
        className="size-full object-cover shadow-sm"
        style={{ borderRadius: ICON_RADIUS }}
      />
    )
  }

  // 공식 아이콘 파일이 없을 때 — 로고 대신 이름 글자만 표시하는 임시 아이콘
  const { background, color, text } = app.placeholder
  return (
    <div
      className="flex size-full items-center justify-center overflow-hidden px-[6%] text-center leading-none font-bold shadow-sm"
      style={{ borderRadius: ICON_RADIUS, background, color, fontSize: text.length > 3 ? u(2.9) : u(3.6) }}
    >
      {text}
    </div>
  )
}

/** iOS 캘린더처럼 게임 속 날짜를 그대로 표시 */
function CalendarIcon() {
  const { state } = useGame()
  const date = parseLocalDate(getVirtualDate(state))
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(date)

  return (
    <div
      className="flex size-full flex-col items-center bg-white leading-none shadow-sm"
      style={{ borderRadius: ICON_RADIUS, paddingTop: u(1.9) }}
    >
      <span className="font-semibold text-[#ff3b30]" style={{ fontSize: u(2.6) }}>
        {weekday}
      </span>
      <span className="font-light text-black" style={{ fontSize: u(9.4), marginTop: u(0.3) }}>
        {date.getDate()}
      </span>
    </div>
  )
}

/** 게임 전용 TODO 앱 아이콘 */
function TodoIcon() {
  return (
    <div
      className="flex size-full items-center justify-center bg-gradient-to-b from-ice-400 to-ice-600 shadow-sm"
      style={{ borderRadius: ICON_RADIUS }}
    >
      <svg viewBox="0 0 24 24" className="size-[58%]" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="5" cy="6.5" r="1.6" fill="#fff" stroke="none" />
        <circle cx="5" cy="12" r="1.6" fill="#fff" stroke="none" />
        <circle cx="5" cy="17.5" r="1.6" fill="#fff" stroke="none" />
        <path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H16" />
      </svg>
    </div>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-full bg-[#ff3b30] font-semibold text-white tabular-nums"
      style={{
        top: u(-1.6),
        right: u(-1.6),
        minWidth: u(5.8),
        height: u(5.8),
        paddingInline: u(1.4),
        fontSize: u(3.5),
      }}
    >
      {count}
    </span>
  )
}
