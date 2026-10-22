import type { ReactNode } from 'react'

export function KakaoHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between px-5">
      <h1 className="text-[20px] font-bold">{title}</h1>
      <div className="flex items-center gap-4 text-black/80" aria-hidden>
        {children}
      </div>
    </header>
  )
}

// 장식용 헤더 아이콘
export function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" strokeLinecap="round" />
    </svg>
  )
}

export function AddFriendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c0-3.5 3-6 7-6s7 2.5 7 6M19 6v6M16 9h6" />
    </svg>
  )
}

export function NewChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12.5c0 4-3.6 7-8 7-1 0-2-.2-2.9-.5L5 20l1-3.3C4.7 15.5 4 14 4 12.5c0-4 3.6-7 8-7" />
      <path d="M18 3v6M15 6h6" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" strokeLinecap="round" />
    </svg>
  )
}
