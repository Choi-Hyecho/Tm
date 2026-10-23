import { useState, type ReactNode } from 'react'
import type { OpenAppRequest } from '../renderApp'
import { staticNotes, type StaticNote } from '../../content/notes'
import { shareContent } from '../../content/share'
import { useToast } from '../../hooks/useToast'
import { ShareIcon, ShareSheet } from '../../phone/ShareSheet'
import { Toast } from '../../phone/Toast'
import { dohyunQuest } from '../../content/quests/dohyun'
import { allBlanksFilled, lyricLines } from '../../missions/lyricsCheck'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
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

// 아이폰 메모 앱 — 일반 메모(읽기 전용) + 도현이 공유한 LIAR 가사 메모(파란 빈칸에만 입력)
export function NotesApp({ noteId, onOpenApp }: NotesAppProps) {
  const { state } = useGame()
  const status = getMissionStatus(state, 'dohyun')
  // 업무 요청 메시지가 도착(공개)한 뒤부터 가사 메모가 공유됨
  const shared = status === 'active' || status === 'completed'
  const [open, setOpen] = useState<string | null>(noteId === LYRICS_NOTE && !shared ? null : (noteId ?? null))
  const staticNote = staticNotes.find((n) => n.id === open)

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar color="#1c1c1e" />
      {open === LYRICS_NOTE && shared ? (
        <LyricsNote onBack={() => setOpen(null)} onOpenApp={onOpenApp} />
      ) : staticNote ? (
        <ReadOnlyNote note={staticNote} onBack={() => setOpen(null)} />
      ) : (
        <NoteList shared={shared} onOpen={setOpen} />
      )}
    </div>
  )
}

function NoteList({ shared, onOpen }: { shared: boolean; onOpen: (id: string) => void }) {
  const { memo } = dohyunQuest
  return (
    <div className="flex-1 overflow-y-auto bg-[#f2f2f7] px-4 pb-[calc(34px+var(--ui-bottom,0px))]">
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
        {staticNotes.map((note) => (
          <li key={note.id}>
            <button type="button" onClick={() => onOpen(note.id)} className="w-full px-4 py-3 text-left active:bg-black/5">
              <p className="truncate text-[15px] font-semibold">{note.title}</p>
              <p className="mt-0.5 truncate text-[13px] text-black/45">
                {note.dateLabel} <span className="text-black/35">{note.body.split('\n').find((l) => l.trim())}</span>
              </p>
            </button>
          </li>
        ))}
      </ul>
      <p className="pt-3 text-center text-[12px] text-black/35">메모 {staticNotes.length + (shared ? 1 : 0)}개</p>
    </div>
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

/** 일반 메모 — 읽기 전용. 공유 버튼으로 카톡에 TXT로 보낼 수 있음 */
function ReadOnlyNote({ note, onBack }: { note: StaticNote; onBack: () => void }) {
  const [sharing, setSharing] = useState(false)
  const { toast, showToast } = useToast()

  return (
    <>
      <NoteHeader onBack={onBack}>
        <button
          type="button"
          onClick={() => setSharing(true)}
          aria-label={shareContent.shareButton}
          className="flex size-10 items-center justify-center active:opacity-50"
        >
          <ShareIcon />
        </button>
      </NoteHeader>
      <div className="flex-1 overflow-y-auto px-5 pb-[calc(34px+var(--ui-bottom,0px))]">
        <h1 className="text-[22px] font-bold">{note.title}</h1>
        <p className="mt-1 mb-4 text-[12px] text-black/40">{note.dateLabel}</p>
        <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{note.body}</p>
      </div>
      {sharing && (
        <ShareSheet
          item={{ kind: 'memo', id: note.id, title: note.title, preview: <NoteIcon /> }}
          onClose={() => setSharing(false)}
          onSent={(name) => showToast(shareContent.sent(name))}
        />
      )}
      <Toast {...toast} />
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
