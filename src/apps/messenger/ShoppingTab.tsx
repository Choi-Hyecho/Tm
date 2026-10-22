import { shopItems } from '../../config/kakao'
import { chatContent } from '../../content/chats'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { openExternal } from '../../hooks/useToast'
import { FallbackImage } from './FallbackImage'
import { KakaoHeader, SearchIcon } from './KakaoHeader'

// 공식 판매 페이지로 이동만 하고, 사이트 안에서 결제하지 않음
export function ShoppingTab({ onToast }: { onToast: (text: string) => void }) {
  return (
    <>
      <KakaoHeader title={kakaoTabsContent.tabs.shopping}>
        <SearchIcon />
      </KakaoHeader>

      <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
        {shopItems.map((item) => (
          <section key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <FallbackImage src={item.image} fallback={item.fallback} className="aspect-[16/9] w-full justify-center">
              <p className="px-6 text-center text-[20px] font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.25)]">
                {item.title}
              </p>
            </FallbackImage>
            <div className="p-4">
              <h2 className="text-[15px] font-bold">{item.title}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-black/55">{item.description}</p>
              <button
                type="button"
                onClick={() => openExternal(item.link, () => onToast(chatContent.linkNotReady))}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-talk-yellow py-3 text-[14px] font-semibold text-black/85 active:brightness-95"
              >
                {item.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </button>
            </div>
          </section>
        ))}
        <p className="px-1 text-[11.5px] text-black/40">{kakaoTabsContent.shoppingNotice}</p>
      </div>
    </>
  )
}
