import { StatusBar } from '../../phone/StatusBar'

interface DocumentViewerProps {
  fileName: string
  /** 보낸 당시의 내용 */
  content: string
  onClose: () => void
}

// 카톡으로 보낸 TXT 파일 내용 보기 (실제 다운로드 없음)
export function DocumentViewer({ fileName, content, onClose }: DocumentViewerProps) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white text-black" role="dialog" aria-label={fileName}>
      <StatusBar color="#1c1c1e" />
      <header className="flex h-11 shrink-0 items-center gap-1 border-b border-black/5 px-2">
        <button type="button" onClick={onClose} aria-label="닫기" className="flex size-10 items-center justify-center active:opacity-40">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold">{fileName}</h1>
        <span className="size-10" />
      </header>
      <pre className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(34px+var(--ui-bottom,0px))] font-sans text-[14px] leading-relaxed whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  )
}
