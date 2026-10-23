import { useState, type ReactNode } from 'react'
import type { OpenAppRequest } from '../renderApp'
import { notesContent } from '../../content/notes'
import { shareContent } from '../../content/share'
import { ShareIcon, ShareSheet } from '../../phone/ShareSheet'
import { dohyunQuest } from '../../content/quests/dohyun'
import { allBlanksFilled, lyricLines } from '../../missions/lyricsCheck'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { getNotes, type NoteView } from '../../state/notes'
import { getMissionStatus } from '../../state/selectors'
import { RecordingPlayer } from './RecordingPlayer'

const NOTE_YELLOW = '#e0a800'

interface NotesAppProps {
  /** 처음 열 메모 — 'lyrics': 도현이 공유한 가사 메모 (카톡 파일/+ 메뉴). 없으면 목록 */
  noteId?: string
  /** 다른 앱으로 이동 — 전송 후 도현 채팅방으로 */
  onOpenApp: (request: OpenAppRequest) => void
}

const LYRICS_NOTE = 'lyrics'

// 아이폰 메모 앱 — 일반 메모(직접 만들고 고칠 수 있음) + 도현이 공유한 LIAR 가사 메모(파란 빈칸에만 입력)
export function NotesApp({ noteId, onOpenApp }: NotesAppProps) {
  const { state, dispatch } = useGame()
  const status = getMissionStatus(state, 'dohyun')
  // 업무 요청 메시지가 도착(공개)한 뒤부터 가사 메모가 공유됨
  const shared = status === 'active' || status === 'completed'
  const [open, setOpen] = useState<string | null>(noteId === LYRICS_NOTE && !shared ? null : (noteId ?? null))
  const notes = getNotes(state)
  const note = notes.find((n) => n.id === open)

  function createNote() {
    const id = `note-${Date.now()}`
    dispatch({ type: 'CREATE_NOTE', id, now: Date.now() })
    setOpen(id)
  }

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar color="#1c1c1e" />
      {open === LYRICS_NOTE && shared ? (
        <LyricsNote onBack={() => setOpen(null)} onOpenApp={onOpenApp} />
      ) : note ? (
        <NoteEditor key={note.id} note={note} autoFocus={note.mine && !note.body} onBack={() => setOpen(null)} />
      ) : (
        <NoteList notes={notes} shared={shared} onOpen={setOpen} onCreate={createNote} />
      )}
    </div>
  )
}

interface NoteListProps {
  notes: NoteView[]
  shared: boolean
  onOpen: (id: string) => void
  onCreate: () => void
}

