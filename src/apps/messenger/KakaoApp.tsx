import { useEffect, useRef, useState } from 'react'
import type { ChatId } from '../../content/chats'
import type { OpenAppRequest } from '../renderApp'
import { useToast } from '../../hooks/useToast'
import { StatusBar } from '../../phone/StatusBar'
import { Toast } from '../../phone/Toast'
import { getUnreadTotal } from '../../state/chat'
import { useGame } from '../../state/context'
import { ChatRoom } from './ChatRoom'
import { ChatsTab } from './ChatsTab'
import { FriendsTab } from './FriendsTab'
import { MoreTab } from './MoreTab'
import { ShoppingTab } from './ShoppingTab'
import { TabBar, type KakaoTab } from './TabBar'

const PUSH_MS = 350
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

// 앱을 닫았다 열어도 마지막 탭 유지 (이번 방문 동안)
let lastTab: KakaoTab = 'friends'

interface KakaoAppProps {
  /** 알림 배너 등으로 특정 채팅방을 바로 열 때 */
  chatId?: ChatId
  /** 다른 앱으로 이동 (+ 메뉴의 메모) */
  onOpenApp: (request: OpenAppRequest) => void
}

export function KakaoApp({ chatId, onOpenApp }: KakaoAppProps) {
  const { state } = useGame()
  const [tab, setTab] = useState<KakaoTab>(chatId ? 'chats' : lastTab)
  const [chat, setChat] = useState<ChatId | null>(chatId ?? null)
  // 알림으로 바로 열린 채팅방은 밀어 넣는 전환 없이 바로 표시
  const [chatVisible, setChatVisible] = useState(Boolean(chatId))
  const closeTimer = useRef<number>(undefined)
  const { toast, showToast } = useToast()

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  function changeTab(next: KakaoTab) {
    lastTab = next
    setTab(next)
  }

  function openChat(id: ChatId) {
    window.clearTimeout(closeTimer.current)
    setChat(id)
    setChatVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setChatVisible(true)))
  }

  function closeChat() {
    setChatVisible(false)
    closeTimer.current = window.setTimeout(() => setChat(null), PUSH_MS)
  }

  return (
    <div className="relative h-full overflow-hidden bg-white text-black">
      {/* 탭 화면 — 채팅방이 열리면 iOS처럼 살짝 왼쪽으로 밀림 */}
      <div
        className="flex h-full flex-col"
        inert={chatVisible}
        style={{
          transform: chatVisible ? 'translateX(-25%)' : 'none',
          transition: `transform ${PUSH_MS}ms ${EASE}`,
        }}
      >
        <StatusBar color="#1c1c1e" />
        <div key={tab} className="flex-1 overflow-y-auto overscroll-contain">
          {tab === 'friends' && <FriendsTab onOpenChat={openChat} onToast={showToast} />}
          {tab === 'chats' && <ChatsTab onOpenChat={openChat} onToast={showToast} />}
          {tab === 'shopping' && <ShoppingTab onToast={showToast} />}
          {tab === 'more' && <MoreTab />}
        </div>
        <TabBar tab={tab} onChange={changeTab} unread={getUnreadTotal(state)} />
      </div>

      {/* 채팅방 — 오른쪽에서 밀려 들어옴 */}
      {chat && (
        <div
          className="absolute inset-0 z-10 shadow-[-8px_0_24px_rgba(0,0,0,0.12)]"
          style={{
            transform: chatVisible ? 'none' : 'translateX(100%)',
            transition: `transform ${PUSH_MS}ms ${EASE}`,
          }}
        >
          <ChatRoom key={chat} chatId={chat} onBack={closeChat} onOpenNotes={() => onOpenApp({ id: 'notes' })} />
        </div>
      )}

      <Toast {...toast} />
    </div>
  )
}
