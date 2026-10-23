import { useState } from 'react'
import { getMyProfile } from '../../state/profile'
import { ProfileEditor } from './ProfileEditor'
import { avatarOf, chatOrder, chats, type ChatId } from '../../content/chats'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { useGame } from '../../state/context'
import { Avatar } from './Avatar'
import { AddFriendIcon, KakaoHeader, SearchIcon, SettingsIcon } from './KakaoHeader'
import { PromoBanner } from './PromoBanner'

interface FriendsTabProps {
  onOpenChat: (id: ChatId) => void
  onToast: (text: string) => void
}

export function FriendsTab({ onOpenChat, onToast }: FriendsTabProps) {
  const { state } = useGame()
  const me = getMyProfile(state)
  const [editing, setEditing] = useState(false)
  return (
    <>
      <KakaoHeader title={kakaoTabsContent.tabs.friends}>
        <SearchIcon />
        <AddFriendIcon />
        <SettingsIcon />
      </KakaoHeader>

      {/* 내 프로필 — 누르면 이름/상태 메시지/사진 편집 */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={kakaoTabsContent.profileEditor.editHint}
        className="flex w-full items-center gap-3.5 px-5 py-2.5 text-left active:bg-black/5"
      >
        <Avatar src={me.avatar} size={58} />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold">{me.name}</p>
          <p className="truncate text-[12px] text-black/50">{me.status}</p>
        </div>
      </button>
      {editing && <ProfileEditor onClose={() => setEditing(false)} />}

      <PromoBanner onToast={onToast} />

      <p className="mt-2 px-5 pb-1 text-[11px] text-black/45">{kakaoTabsContent.friendsCount(chatOrder.length)}</p>
      <ul>
        {chatOrder.map((id) => {
          const friend = chats[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onOpenChat(id)}
                className="flex w-full items-center gap-3 px-5 py-2 text-left active:bg-black/5"
              >
                <Avatar src={avatarOf(id, state.released)} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{friend.name}</span>
                  {friend.statusMessage && (
                    <span className="block truncate text-[11px] text-black/45">{friend.statusMessage}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
