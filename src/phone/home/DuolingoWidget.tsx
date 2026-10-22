import { useState } from 'react'
import { duolingoWidget } from '../../config/media'
import { homeContent } from '../../content/home'
import { assetUrl } from '../../lib/asset'
import { u } from '../../lib/units'
import { useGame } from '../../state/context'

// 제공 이미지를 원본 그대로(비율 유지, 덧씌움 없음) 표시. 모서리만 위젯 모양으로 둥글게 처리
export function DuolingoWidget({ onOpen }: { onOpen: () => void }) {
  const { state } = useGame()
  const [broken, setBroken] = useState<string[]>([])

  // 방문 후 이미지가 없거나 깨지면 처음 이미지로 대체
  const candidates = state.duolingoVisited ? [duolingoWidget.after, duolingoWidget.before] : [duolingoWidget.before]
  const src = candidates.find((path) => !broken.includes(path))

  return (
    <button
      type="button"
      aria-label="Duolingo"
      onClick={onOpen}
      className="flex size-full items-center justify-center transition-transform duration-150 active:scale-95"
    >
      {src ? (
        <img
          key={src}
          src={assetUrl(src)}
          alt=""
          draggable={false}
          onError={() => setBroken((b) => [...b, src])}
          className="max-h-full max-w-full object-contain shadow-[0_4px_20px_rgba(15,44,94,0.18)]"
          style={{ borderRadius: '14%' }}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center bg-white/25 text-white/80 backdrop-blur-md"
          style={{ borderRadius: u(5.6), fontSize: u(3.1) }}
        >
          {homeContent.duolingoImageMissing}
        </div>
      )}
    </button>
  )
}
