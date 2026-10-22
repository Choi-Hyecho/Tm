import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { chatContent, chats, type ChatId } from '../../content/chats'
import { findPhoto } from '../../content/gallery'
import { findFile } from '../../content/gameFiles'
import { formatDate } from '../../lib/date'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { getVirtualDate } from '../../state/selectors'
import type { ChatMessage } from '../../state/types'
import { PhotoTile } from '../photos/PhotoTile'
import { PhotoViewer } from '../photos/PhotoViewer'
import { AttachmentSheet, FileIcon } from './AttachmentSheet'
import { AudioPreviewButton } from './AudioPreviewButton'
import { Avatar } from './Avatar'

const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' })
const sameMinute = (a: ChatMessage, b: ChatMessage) => Math.floor(a.at / 60_000) === Math.floor(b.at / 60_000)

interface ChatRoomProps {
  chatId: ChatId
  onBack: () => void
}

// 카카오톡 스타일 1:1 채팅방 (실제 카카오톡 서비스와 연결되지 않는 팬메이드 UI)
// 채팅방이 바뀌면 KakaoApp이 key로 새로 그리므로 첨부 메뉴/사진 보기 상태도 함께 정리됨
export function ChatRoom({ chatId, onBack }: ChatRoomProps) {
  const { state, dispatch } = useGame()
  const chat = chats[chatId]
  const { messages } = state.chats[chatId]
  const typing = state.scheduled.some((s) => s.chatId === chatId)
  const [draft, setDraft] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 채팅방에 있는 동안은 읽음 처리, 새 메시지 알림 배너 없음. 보내 둔 메시지가 있으면 상대가 이제 읽고 답장
  useEffect(() => {
    dispatch({ type: 'OPEN_CHAT', chatId, now: Date.now() })
    return () => dispatch({ type: 'CLOSE_CHAT', chatId })
  }, [chatId, dispatch])

  // 새 메시지/입력 중 표시가 생기면 맨 아래로
  useLayoutEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length, typing])

  // 모바일 키보드가 올라와 목록 높이가 줄어도 마지막 메시지가 보이도록
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(() => (list.scrollTop = list.scrollHeight))
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  function send() {
    if (!draft.trim()) return
    dispatch({ type: 'SEND_MESSAGE', chatId, text: draft, now: Date.now() })
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    // 한글 조합 중 Enter는 무시 — 마지막 글자가 두 번 전송되는 문제 방지
    if (e.nativeEvent.isComposing) return
    send()
  }

  function handleBack() {
    inputRef.current?.blur()
    dispatch({ type: 'CLOSE_CHAT', chatId })
    onBack()
  }

  function openAttach() {
    inputRef.current?.blur()
    setAttachOpen(true)
  }

  return (
    <div className="relative flex h-full flex-col bg-talk-bg text-black">
      <StatusBar color="#1c1c1e" />

      {/* 상단 바 */}
      <header className="flex h-[50px] shrink-0 items-center gap-2 pr-3 pl-1">
        <button type="button" onClick={handleBack} aria-label="뒤로가기" className="flex size-11 items-center justify-center active:opacity-40">
          <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Avatar src={chat.avatar} size={32} />
        <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold">{chat.name}</h1>
        <div className="flex items-center gap-4 text-black/80" aria-hidden>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" strokeLinecap="round" />
          </svg>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </header>

      {/* 메시지 목록 */}
      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <p className="mx-auto mt-2 w-fit max-w-full rounded-full bg-black/10 px-3 py-1 text-center text-[10.5px] text-black/55">
          {chatContent.notice}
        </p>
        <p className="mx-auto mt-3 mb-2 w-fit rounded-full bg-black/15 px-3 py-1 text-[11px] text-white">
          {formatDate(getVirtualDate(state), { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>

        {messages.map((m, i) => {
          const prev = messages[i - 1]
          const next = messages[i + 1]
          const firstOfRun = !prev || prev.from !== m.from || !sameMinute(prev, m)
          const lastOfRun = !next || next.from !== m.from || !sameMinute(next, m)
          const content = <MessageContent message={m} mine={m.from === 'me'} first={firstOfRun} onOpenPhoto={setViewingPhoto} />
          return m.from === 'me' ? (
            <MyMessage key={m.id} message={m} showTime={lastOfRun} first={firstOfRun}>
              {content}
            </MyMessage>
          ) : (
            <TheirMessage key={m.id} message={m} name={chat.name} avatar={chat.avatar} first={firstOfRun} showTime={lastOfRun}>
              {content}
            </TheirMessage>
          )
        })}

        {typing && <TypingBubble avatar={chat.avatar} name={chat.name} />}
      </div>

      {/* 입력창 — 아래 34px은 홈 인디케이터 영역 */}
      <div className="shrink-0 bg-white pb-[34px]">
        <div className="flex items-center gap-2 px-2 py-2">
          <button
            type="button"
            onClick={openAttach}
            aria-label="첨부"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-black/50 active:bg-black/5"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 4v16M4 12h16" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center rounded-full bg-[#f2f2f4] pr-1 pl-4">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatContent.inputPlaceholder}
              enterKeyHint="send"
              autoComplete="off"
              aria-label={chatContent.inputPlaceholder}
              // 16px 이상이어야 iOS가 입력 시 화면을 확대하지 않음
              className="h-9 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[15px] placeholder:text-black/35"
            />
            <button
              type="button"
              onClick={send}
              // 전송 버튼을 눌러도 키보드가 내려가지 않도록 포커스 유지
              onPointerDown={(e) => e.preventDefault()}
              disabled={!draft.trim()}
              aria-label="전송"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-talk-yellow text-black/85 transition-opacity disabled:opacity-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {attachOpen && (
        <AttachmentSheet
          onClose={() => setAttachOpen(false)}
          onSendPhoto={(id) => dispatch({ type: 'SEND_ATTACHMENT', chatId, kind: 'image', attachmentId: id, now: Date.now() })}
          onSendFile={(id) => dispatch({ type: 'SEND_ATTACHMENT', chatId, kind: 'file', attachmentId: id, now: Date.now() })}
        />
      )}
      {viewingPhoto && <PhotoViewer photoId={viewingPhoto} onClose={() => setViewingPhoto(null)} />}
    </div>
  )
}

/** 메시지 종류별 내용 — 텍스트 말풍선 / 사진 / 파일 카드 */
function MessageContent({
  message,
  mine,
  first,
  onOpenPhoto,
}: {
  message: ChatMessage
  mine: boolean
  first: boolean
  onOpenPhoto: (id: string) => void
}) {
  if (message.kind === 'image') {
    const photo = findPhoto(message.attachmentId)
    if (photo) {
      return (
        <button type="button" onClick={() => onOpenPhoto(photo.id)} aria-label="사진 크게 보기" className="active:opacity-80">
          <PhotoTile photo={photo} className="aspect-square w-[46cqw] max-w-[200px] rounded-[14px]" />
        </button>
      )
    }
  }

  if (message.kind === 'file') {
    const file = findFile(message.attachmentId)
    if (file) {
      return (
        <div className="flex w-[58cqw] max-w-[240px] items-center gap-2.5 rounded-[14px] bg-white p-3">
          <FileIcon />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold">{file.fileName}</p>
            <p className="text-[11px] text-black/45">
              {file.sizeLabel} · {file.durationLabel}
            </p>
          </div>
          <AudioPreviewButton src={file.audio} />
        </div>
      )
    }
  }

  const corner = first ? (mine ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]') : ''
  return (
    <p
      className={`max-w-[68cqw] rounded-[14px] px-3 py-[7px] text-[14px] leading-snug break-words whitespace-pre-wrap ${corner} ${
        mine ? 'bg-talk-bubble-me' : 'bg-talk-bubble-other'
      }`}
    >
      {message.text}
    </p>
  )
}

function TheirMessage({
  message,
  name,
  avatar,
  first,
  showTime,
  children,
}: {
  message: ChatMessage
  name: string
  avatar: string
  first: boolean
  showTime: boolean
  children: ReactNode
}) {
  return (
    <div className={`flex gap-2 ${first ? 'mt-3' : 'mt-1'}`}>
      <div className="w-[36px] shrink-0">{first && <Avatar src={avatar} size={36} />}</div>
      <div className="min-w-0">
        {first && <p className="mb-1 text-[11.5px] text-black/65">{name}</p>}
        <div className="flex items-end gap-1">
          {children}
          {showTime && <Time at={message.at} />}
        </div>
      </div>
    </div>
  )
}

function MyMessage({
  message,
  first,
  showTime,
  children,
}: {
  message: ChatMessage
  first: boolean
  showTime: boolean
  children: ReactNode
}) {
  const unread = message.read === false
  return (
    <div className={`flex items-end justify-end gap-1 ${first ? 'mt-3' : 'mt-1'}`}>
      {(showTime || unread) && (
        <span className="flex shrink-0 flex-col items-end leading-tight">
          {/* 상대가 아직 읽지 않음 — 채팅 목록의 안 읽은 메시지 배지와는 다른 표시 */}
          {unread && (
            <span className="text-[10.5px] font-bold text-[#e5b800]" aria-label="읽지 않음">
              1
            </span>
          )}
          {showTime && <Time at={message.at} />}
        </span>
      )}
      {children}
    </div>
  )
}

function TypingBubble({ avatar, name }: { avatar: string; name: string }) {
  return (
    <div className="mt-3 flex gap-2" aria-label={`${name} 입력 중`}>
      <Avatar src={avatar} size={36} />
      <div>
        <p className="mb-1 text-[11.5px] text-black/65">{name}</p>
        <div className="flex h-[34px] items-center gap-1 rounded-[14px] rounded-tl-[4px] bg-white px-3.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-black/35"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Time({ at }: { at: number }) {
  return <span className="shrink-0 text-[9.5px] text-black/45">{timeFormat.format(at)}</span>
}
