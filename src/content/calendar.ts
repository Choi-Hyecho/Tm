// 캘린더 앱 일정 — 정규 1집 「극야」 공식 스케줄러 기준
// date: 'YYYY-MM-DD', time: 'HH:mm'

export interface CalendarEvent {
  date: string
  time: string
  title: string
  /** 일정 색 (캘린더 점/막대) */
  color: string
  /** 공식 게시물 링크 (X / 유튜브) — 있으면 일정을 눌러 이동 */
  link?: string
}

const PROMO = '#3b86f5'
const RELEASE = '#ff3b30'

export const calendarContent = {
  /** 일정 목록 위에 보이는 캘린더 이름 */
  calendarName: 'TOUCHED 1st Album 「극야」',
  noEvents: '일정 없음',
  /** 링크가 있는 일정에 보이는 문구 */
  openLink: '게시물 보러 가기',
  /** 유튜브 링크일 때 */
  openVideo: '영상 보러 가기',
  today: '오늘',
}

export const calendarEvents: CalendarEvent[] = [
  { date: '2026-09-21', time: '00:00', title: 'Mood Film', color: PROMO, link: 'https://youtu.be/DpLT4rKATdI' },
  { date: '2026-09-28', time: '00:00', title: 'Concept Photo 1', color: PROMO, link: 'https://x.com/band_touched/status/2104224549617422606' },
  { date: '2026-09-29', time: '00:00', title: 'Concept Photo 2', color: PROMO, link: 'https://x.com/band_touched/status/2104586944718033159' },
  { date: '2026-09-30', time: '00:00', title: 'Concept Photo 3', color: PROMO, link: 'https://x.com/band_touched/status/2104949324690108611' },
  { date: '2026-10-01', time: '00:00', title: 'Concept Photo 4', color: PROMO, link: 'https://x.com/band_touched/status/2105311725843083543' },
  { date: '2026-10-02', time: '00:00', title: 'Concept Photo 5', color: PROMO, link: 'https://x.com/band_touched/status/2105674101947802000' },
  { date: '2026-10-07', time: '00:00', title: 'Tracklist', color: PROMO, link: 'https://x.com/band_touched/status/2107486046254420325' },
  { date: '2026-10-12', time: '00:00', title: 'Album Preview', color: PROMO, link: 'https://youtu.be/HljYmFwM-24' },
  { date: '2026-10-14', time: '00:00', title: 'MV Teaser', color: PROMO, link: 'https://youtu.be/nFbKRVik5z0' },
  // 타이틀곡 'Fallen Angel' 공식 뮤직비디오 — 발매와 같은 시각 공개
  { date: '2026-10-15', time: '12:00', title: 'Album Release', color: RELEASE, link: 'https://youtu.be/Cj3QAPorkgI' },
]
