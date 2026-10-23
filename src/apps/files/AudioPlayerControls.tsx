import { filesContent } from '../../content/share'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { SkipButton } from '../notes/RecordingPlayer'

const BLUE = '#007aff'
/** 뒤로/앞으로 이동하는 초 */
const SKIP_SECONDS = 5

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * 음악 파일 재생 — 재생 위치 바(끌어서 이동) + 5초 뒤로/재생/5초 앞으로.
 * 파일 앱과 카톡 + 메뉴 '파일' 미리보기가 함께 사용. 화면에서 사라지면 재생도 멈춤
 */
export function AudioPlayerControls({ src }: { src: string }) {
  const { playing, currentTime, duration, error, toggle, seek, skip } = useAudioPlayer(src)

  if (error) return <p className="mt-6 text-center text-[13px] text-black/40">{filesContent.audioUnavailable}</p>

  return (
    <div className="mt-6 w-full max-w-[300px]">
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="재생 위치"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{
          accentColor: BLUE,
          background: `linear-gradient(to right, ${BLUE} ${duration ? (currentTime / duration) * 100 : 0}%, rgba(0,0,0,0.1) 0)`,
        }}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-black/45 tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(duration - currentTime)}</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-8">
        <SkipButton seconds={-SKIP_SECONDS} onPress={() => skip(-SKIP_SECONDS)} />
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? '일시정지' : '재생'}
          className="flex size-14 items-center justify-center rounded-full text-white active:scale-95"
          style={{ background: BLUE }}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>
        <SkipButton seconds={SKIP_SECONDS} onPress={() => skip(SKIP_SECONDS)} />
      </div>
    </div>
  )
}
