import type { MouseEvent } from 'react'
import { chatContent } from '../../content/chats'
import { useAudioClip } from '../../hooks/useAudioClip'

// 파일 미리듣기 — 오디오 파일이 아직 없으면 '미리듣기 준비 중' 표시 (전송은 가능)
export function AudioPreviewButton({ src, dark = false }: { src: string; dark?: boolean }) {
  const { status, toggle } = useAudioClip(src)

  if (status === 'error') {
    return <span className="shrink-0 text-[11px] text-black/40">{chatContent.attach.previewUnavailable}</span>
  }

  const playing = status === 'playing' || status === 'loading'
  return (
    <button
      type="button"
      // 행 선택과 겹치지 않도록
      onClick={(e: MouseEvent) => {
        e.stopPropagation()
        void toggle()
      }}
      aria-label={playing ? '일시정지' : '미리듣기'}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full active:scale-90 ${
        dark ? 'bg-black/80 text-white' : 'bg-ice-100 text-ice-700'
      }`}
    >
      {playing ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
        </svg>
      )}
    </button>
  )
}
