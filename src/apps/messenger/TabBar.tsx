import type { ReactNode } from 'react'
import { kakaoTabsContent } from '../../content/kakaoTabs'

export type KakaoTab = 'friends' | 'chats' | 'shopping' | 'more'

const TAB_ORDER: KakaoTab[] = ['friends', 'chats', 'shopping', 'more']

interface TabBarProps {
  tab: KakaoTab
  onChange: (tab: KakaoTab) => void
  /** 채팅 탭에 표시할 안 읽은 메시지 수 */
  unread: number
}

// 아래 34px은 홈 인디케이터 영역
export function TabBar({ tab, onChange, unread }: TabBarProps) {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-black/5 bg-white pb-[calc(34px+var(--ui-bottom,0px))]">
      {TAB_ORDER.map((id) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 pt-2 pb-1 ${active ? 'text-black' : 'text-black/35'}`}
          >
            <span className="relative">
              <TabIcon tab={id} active={active} />
              {id === 'chats' && unread > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] rounded-full bg-[#ff5a3c] px-1 text-center text-[10px] leading-[16px] font-semibold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{kakaoTabsContent.tabs[id]}</span>
          </button>
        )
      })}
    </nav>
  )
}

function TabIcon({ tab, active }: { tab: KakaoTab; active: boolean }) {
  const fill = active ? 'currentColor' : 'none'
  const icons: Record<KakaoTab, ReactNode> = {
    friends: (
      <>
        <circle cx="12" cy="8" r="4" fill={fill} />
        <path d="M4 20.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5Z" fill={fill} />
      </>
    ),
    chats: <path d="M21 11.5c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.6L4 20l1.2-3.6C3.8 15 3 13.3 3 11.5c0-4.4 4-8 9-8s9 3.6 9 8Z" fill={fill} />,
    shopping: (
      <>
        <path d="M5 8h14l-1 12.5H6Z" fill={fill} />
        <path d="M9 10V7a3 3 0 0 1 6 0v3" />
      </>
    ),
    more: (
      <>
        <circle cx="5.5" cy="12" r="1.6" fill="currentColor" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        <circle cx="18.5" cy="12" r="1.6" fill="currentColor" />
      </>
    ),
  }

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      {icons[tab]}
    </svg>
  )
}
