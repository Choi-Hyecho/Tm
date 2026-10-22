import type { ReactNode } from 'react'
import { useViewportHeight } from '../hooks/useViewportHeight'

// 모바일: 페이지 전체(Safari 하단 툴바 뒤까지, 입력 중에는 보이는 영역만큼) / 데스크톱(desk): 가운데 아이폰 프레임
export function PhoneFrame({ children }: { children: ReactNode }) {
  useViewportHeight()

  return (
    <div className="flex h-[var(--app-height,100%)] w-full items-center justify-center overflow-hidden bg-black desk:h-dvh desk:bg-[radial-gradient(60%_60%_at_50%_40%,#ffffff_0%,#c8e0ff_100%)]">
      <div
        data-screen
        className="relative h-full w-full overflow-hidden bg-black desk:aspect-[390/844] desk:h-[min(844px,calc(100dvh-48px))] desk:w-auto desk:rounded-[54px] desk:shadow-[0_0_0_11px_#111,0_0_0_13px_#3a3d4a,0_30px_80px_rgba(15,44,94,0.35)]"
        style={{ containerType: 'size' }}
      >
        {children}
        {/* 다이내믹 아일랜드 — 실제 기기에는 이미 있으므로 데스크톱 프레임에서만 표시 */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[11px] left-1/2 z-50 hidden h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black desk:block"
        />
      </div>
    </div>
  )
}
