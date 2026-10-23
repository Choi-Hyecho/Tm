import { useState } from 'react'
import { calendarContent, calendarEvents } from '../../content/calendar'
import { parseLocalDate } from '../../lib/date'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { getVirtualDate } from '../../state/selectors'

const RED = '#ff3b30'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad(m)}`
}

// 아이폰 캘린더 스타일 — 월 보기 + 선택한 날 일정. 오늘은 게임 속 날짜
export function CalendarApp() {
  const { state } = useGame()
  const todayKey = getVirtualDate(state)
  const today = parseLocalDate(todayKey)
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState<string>(todayKey)

  const firstWeekday = new Date(month.year, month.month, 1).getDay()
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const eventsOn = (key: string) => calendarEvents.filter((e) => e.date === key)
  const selectedEvents = eventsOn(selected)
  const selectedDate = parseLocalDate(selected)

  function moveMonth(delta: number) {
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToday() {
    setMonth({ year: today.getFullYear(), month: today.getMonth() })
    setSelected(todayKey)
  }

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar color="#1c1c1e" />

      <header className="flex h-11 shrink-0 items-center justify-between px-3" style={{ color: RED }}>
        <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className="flex size-10 items-center justify-center active:opacity-50">
          <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" onClick={goToday} className="px-2 text-[15px] active:opacity-50">
          {calendarContent.today}
        </button>
        <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className="flex size-10 items-center justify-center active:opacity-50">
          <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden style={{ transform: 'scaleX(-1)' }}>
            <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <h1 className="px-4 pb-2 text-[26px] font-bold">
        {month.year}년 {month.month + 1}월
      </h1>

      {/* 요일 */}
      <div className="grid grid-cols-7 border-b border-black/10 px-2 pb-1 text-center text-[11px] text-black/45">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={i === 0 ? 'text-[#ff3b30]/70' : ''}>
            {w}
          </span>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-1 px-2 pt-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />
          const key = toKey(month.year, month.month, day)
          const isToday = key === todayKey
          const isSelected = key === selected
          const dots = eventsOn(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-label={`${month.month + 1}월 ${day}일${dots.length ? `, 일정 ${dots.length}개` : ''}`}
              className="flex flex-col items-center py-1 active:opacity-60"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-full text-[17px] ${
                  isToday ? 'font-semibold text-white' : isSelected ? 'bg-black text-white' : ''
                }`}
                style={isToday ? { background: RED } : undefined}
              >
                {day}
              </span>
              <span className="mt-0.5 flex h-1.5 gap-0.5">
                {dots.slice(0, 3).map((e) => (
                  <span key={e.title} className="size-1.5 rounded-full" style={{ background: e.color }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* 선택한 날 일정 */}
      <section className="mt-2 flex-1 overflow-y-auto border-t border-black/10 bg-[#f7f7f9] px-4 pt-3 pb-[calc(34px+var(--ui-bottom,0px))]">
        <p className="mb-2 text-[13px] font-semibold text-black/50">
          {new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(selectedDate)}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-black/35">{calendarContent.noEvents}</p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((e) => {
              const past = e.date < todayKey
              return (
                <li key={e.title} className={`flex gap-3 rounded-xl bg-white p-3 ${past ? 'opacity-50' : ''}`}>
                  <span className="w-1 shrink-0 rounded-full" style={{ background: e.color }} />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{e.title}</p>
                    <p className="text-[12px] text-black/45">
                      {formatTime(e.time)} · {calendarContent.calendarName}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
