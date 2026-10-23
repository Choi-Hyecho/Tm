// 캘린더 앱 일정 — 정규 1집 「극야」 공식 스케줄러 기준
// date: 'YYYY-MM-DD', time: 'HH:mm'

export interface CalendarEvent {
  date: string
  time: string
  title: string
  /** 일정 색 (캘린더 점/막대) */
  color: string
}

const PROMO = '#3b86f5'
const RELEASE = '#ff3b30'

export const calendarContent = {
  /** 일정 목록 위에 보이는 캘린더 이름 */
  calendarName: 'TOUCHED 1st Album 「극야」',
  noEvents: '일정 없음',
  today: '오늘',
}

export const calendarEvents: CalendarEvent[] = [
  { date: '2026-09-28', time: '00:00', title: 'Concept Photo 1', color: PROMO },
  { date: '2026-09-29', time: '00:00', title: 'Concept Photo 2', color: PROMO },
  { date: '2026-09-30', time: '00:00', title: 'Concept Photo 3', color: PROMO },
  { date: '2026-10-01', time: '00:00', title: 'Concept Photo 4', color: PROMO },
  { date: '2026-10-02', time: '00:00', title: 'Concept Photo 5', color: PROMO },
  { date: '2026-10-07', time: '00:00', title: 'Tracklist', color: PROMO },
  { date: '2026-10-12', time: '00:00', title: 'Album Preview', color: PROMO },
  { date: '2026-10-14', time: '00:00', title: 'MV Teaser', color: PROMO },
  { date: '2026-10-15', time: '12:00', title: 'Album Release', color: RELEASE },
]
