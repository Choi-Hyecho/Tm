import { dohyunQuest } from '../../content/quests/dohyun'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

const ACCENT = '#e0a800'

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// 메모에 첨부된 녹음본 — 재생/일시정지, 위치 이동, 5초 앞뒤, 재생 속도
export function RecordingPlayer() {
  const { recording } = dohyunQuest
  const { playing, currentTime, duration, rate, error, toggle, seek, skip, setRate } = useAudioPlayer(recording.src)
  const nextRate = recording.rates[(recording.rates.indexOf(rate) + 1) % recording.rates.length]

  return (
    <section className="mt-6 rounded-2xl bg-[#f2f2f7] p-4" aria-label={recording.title}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white" style={{ color: ACCENT }} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h1M7 8v8M11 5v14M15 9v6M19 7v10" />
          </svg>
        </span>
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{recording.title}</p>
        <button
          type="button"
          onClick={() => setRate(nextRate)}
          disabled={error}
          aria-label={`재생 속도 ${rate}배, 누르면 ${nextRate}배`}
          className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold tabular-nums active:opacity-60 disabled:opacity-40"
        >
          {rate}x
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-center text-[13px] text-black/40">{recording.unavailable}</p>
      ) : (
        <>
          {/* 재생 위치 — 끌어서 이동 */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="재생 위치"
            className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10"
            style={{
              accentColor: ACCENT,
              background: `linear-gradient(to right, ${ACCENT} ${duration ? (currentTime / duration) * 100 : 0}%, rgba(0,0,0,0.1) 0)`,
            }}
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-black/45 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-8">
            <SkipButton seconds={-recording.skipSeconds} onPress={() => skip(-recording.skipSeconds)} />
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? '일시정지' : '재생'}
              className="flex size-12 items-center justify-center rounded-full text-white active:scale-95"
              style={{ background: ACCENT }}
            >
              {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
                </svg>
              )}
            </button>
            <SkipButton seconds={recording.skipSeconds} onPress={() => skip(recording.skipSeconds)} />
          </div>
        </>
      )}
    </section>
  )
}

function SkipButton({ seconds, onPress }: { seconds: number; onPress: () => void }) {
  const back = seconds < 0
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={back ? `${-seconds}초 뒤로` : `${seconds}초 앞으로`}
      className="relative flex size-10 items-center justify-center text-black/70 active:opacity-50"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden style={back ? undefined : { transform: 'scaleX(-1)' }}>
        <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
        <path d="M4 3.5v3.7h3.7" strokeLinejoin="round" />
      </svg>
      <span className="absolute text-[9px] font-bold">{Math.abs(seconds)}</span>
    </button>
  )
}
