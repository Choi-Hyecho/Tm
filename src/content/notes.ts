// 메모 앱의 일반 메모 (읽기 전용) — 도현의 가사 메모는 quests/dohyun.ts
import { calendarEvents } from './calendar'

/** 메모 앱 문구 (가사 메모 문구는 quests/dohyun.ts) */
export const notesContent = {
  /** 내용이 없는 메모의 제목 */
  untitled: '새로운 메모',
  newNote: '새로운 메모',
  deleteNote: '메모 삭제',
  done: '완료',
  placeholder: '메모를 입력하세요',
}

export interface StaticNote {
  id: string
  title: string
  /** 목록에 보이는 날짜/시간 */
  dateLabel: string
  body: string
}

// 캘린더 일정에서 자동으로 만듦 — 일정을 고치면 이 메모도 같이 바뀜
const timetableBody = [
  '정규 1집 「극야」 공개 일정',
  '',
  ...calendarEvents.filter((e) => (e.calendar ?? 'album') === 'album').map((e) => {
    const [, m, d] = e.date.split('-').map(Number)
    return `${m}/${d} ${e.time}  ${e.title}`
  }),
].join('\n')

export const staticNotes: StaticNote[] = [
  {
    id: 'timetable',
    title: '극야 공개 타임테이블',
    dateLabel: '어제',
    body: timetableBody,
  },
  {
    id: 'athome',
    title: 'At Home',
    dateLabel: '오전 8:12',
    body: ['출근 중인데 집에 가고 싶다…', '아직 회사 도착도 안 했는데', '', '오늘 할 일', '- 출근', '- 퇴근'].join('\n'),
  },
]
