import type { WallpaperConfig } from '../config/media'
import { assetUrl } from '../lib/asset'

interface WallpaperProps {
  config: WallpaperConfig
  blur?: number
  /** config.dim 위에 추가로 얹는 어두움 */
  extraDim?: number
}

// 이미지 레이어 아래에 fallback 그라디언트를 깔아 두어, 파일이 없으면 그라디언트가 보이도록 함
export function Wallpaper({ config, blur = 0, extraDim = 0 }: WallpaperProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url("${assetUrl(config.image)}"), ${config.fallback}`,
          backgroundPosition: config.position,
          // 블러 시 가장자리가 비치지 않도록 살짝 확대
          filter: blur ? `blur(${blur}px)` : undefined,
          transform: blur ? 'scale(1.15)' : undefined,
        }}
      />
      <div className="absolute inset-0 bg-black" style={{ opacity: Math.min(1, config.dim + extraDim) }} />
    </div>
  )
}
