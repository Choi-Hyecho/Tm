import { chatContent, chatOrder, chats, type ChatId } from '../../content/chats'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { useClock } from '../../hooks/useClock'
import { useGame } from '../../state/context'
import { Avatar } from './Avatar'
import { KakaoHeader, NewChatIcon, SearchIcon, SettingsIcon } from './KakaoHeader'
import { PromoBanner } from './PromoBanner'

const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' })
const dateFormat = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' })

/** 오늘이면 시각, 어제면 '어제', 그 전이면 날짜 */
function formatListTime(at: number, now: Date) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (at >= startOfToday) return timeFormat.format(at)
  if (at >= startOfToday - 86_400_000) return '어제'
  return dateFormat.format(at)
}

interface ChatsTabProps {
  onOpenChat: (id: ChatId) => void
  onToast: (text: string) => void
}

export function ChatsTab({ onOpenChat, onToast }: ChatsTabProps) {
  const { state } = useGame()
  const now = useClock()

  // 대화를 주고받은 방만 최근 메시지 순으로 — 멤버 방은 친구 탭에서 대화를 시작하면 생김
  const rows = chatOrder
    .map((id) => ({ id, thread: state.chats[id], last: state.chats[id].messages.at(-1) }))
    .filter((row) => row.last)
    .sort((a, b) => (b.last?.at ?? 0) - (a.last?.at ?? 0))

  return (
    <>
      <KakaoHeader title={kakaoTabsContent.tabs.chats}>
        <SearchIcon />
        <NewChatIcon />
        <SettingsIcon />
      </KakaoHeader>

      <PromoBanner onToast={onToast} />

      {rows.length === 0 && <p className="py-16 text-center text-[13px] text-black/35">{chatContent.noChats}</p>}
      <ul className="mt-1">
        {rows.map(({ id, thread, last }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onOpenChat(id)}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left active:bg-black/5"
            >
              <Avatar src={chats[id].avatar} size={48} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{chats[id].name}</span>
                {last && (
                  <span className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-black/50">{last.text}</span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1 self-start pt-0.5">
                {last && <span className="text-[10.5px] text-black/40">{formatListTime(last.at, now)}</span>}
                {thread.unread > 0 && (
                  <span className="min-w-[20px] rounded-full bg-[#ff5a3c] px-1.5 text-center text-[10.5px] leading-[18px] font-semibold text-white">
                    {thread.unread > 99 ? '99+' : thread.unread}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