function NoteList({ notes, shared, onOpen, onCreate }: NoteListProps) {
  const { memo } = dohyunQuest
  // 목록 미리보기 — 제목 다음 줄
  const preview = (note: NoteView) => {
    const lines = note.body.split('\n').filter((l) => l.trim())
    return (note.mine ? lines[1] : lines[0]) ?? ''
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-[#f2f2f7] px-4 pb-4">
        <h1 className="pt-2 pb-3 text-[30px] font-bold">{memo.listTitle}</h1>
        <ul className="divide-y divide-black/5 overflow-hidden rounded-xl bg-white">
          {shared && (
            <li>
              <button type="button" onClick={() => onOpen(LYRICS_NOTE)} className="w-full px-4 py-3 text-left active:bg-black/5">
                <p className="truncate text-[15px] font-semibold">{dohyunQuest.memoTitle}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-black/45">
                  <SharedIcon /> 채도현님이 공유함
                </p>
              </button>
            </li>
          )}
          {notes.map((note) => (
            <li key={note.id}>
              <button type="button" onClick={() => onOpen(note.id)} className="w-full px-4 py-3 text-left active:bg-black/5">
                <p className="truncate text-[15px] font-semibold">{note.title}</p>
                <p className="mt-0.5 truncate text-[13px] text-black/45">
                  {note.dateLabel} <span className="text-black/35">{preview(note)}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* 아래 도구 막대 — 메모 개수 + 새 메모 */}
      <div className="relative box-content flex h-11 shrink-0 items-center justify-center bg-[#f2f2f7] pb-[calc(34px+var(--ui-bottom,0px))]">
        <p className="text-[12px] text-black/45">메모 {notes.length + (shared ? 1 : 0)}개</p>
        <button
          type="button"
          onClick={onCreate}
          aria-label={notesContent.newNote}
          className="absolute top-0.5 right-3 flex size-10 items-center justify-center active:opacity-50"
          style={{ color: NOTE_YELLOW }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
            <path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    </>
  )
}

function NoteHeader({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between px-2" style={{ color: NOTE_YELLOW }}>
      <button type="button" onClick={onBack} className="flex items-center gap-1 px-1 text-[16px] active:opacity-50">
        <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
          <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {dohyunQuest.memo.listTitle}
      </button>
      {children}
    </header>
  )
}

/**
 * 일반 메모 — 바로 입력해서 고침(자동 저장). 내가 만든 메모는 첫 줄이 제목, 기본 메모는 제목 고정.
 * 공유 버튼으로 카톡에 TXT로 보낼 수 있음. 내가 만든 메모만 삭제 가능, 비워 두고 나가면 자동 삭제
 */
function NoteEditor({ note, autoFocus, onBack }: { note: NoteView; autoFocus: boolean; onBack: () => void }) {
  const { dispatch } = useGame()
  const [sharing, setSharing] = useState(false)

  function back() {
    if (note.mine && !note.body.trim()) dispatch({ type: 'DELETE_NOTE', id: note.id })
    onBack()
  }

  function remove() {
    dispatch({ type: 'DELETE_NOTE', id: note.id })
    onBack()
  }

  return (
    <>
      <NoteHeader onBack={back}>
        <div className="flex items-center">
          {note.mine && (
            <button type="button" onClick={remove} aria-label={notesContent.deleteNote} className="flex size-10 items-center justify-center active:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSharing(true)}
            disabled={!note.body.trim()}
            aria-label={shareContent.shareButton}
            className="flex size-10 items-center justify-center active:opacity-50 disabled:opacity-30"
          >
            <ShareIcon />
          </button>
        </div>
      </NoteHeader>
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-[calc(34px+var(--ui-bottom,0px))]">
        {!note.mine && <h1 className="text-[22px] font-bold">{note.title}</h1>}
        <p className="mt-1 mb-3 text-[12px] text-black/40">{note.dateLabel}</p>
        <textarea
          value={note.body}
          onChange={(e) => dispatch({ type: 'UPDATE_NOTE', id: note.id, body: e.target.value, now: Date.now() })}
          placeholder={notesContent.placeholder}
          aria-label={note.title}
          autoFocus={autoFocus}
          // 16px 이상이어야 iOS가 입력 시 화면을 확대하지 않음
          className="min-h-[60%] w-full flex-1 resize-none bg-transparent text-[16px] leading-relaxed outline-none placeholder:text-black/30"
        />
      </div>
      {sharing && (
        <ShareSheet
          item={{ kind: 'memo', id: note.id, title: note.title, preview: <NoteIcon /> }}
          onClose={() => setSharing(false)}
        />
      )}
    </>
  )
}

function NoteIcon() {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#fff3c4] text-[11px] font-bold text-[#a07800]" aria-hidden>
      TXT
    </span>
  )
}

function LyricsNote({ onBack, onOpenApp }: { onBack: () => void; onOpenApp: (request: OpenAppRequest) => void }) {
  const { state, dispatch } = useGame()
  const { inputs, submissions } = state.lyrics
  const { memo } = dohyunQuest
  const done = getMissionStatus(state, 'dohyun') === 'completed'
  const canSend = !done && allBlanksFilled(inputs)

  function send() {
    if (!canSend) return
    dispatch({ type: 'SUBMIT_LYRICS', now: Date.now() })
    // 전송한 파일이 보이도록 도현 채팅방으로
    onOpenApp({ id: 'kakaotalk', chatId: 'dohyun' })
  }

  return (
    <>
      <NoteHeader onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <h1 className="text-[22px] font-bold">{dohyunQuest.memoTitle}</h1>
        <p className="mt-1 mb-4 flex items-center gap-1.5 text-[12px] text-black/40">
          <SharedIcon /> 채도현님이 공유함
          {submissions.length > 0 && ` · ${submissions.length}번 전송함`}
        </p>

        {/* 가사 — 파란 빈칸에만 입력 가능, 나머지 글자는 수정 불가 */}
        <div className="text-[16px] leading-[2.1]">
          {lyricLines.map((line, i) => (
            <p key={i} className="min-h-[1.5em] break-keep">
              {line.map((segment, j) =>
                segment.type === 'text' ? (
                  <span key={j}>{segment.text}</span>
                ) : (
                  <BlankInput
                    key={segment.id}
                    id={segment.id}
                    value={inputs[segment.id] ?? ''}
                    disabled={done}
                    onChange={(value) => dispatch({ type: 'SET_LYRIC_INPUT', blankId: segment.id, value })}
                  />
                ),
              )}
            </p>
          ))}
        </div>

        <RecordingPlayer />
      </div>

      <div className="shrink-0 border-t border-black/5 px-4 pt-3 pb-[calc(34px+var(--ui-bottom,0px))]">
        {done ? (
          <p className="py-3 text-center text-[15px] font-semibold text-ice-600">{memo.done}</p>
        ) : (
          <>
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="w-full rounded-xl py-3 text-[15px] font-semibold text-white transition-opacity disabled:opacity-35"
              style={{ background: NOTE_YELLOW }}
            >
              {memo.sendButton}
            </button>
            {!canSend && <p className="mt-2 text-center text-[12px] text-black/40">{memo.fillAllFirst}</p>}
          </>
        )}
      </div>
    </>
  )
}

interface BlankInputProps {
  id: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

/** 파란 형광펜 빈칸 — 실제 입력칸이라 한글 키보드로 직접 입력. 입력 중에는 채점하지 않음 */
function BlankInput({ id, value, disabled, onChange }: BlankInputProps) {
  return (
    <input
      aria-label={`빈칸 ${id.replace('blank-', '')}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="next"
      // 16px 이상이어야 iOS가 입력 시 화면을 확대하지 않음. 글자 수에 맞춰 폭이 늘어남
      className="mx-0.5 rounded-[4px] bg-[#bcdcff] px-1 text-center text-[16px] text-[#0b3d91] caret-[#0b3d91] outline-none focus:bg-[#9ccaff] focus:ring-2 focus:ring-[#4a8ef0]/40 disabled:bg-[#dbeaff]"
      style={{ width: `${Math.max(2.5, [...value].length + 1)}em` }}
    />
  )
}

function SharedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.3c1.8.8 3 2.7 3 5.7" strokeLinecap="round" />
    </svg>
  )
}
