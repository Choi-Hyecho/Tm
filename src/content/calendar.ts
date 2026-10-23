// 캘린더 앱 일정 — 정규 1집 「극야」 공식 스케줄러 + TOUCHED 활동 일정
// date: 'YYYY-MM-DD', time: 'HH:mm' (없으면 하루 종일)

export type CalendarId = 'album' | 'activity'

export interface CalendarEvent {
  date: string
  time?: string
  title: string
  /** 일정 색 (캘린더 점/막대) */
  color: string
  /** 어느 캘린더 일정인지 — 없으면 앨범 일정 */
  calendar?: CalendarId
  /** 공식 게시물 링크 (X / 유튜브) — 있으면 일정을 눌러 이동 */
  link?: string
}

const PROMO = '#3b86f5'
const RELEASE = '#ff3b30'
const ACTIVITY = '#34c759'

export const calendarContent = {
  /** 일정 아래에 보이는 캘린더 이름 */
  calendarNames: {
    album: 'TOUCHED 1st Album 「극야」',
    activity: 'TOUCHED 활동',
  } satisfies Record<CalendarId, string>,
  noEvents: '일정 없음',
  allDay: '하루 종일',
  /** 링크가 있는 일정에 보이는 문구 */
  openLink: '게시물 보러 가기',
  /** 유튜브 링크일 때 */
  openVideo: '영상 보러 가기',
  today: '오늘',
}

export const calendarEvents: CalendarEvent[] = [
  // 「극야」 공개 일정
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

  // TOUCHED 활동 일정 (공연·방송·콘텐츠)
  { date: '2026-09-12', title: '이슬라이브 페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-09-26', title: '멕시코 코리아 스팟라이트', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-03', title: '부산 락페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-04', title: '민스페스타', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-06', title: '비긴어게인 애프터 다크 녹화', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-09', title: '고스트 페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-15', title: '노매뉴얼 × 극야 콜라보 판매 시작', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-16', title: '석과 음악사이 영상 공개', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-17', title: '그랜드 민트 페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-17', title: '하이라이트 V 날짜 공개', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-20', title: '이 별 퍼포먼스 클립 업로드', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-22', title: '코스모폴리탄 화보 발매', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-22', title: '딩고 IMMERSED 공개', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-24', title: 'K-Live 페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-30', title: '넾페스타', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-31', title: '세종 보헤미안 뮤직 페스티벌', color: ACTIVITY, calendar: 'activity' },
  { date: '2026-10-31', title: '성시경의 고막남친 방영', color: ACTIVITY, calendar: 'activity' },
]
