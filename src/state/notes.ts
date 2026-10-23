// 메모 앱의 일반 메모 — 기본 메모(content/notes.ts, 고친 내용 반영) + 사용자가 만든 메모. 도현의 가사 메모는 따로
import { notesContent, staticNotes } from '../content/notes'
import type { GameState } from './types'

export interface NoteView {
  id: string
  title: string
  body: string
  /** 사용자가 만든 메모 — 삭제 가능, 첫 줄이 제목 */
  mine: boolean
  /** 목록/메모 위에 보이는 날짜 — 고친 적 없는 기본 메모는 content의 dateLabel */
  dateLabel: string
  /** 정렬용 (최근에 고친 것부터) */
  updatedAt: number
}

const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' })

/** 첫 줄(빈 줄 제외)이 제목 — 비어 있으면 '새로운 메모' */
export const noteTitle = (body: string) => body.split('\n').find((l) => l.trim())?.trim() || notesContent.untitled

/** 목록 순서: 최근에 만들거나 고친 메모가 위로, 고친 적 없는 기본 메모는 그 아래 원래 순서 */
export function getNotes(state: GameState): NoteView[] {
  const mine: NoteView[] = state.userNotes.map((n) => ({
    id: n.id,
    title: noteTitle(n.body),
    body: n.body,
    mine: true,
    dateLabel: timeFormat.format(n.updatedAt),
    updatedAt: n.updatedAt,
  }))
  const builtIn: NoteView[] = staticNotes.map((n) => {
    const edit = state.noteEdits[n.id]
    return {
      id: n.id,
      title: n.title,
      body: edit?.body ?? n.body,
      mine: false,
      dateLabel: edit ? timeFormat.format(edit.updatedAt) : n.dateLabel,
      updatedAt: edit?.updatedAt ?? 0,
    }
  })
  return [...mine, ...builtIn].sort((a, b) => b.updatedAt - a.updatedAt)
}

export const findNote = (state: GameState, id: string) => getNotes(state).find((n) => n.id === id)
