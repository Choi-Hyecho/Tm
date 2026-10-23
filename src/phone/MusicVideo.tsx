import { useEffect, useRef, useState } from 'react'
import { releaseVideo } from '../config/media'
import { releaseContent } from '../content/release'

const YT_ORIGIN = 'https://www.youtube.com'

/**
 * 공식 뮤직비디오 (YouTube 임베드).
 * - 음소거 자동재생을 시도 (모바일 Safari/Chrome은 소리 있는 자동재생을 막음) → '소리 켜기' 버튼
 * - 자동재생이 막히면 YouTube 플레이어의 재생 버튼이 그대로 보임
 * - 임베드가 막히거나 오류가 나면 썸네일 + 'YouTube에서 보기'
 * - 화면이 가려지면(다른 탭/앱) 일시정지. 팝업이 닫히면 이 컴포넌트가 사라지며 재생도 멈춤
 * - 영상 ID가 없으면 임의 영상 없이 '준비 중'
 */
export function MusicVideo() {
  const { youtubeId, title } = releaseVideo
  const c = releaseContent.video
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)
  const [failed, setFailed] = useState(false)
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`

  function command(func: string) {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YT_ORIGIN)
  }

  // YouTube 플레이어 이벤트 듣기 — 오류(임베드 금지/삭제 등)면 대체 화면
  useEffect(() => {
    if (!youtubeId) return
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== 'string') return
      try {
        const data = JSON.parse(e.data) as { event?: string }
        if (data.event === 'onError') setFailed(true)
      } catch {
        // YouTube가 아닌 메시지는 무시
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [youtubeId])

  // 화면이 보이지 않으면 일시정지
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) command('pauseVideo')
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function toggleSound() {
    if (muted) {
      command('unMute')
      command('playVideo')
    } else {
      command('mute')
    }
    setMuted(!muted)
  }

  if (!youtubeId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[14px] bg-black/40 text-[14px] text-white/55">
        {c.unavailable}
      </div>
    )
  }

  if (failed) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-black">
        <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" className="size-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <p className="text-[12.5px] text-white/80">{c.failed}</p>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#ff0033] px-4 py-2 text-[14px] font-semibold active:opacity-80"
          >
            ▶ {c.openYoutube}
          </a>
        </div>
      </div>
    )
  }

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    rel: '0',
    enablejsapi: '1',
    origin: window.location.origin,
  })

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-[14px] bg-black">
        <iframe
          ref={frameRef}
          src={`https://www.youtube.com/embed/${youtubeId}?${params}`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          // 플레이어가 준비되면 이벤트를 보내 달라고 요청 (오류 감지용)
          onLoad={() => frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'mv' }), YT_ORIGIN)}
          className="absolute inset-0 size-full border-0"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-semibold active:bg-white/25"
        >
          {muted ? `🔇 ${c.unmute}` : `🔊 ${c.mute}`}
        </button>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-white/60 underline-offset-2 active:underline">
          {c.openYoutube} ↗
        </a>
      </div>
    </div>
  )
}
