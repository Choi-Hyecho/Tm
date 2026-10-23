import type { CSSProperties } from 'react'
import { apps } from '../config/apps'
import { albumLinks } from '../config/links'
import { albumLogo } from '../config/media'
import { releaseContent, releasePlatforms } from '../content/release'
import { assetUrl } from '../lib/asset'
import { MusicVideo } from './MusicVideo'

interface ReleaseEndingProps {
  /** '발매된 업무폰 확인하기' — 영상 정지(팝업이 사라지며 플레이어도 사라짐) 후 잠금화면으로 */
  onFinish: () => void
}

/**
 * 「극야」 X 헤더의 수채화 색 — 가운데 짙은 청록 파랑, 가장자리에 연한 하늘색/흰 번짐
 */
const WATERCOLOR = [
  'radial-gradient(55% 32% at 8% 6%, rgba(232,243,248,0.9) 0%, rgba(232,243,248,0) 70%)',
  'radial-gradient(45% 28% at 96% 14%, rgba(168,211,230,0.75) 0%, rgba(168,211,230,0) 70%)',
  'radial-gradient(60% 30% at 0% 62%, rgba(120,182,212,0.55) 0%, rgba(120,182,212,0) 70%)',
  'radial-gradient(55% 30% at 100% 88%, rgba(214,235,244,0.6) 0%, rgba(214,235,244,0) 70%)',
  'linear-gradient(180deg, #2a6f9f 0%, #1f5f8c 40%, #1a527c 100%)',
].join(', ')
const SPARK_COLORS = ['#ffffff', '#e8f3f8', '#bcdcec', '#8ec3dc', '#5fa3c9']

/** 폭죽 — 위치(%), 시작 시각(초), 퍼지는 거리(px). 화면 위쪽에서 차례로 터짐 */
const BURSTS = [
  { x: 22, y: 18, delay: 0.5, radius: 90 },
  { x: 76, y: 14, delay: 0.9, radius: 110 },
  { x: 50, y: 28, delay: 1.4, radius: 130 },
  { x: 15, y: 40, delay: 2.1, radius: 80 },
  { x: 85, y: 36, delay: 2.5, radius: 95 },
  { x: 40, y: 10, delay: 3.2, radius: 85 },
  { x: 64, y: 44, delay: 3.8, radius: 100 },
]
const SPARKS_PER_BURST = 18

/** 반짝이 — 결정적인 의사 난수로 위치를 정해 렌더링마다 바뀌지 않게 */
const TWINKLES = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2) % 1
  return { x: r(1) * 100, y: r(2) * 70, size: 1.5 + r(3) * 2.5, delay: r(4) * 3, dur: 2 + r(5) * 2.5 }
})

const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` })

// 극야 발매 엔딩 — 어두워지는 전환 → 폭죽/반짝이 → 문구 → 뮤직비디오 + 음원 플랫폼 → 업무폰 확인 버튼
export function ReleaseEnding({ onFinish }: ReleaseEndingProps) {
  const c = releaseContent

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${c.headline} ${c.headlineSuffix}`}
      className="ending-fade absolute inset-0 z-[70] overflow-hidden text-white"
      style={{ background: WATERCOLOR }}
    >
      {/* 폭죽 + 반짝이 — 터치는 통과 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {TWINKLES.map((t, i) => (
          <span
            key={`t${i}`}
            className="ending-twinkle"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.size,
              height: t.size,
              animationDelay: `${t.delay}s`,
              ['--dur' as string]: `${t.dur}s`,
            }}
          />
        ))}
        {BURSTS.map((b, bi) =>
          Array.from({ length: SPARKS_PER_BURST }, (_, si) => {
            const angle = (si / SPARKS_PER_BURST) * Math.PI * 2 + bi
            const dist = b.radius * (0.65 + ((si * 37) % 10) / 28)
            return (
              <span
                key={`b${bi}-${si}`}
                className="ending-spark"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  animationDelay: `${b.delay + (si % 3) * 0.04}s`,
                  ['--dx' as string]: `${Math.cos(angle) * dist}px`,
                  ['--dy' as string]: `${Math.sin(angle) * dist}px`,
                  ['--color' as string]: SPARK_COLORS[(si + bi) % SPARK_COLORS.length],
                  ['--size' as string]: `${si % 4 === 0 ? 5 : 3}px`,
                }}
              />
            )
          }),
        )}
      </div>

      {/* 내용 — 길면 스크롤 */}
      <div className="relative h-full overflow-y-auto overscroll-contain px-5 pt-[calc(var(--status-h)+28px)] pb-[calc(28px+var(--ui-bottom,0px))]">
        <div className="mx-auto flex max-w-[380px] flex-col items-center text-center">
          {/* 「극야」 손글씨 로고 (TOUCHED The 1st Album 포함) + RELEASED */}
          <h1 className="ending-pop" style={delay(0.8)}>
            <img
              src={assetUrl(albumLogo)}
              alt={`TOUCHED The 1st Album ${c.headline}`}
              className="mx-auto w-[min(300px,78cqw)] drop-shadow-[0_2px_14px_rgba(10,40,70,0.45)]"
              draggable={false}
            />
            <span className="mt-3 block text-[13px] font-semibold tracking-[0.55em] text-[#e8f3f8] [text-indent:0.55em]">
              {c.headlineSuffix}
            </span>
          </h1>

          {/* 마무리 인사 — 얇은 선 사이 날짜 + 인사 */}
          <div className="ending-rise mt-6 flex w-full flex-col items-center" style={delay(1.6)}>
            <p className="flex w-full items-center gap-3 text-[11px] tracking-[0.2em] text-[#bcdcec]">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/40" />
              {c.releaseDate}
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/40" />
            </p>
            <div className="mt-3 space-y-0.5 text-[15.5px] leading-relaxed font-medium text-white/90">
              {c.congrats.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          {/* 축하 팝업 — 뮤직비디오 + 음원 플랫폼 + 버튼 */}
          <section
            className="ending-rise mt-7 w-full rounded-[22px] border border-white/20 bg-[#123f62]/45 p-3 shadow-[0_20px_60px_rgba(8,32,56,0.35)] backdrop-blur-md"
            style={delay(2.1)}
          >
            <MusicVideo />

            <p className="mt-4 text-[13px] font-semibold tracking-[0.04em] text-white/70">{c.platformsTitle}</p>
            <ul className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3 px-1">
              {releasePlatforms.map((id) => {
                const app = apps[id]
                const link = albumLinks[id]
                const icon = <img src={assetUrl(app.icon)} alt="" className="size-12 rounded-[12px]" draggable={false} />
                return (
                  <li key={id}>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 active:opacity-60"
                      >
                        {icon}
                        <span className="w-full truncate text-[11.5px] text-white/85">{app.name}</span>
                      </a>
                    ) : (
                      <span className="flex flex-col items-center gap-1.5 opacity-40" aria-disabled="true">
                        {icon}
                        <span className="w-full truncate text-[11.5px]">{c.platformNotReady}</span>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>

            <button
              type="button"
              onClick={onFinish}
              className="mt-5 w-full rounded-2xl bg-white py-3.5 text-[16px] font-bold text-[#1a527c] active:bg-white/85"
            >
              {c.finish}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
