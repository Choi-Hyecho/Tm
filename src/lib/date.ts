import type { ClockFormat } from '../config/theme'

/** 'YYYY-MM-DD'를 로컬 시간대 기준 Date로 변환 (UTC 파싱으로 날짜가 하루 밀리는 문제 방지) */
export function parseLocalDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(ymd: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('ko-KR', options).format(parseLocalDate(ymd))
}

/** iOS 스타일 시계: 12h는 '9:41', 24h는 '09:41' */
export function formatClock(date: Date, format: ClockFormat) {
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const h = format === '12h' ? String(hours % 12 || 12) : String(hours).padStart(2, '0')
  return `${h}:${minutes}`
}
