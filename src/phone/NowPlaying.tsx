import { useEffect, useState, type ReactNode } from 'react'
import { lockScreenPlayer } from '../config/media'
import { theme } from '../config/theme'
import { assetUrl } from '../lib/asset'

/**
 * iOS 잠금화면 음악 플레이어. 실제 재생은 하지 않고, 재생 버튼은 설정된 공식 음원 링크로 이동.
 * 발매 전 새벽별 / 발매 후 Fallen Angel · 이 별을 번갈아 표시. 재생 위치는 항상 01:21 고정 (데뷔일 1/21)
 */
export function NowPlaying({ released }: { released: boolean }) {
  const tracks = released ? lockScreenPlayer.afterRelease : lockScreenPlayer.beforeRelease
  const [index, setIndex] = useState(0)
  const track = tracks[index % tracks.length]
  const { title, artist, artwork, duration, link } = track
  const { position } = lockScreenPlayer
  const positionSec = toSeconds(position)
  const durationSec = toSeconds(duration)
  const progress = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0

  // 곡이 여러 개면 일정 간격으로 다음 곡 (재생 위치는 그대로 01:21)
  useEffect(() => {
    if (tracks.length < 2) return
    const timer = window.setInterval(() => setIndex((i) => i + 1), lockScreenPlayer.switchMs)
    return () => window.clearInterval(timer)
  }, [tracks.length])

  return (
    // 플레이어를 만지는 동안 잠금화면 스와이프/탭이 동작하지 않도록 차단
    <div
      className="rounded-[26px] p-4 pb-3 text-white"
      style={{
        background: theme.lockScreen.player.background,
        backdropFilter: `blur(${theme.lockScreen.player.blur}px)`,
        WebkitBackdropFilter: `blur(${theme.lockScreen.player.blur}px)`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 곡이 바뀔 때마다 새로 그려 부드럽게 나타남 */}
      <div key={title} className="animate-track-in flex items-center gap-3">
        <Artwork src={artwork} fallbackSrc={lockScreenPlayer.fallbackArtwork} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-tight font-semibold">{title}</p>
          <p className="truncate text-[15px] leading-tight text-white/60">{artist}</p>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0 text-white/70" aria-hidden>
          <path
            d="M6 17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="m12 14.5 5 6.5H7Z" fill="currentColor" />
        </svg>
      </div>

      {/* 재생 위치 */}
      <div className="mt-4">
        <div className="h-[5px] overflow-hidden rounded-full bg-white/25">
          <div className="h-full bg-white/80" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-white/50 tabular-nums">
          <span>{position}</span>
          <span>-{toTimestamp(Math.max(0, durationSec - positionSec))}</span>
        </div>
      </div>

      {/* 이전 / 재생 / 다음 */}
      <div className="mt-1 flex items-center justify-center gap-[13cqw]">
        <SkipIcon direction="back" />
        <PlayButton link={link} />
        <SkipIcon direction="forward" />
      </div>

      {/* 볼륨 */}
      <div className="mt-3 flex items-center gap-2.5 text-white/60">
        <SpeakerIcon />
        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-[60%] bg-white/80" />
        </div>
        <SpeakerIcon loud />
      </div>
    </div>
  )
}

function toSeconds(timestamp: string) {
  const [m, s] = timestamp.split(':').map(Number)
  return m * 60 + s
}

function toTimestamp(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

/** 앨범아트 — 곡별 이미지가 없으면 fallbackSrc(극야 앨범아트), 그것도 없으면 임시 이미지 */
function Artwork({ src, fallbackSrc }: { src: string; fallbackSrc?: string }) {
  const [failed, setFailed] = useState<string[]>([])
  const candidates = [src, fallbackSrc].filter((s): s is string => Boolean(s) && !failed.includes(s as string))
  const current = candidates[0]

  if (!current) {
    // 앨범아트 파일이 없을 때 임시 이미지
    return (
      <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-ice-400 to-ice-700">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 3v12.5a3 3 0 1 1-2-2.83V7.4l-8 1.78v8.32a3 3 0 1 1-2-2.83V5.5Z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={assetUrl(current)}
      alt=""
      draggable={false}
      onError={() => setFailed((list) => [...list, current])}
      className="size-[52px] shrink-0 rounded-[10px] object-cover"
    />
  )
}

function PlayButton({ link }: { link: string }) {
  const icon = (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4.7v14.6a1 1 0 0 0 1.5.86l12.3-7.3a1 1 0 0 0 0-1.72L8.5 3.84A1 1 0 0 0 7 4.7Z" />
    </svg>
  )
  const className = 'flex size-14 items-center justify-center rounded-full transition-transform active:scale-90'

  // 링크 미설정 시에는 이동하지 않음
  if (!link) {
    return (
      <span aria-label="재생" className={className}>
        {icon}
      </span>
    )
  }

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label="재생" className={className}>
      {icon}
    </a>
  )
}

function SkipIcon({ direction }: { direction: 'back' | 'forward' }) {
  return (
    <svg
      width="34"
      height="22"
      viewBox="0 0 32 20"
      fill="currentColor"
      aria-hidden
      style={direction === 'forward' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M15 2.5v15a1 1 0 0 1-1.6.8L3.5 10.8a1 1 0 0 1 0-1.6l9.9-7.5A1 1 0 0 1 15 2.5Z" />
      <path d="M29 2.5v15a1 1 0 0 1-1.6.8l-9.9-7.5a1 1 0 0 1 0-1.6l9.9-7.5A1 1 0 0 1 29 2.5Z" />
    </svg>
  )
}

function SpeakerIcon({ loud = false }: { loud?: boolean }) {
  let waves: ReactNode = null
  if (loud) {
    waves = (
      <>
        <path d="M15.5 9a4 4 0 0 1 0 6" />
        <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
      </>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 9.5h3l4.5-4v13L7 14.5H4Z" fill="currentColor" />
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {waves}
      </g>
    </svg>
  )
}
