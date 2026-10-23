import { useState } from 'react'
import { findFile, type GameFile } from '../../content/gameFiles'
import { filesContent, shareContent } from '../../content/share'
import { ShareIcon, ShareSheet } from '../../phone/ShareSheet'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { FileIcon } from '../messenger/AttachmentSheet'
import { AudioPlayerControls } from './AudioPlayerControls'

const BLUE = '#007aff'

// 아이폰 파일 앱 — 카톡에서 눌러 저장한 파일만 보임. 눌러서 재생하고, 공유 → 카카오톡으로 보내기
export function FilesApp() {
  const { state } = useGame()
  const files = state.downloads.map(findFile).filter((f) => f !== undefined)
  const [open, setOpen] = useState<string | null>(null)
  const file = files.find((f) => f.id === open)

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <StatusBar color="#1c1c1e" />
      {/* 파일마다 새로 그려 재생 상태가 섞이지 않게 */}
      {file ? (
        <FileDetail key={file.id} file={file} onBack={() => setOpen(null)} />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-[calc(34px+var(--ui-bottom,0px))]">
          <h1 className="pt-2 pb-3 text-[30px] font-bold">{filesContent.title}</h1>
          {files.length === 0 ? (
            <div className="pt-24 text-center">
              <p className="text-[16px] font-semibold text-black/60">{filesContent.empty}</p>
              <p className="mt-1 text-[13px] text-black/40">{filesContent.emptyHint}</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {files.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => setOpen(f.id)} className="flex w-full items-center gap-3 py-3 text-left active:bg-black/5">
                      <FileIcon />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px]">{f.fileName}</span>
                        <span className="block text-[12px] text-black/45">
                          {f.sizeLabel} · {f.durationLabel}
                        </span>
                      </span>
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/25" aria-hidden>
                        <path d="m1 1 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="pt-4 text-center text-[12px] text-black/40">{filesContent.count(files.length)}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** 파일 보기 — 재생/위치 이동 + 아래 공유 버튼 (보낸 뒤 카톡 알림은 App의 알림 배너) */
function FileDetail({ file, onBack }: { file: GameFile; onBack: () => void }) {
  const [sharing, setSharing] = useState(false)

  return (
    <>
      <header className="flex h-11 shrink-0 items-center px-2" style={{ color: BLUE }}>
        <button type="button" onClick={onBack} className="flex items-center gap-1 px-1 text-[16px] active:opacity-50">
          <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {filesContent.back}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center bg-[#f2f2f7] px-8">
        <span className="flex size-28 items-center justify-center rounded-[28px] bg-white text-ice-600 shadow-sm" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
          </svg>
        </span>
        <p className="mt-4 max-w-full truncate text-[17px] font-semibold">{file.fileName}</p>
        <p className="text-[13px] text-black/45">
          {file.sizeLabel} · {file.durationLabel}
        </p>
        <AudioPlayerControls src={file.audio} />
      </div>

      {/* 아래 도구 막대 — 공유 */}
      <div className="flex shrink-0 justify-center border-t border-black/5 bg-white pt-2 pb-[calc(34px+var(--ui-bottom,0px))]" style={{ color: BLUE }}>
        <button type="button" onClick={() => setSharing(true)} aria-label={shareContent.shareButton} className="flex size-11 items-center justify-center active:opacity-50">
          <ShareIcon size={24} />
        </button>
      </div>

      {sharing && (
        <ShareSheet item={{ kind: 'file', id: file.id, title: file.fileName, preview: <FileIcon /> }} onClose={() => setSharing(false)} />
      )}
    </>
  )
}
