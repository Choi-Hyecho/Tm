import { useEffect, useRef, useState, type ReactNode } from 'react'
import { chatContent } from '../../content/chats'
import { findPhoto, galleryPhotos } from '../../content/gallery'
import { findFile } from '../../content/gameFiles'
import { filesContent } from '../../content/share'
import { useGame } from '../../state/context'
import { PhotoTile } from '../photos/PhotoTile'
import { AudioPreviewButton } from './AudioPreviewButton'

const SLIDE_MS = 280
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

type View = 'menu' | 'album' | 'files'

interface AttachmentSheetProps {
  onClose: () => void
  /** 전송 버튼을 눌렀을 때만 호출 — 선택/미리보기는 게임 상태를 바꾸지 않음 */
  onSendPhoto: (photoId: string) => void
  onSendFile: (fileId: string) => void
  /** '메모' — 게임 속 메모 앱으로 이동 */
  onOpenNotes: () => void
}

// 카카오톡 '+' 첨부 메뉴 — 게임 안에 등록된 사진/파일만 사용 (기기 사진·파일 접근 없음)
export function AttachmentSheet({ onClose, onSendPhoto, onSendFile, onOpenNotes }: AttachmentSheetProps) {
  const [view, setView] = useState<View>('menu')
  const [shown, setShown] = useState(false)
  const closeTimer = useRef<number>(undefined)

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  function close(after?: () => void) {
    setShown(false)
    closeTimer.current = window.setTimeout(() => {
      after?.()
      onClose()
    }, SLIDE_MS)
  }

  const full = view !== 'menu'

  return (
    <div className="absolute inset-0 z-30">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ opacity: shown ? 1 : 0, transition: `opacity ${SLIDE_MS}ms ease` }}
        onClick={() => close()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="첨부"
        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[20px] bg-white text-black"
        style={{
          height: full ? '88%' : undefined,
          transform: shown ? 'none' : 'translateY(100%)',
          transition: `transform ${SLIDE_MS}ms ${EASE}`,
        }}
      >
        {view === 'menu' && (
          <Menu
            onSelect={(item) => (item === 'notes' ? close(onOpenNotes) : setView(item))}
            onCancel={() => close()}
          />
        )}
        {view === 'album' && (
          <AlbumPicker onBack={() => setView('menu')} onSend={(id) => close(() => onSendPhoto(id))} />
        )}
        {view === 'files' && <FilePicker onBack={() => setView('menu')} onSend={(id) => close(() => onSendFile(id))} />}
      </div>
    </div>
  )
}

/** 첨부 메뉴 항목 — 카메라처럼 아직 준비 중인 항목은 available: false */
type MenuItemId = 'album' | 'files' | 'notes' | 'camera'

const MENU_ITEMS: { id: MenuItemId; label: string; color: string; available: boolean; icon: ReactNode }[] = [
  {
    id: 'album',
    label: chatContent.attach.album,
    color: '#5ac26a',
    available: true,
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 17 5-5 4 4 3-3 4 4" />
      </>
    ),
  },
  {
    id: 'files',
    label: chatContent.attach.file,
    color: '#4a8ef0',
    available: true,
    icon: <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5" />,
  },
  {
    id: 'notes',
    label: chatContent.attach.notes,
    color: '#e0a800',
    available: true,
    icon: (
      <>
        <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
        <path d="M8 8.5h8M8 12h8M8 15.5h5" />
      </>
    ),
  },
  {
    id: 'camera',
    label: chatContent.attach.camera,
    color: '#9aa3ad',
    available: false,
    icon: (
      <>
        <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" />
        <circle cx="12" cy="12.5" r="3.2" />
      </>
    ),
  },
]

function Menu({ onSelect, onCancel }: { onSelect: (item: Exclude<MenuItemId, 'camera'>) => void; onCancel: () => void }) {
  return (
    <div className="pb-[calc(34px+var(--ui-bottom,0px))]">
      <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-black/15" aria-hidden />
      <div className="grid grid-cols-4 gap-2 px-4 pt-5 pb-4">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!item.available}
            onClick={() => item.id !== 'camera' && onSelect(item.id)}
            className="flex flex-col items-center gap-1.5 active:opacity-60 disabled:opacity-45"
          >
            <span className="flex size-14 items-center justify-center rounded-full text-white" style={{ background: item.color }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                {item.icon}
              </svg>
            </span>
            <span className="text-[12.5px]">{item.label}</span>
            {!item.available && <span className="-mt-1 text-[10px] text-black/40">{chatContent.attach.comingSoon}</span>}
          </button>
        ))}
      </div>
      <div className="px-4">
        <button type="button" onClick={onCancel} className="w-full rounded-xl bg-black/5 py-3 text-[15px] font-medium active:bg-black/10">
          {chatContent.attach.cancel}
        </button>
      </div>
    </div>
  )
}

function SheetHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center border-b border-black/5 px-2">
      <button type="button" onClick={onBack} aria-label="뒤로" className="flex size-10 items-center justify-center active:opacity-40">
        <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
          <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2 className="flex-1 text-center text-[15px] font-semibold">{title}</h2>
      <span className="size-10" />
    </div>
  )
}

function SendBar({ onReselect, onSend }: { onReselect: () => void; onSend: () => void }) {
  return (
    <div className="flex shrink-0 gap-2 border-t border-black/5 px-4 pt-3 pb-[calc(34px+var(--ui-bottom,0px))]">
      <button type="button" onClick={onReselect} className="flex-1 rounded-xl bg-black/5 py-3 text-[14px] font-medium active:bg-black/10">
        {chatContent.attach.reselect}
      </button>
      <button type="button" onClick={onSend} className="flex-1 rounded-xl bg-talk-yellow py-3 text-[14px] font-semibold active:brightness-95">
        {chatContent.attach.send}
      </button>
    </div>
  )
}

function AlbumPicker({ onBack, onSend }: { onBack: () => void; onSend: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const photo = findPhoto(selected ?? undefined)

  // 선택한 사진 미리보기 → 전송해야만 채팅방에 사진 메시지 생성
  if (photo) {
    return (
      <>
        <SheetHeader title={chatContent.attach.album} onBack={() => setSelected(null)} />
        <div className="flex flex-1 items-center justify-center bg-black/[0.03] p-4">
          <PhotoTile photo={photo} className="aspect-square w-full max-w-[320px] rounded-2xl shadow-md" />
        </div>
        <SendBar onReselect={() => setSelected(null)} onSend={() => onSend(photo.id)} />
      </>
    )
  }

  return (
    <>
      <SheetHeader title={chatContent.attach.album} onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-[calc(34px+var(--ui-bottom,0px))]">
        <div className="grid grid-cols-3 gap-0.5">
          {galleryPhotos.map((p) => (
            <button key={p.id} type="button" onClick={() => setSelected(p.id)} aria-label={p.fileName} className="active:opacity-70">
              <PhotoTile photo={p} className="aspect-square w-full" />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

/** 파일 앱에 저장한 파일 중에서 고르기 */
function FilePicker({ onBack, onSend }: { onBack: () => void; onSend: (id: string) => void }) {
  const { state } = useGame()
  const files = state.downloads.map(findFile).filter((f) => f !== undefined)
  const [selected, setSelected] = useState<string | null>(null)
  const file = findFile(selected ?? undefined)

  if (file) {
    return (
      <>
        <SheetHeader title={chatContent.attach.file} onBack={() => setSelected(null)} />
        <div className="flex flex-1 items-center justify-center bg-black/[0.03] p-6">
          <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-md">
            <FileIcon />
            <p className="mt-3 truncate text-[15px] font-semibold">{file.fileName}</p>
            <p className="text-[12.5px] text-black/45">
              {file.sizeLabel} · {file.durationLabel}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <AudioPreviewButton src={file.audio} />
            </div>
          </div>
        </div>
        <SendBar onReselect={() => setSelected(null)} onSend={() => onSend(file.id)} />
      </>
    )
  }

  return (
    <>
      <SheetHeader title={chatContent.attach.file} onBack={onBack} />
      {files.length === 0 && <p className="pt-16 text-center text-[14px] text-black/40">{filesContent.pickerEmpty}</p>}
      <ul className="flex-1 overflow-y-auto pb-[calc(34px+var(--ui-bottom,0px))]">
        {files.map((f) => (
          <li key={f.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelected(f.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(f.id)}
              className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left active:bg-black/5"
            >
              <FileIcon />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px]">{f.fileName}</span>
                <span className="block text-[12px] text-black/45">
                  {f.sizeLabel} · {f.durationLabel}
                </span>
              </span>
              <AudioPreviewButton src={f.audio} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export function FileIcon() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ice-100 text-ice-600" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M9 18V6l10-2v12" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="16.5" cy="16" r="2.5" />
      </svg>
    </span>
  )
}
