import { useState } from 'react'
import { promotions, type Promotion } from '../../config/kakao'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { chatContent } from '../../content/chats'
import { openExternal } from '../../hooks/useToast'
import { FallbackImage } from './FallbackImage'

// 한 번 고른 배너를 이번 방문 동안 유지 — 탭/화면을 오갈 때마다 바뀌지 않도록
let sessionPromotion: Promotion | null = null
function getSessionPromotion() {
  sessionPromotion ??= promotions[Math.floor(Math.random() * promotions.length)]
  return sessionPromotion
}

// 팬메이드 프로모션 영역 (실제 광고·유료 스폰서십 아님)
export function PromoBanner({ onToast }: { onToast: (text: string) => void }) {
  const [promo] = useState(getSessionPromotion)
  if (!promo) return null

  return (
    <button
      type="button"
      onClick={() => openExternal(promo.link, () => onToast(chatContent.linkNotReady))}
      aria-label={`${promo.title} — ${promo.subtitle}`}
      className="relative mx-4 my-2 block h-[76px] w-[calc(100%-32px)] overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.98]"
    >
      <FallbackImage src={promo.image} fallback={promo.fallback} className="size-full">
        <div className="px-4 text-white">
          <p className="text-[14px] font-bold">{promo.title}</p>
          <p className="mt-0.5 text-[11.5px] text-white/80">{promo.subtitle}</p>
        </div>
      </FallbackImage>
      <span className="absolute top-2 right-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white">
        {kakaoTabsContent.promoLabel}
      </span>
    </button>
  )
}
