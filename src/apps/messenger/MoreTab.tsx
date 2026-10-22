import { useState, type ReactNode } from 'react'
import { myProfile } from '../../config/kakao'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { meta } from '../../content/meta'
import { Avatar } from './Avatar'
import { KakaoHeader, SearchIcon, SettingsIcon } from './KakaoHeader'

type Section = 'profile' | 'guide' | 'fanmade'

export function MoreTab() {
  const [open, setOpen] = useState<Section | null>(null)
  const { more } = kakaoTabsContent
  const toggle = (section: Section) => setOpen((current) => (current === section ? null : section))

  return (
    <>
      <KakaoHeader title={kakaoTabsContent.tabs.more}>
        <SearchIcon />
        <SettingsIcon />
      </KakaoHeader>

      <div className="mx-4 mt-1 flex items-center gap-3 rounded-2xl bg-black/[0.04] p-4">
        <Avatar src={myProfile.avatar} size={48} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{myProfile.name}</p>
          <p className="truncate text-[12.5px] text-black/50">{myProfile.statusMessage}</p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-black/5 border-y border-black/5">
        <MoreItem title={more.profile.title} open={open === 'profile'} onToggle={() => toggle('profile')}>
          <p>
            <span className="font-semibold text-black/70">{myProfile.name}</span> · {myProfile.statusMessage}
          </p>
          <p className="mt-1">{more.profile.body}</p>
        </MoreItem>
        <MoreItem title={more.guide.title} open={open === 'guide'} onToggle={() => toggle('guide')}>
          <ul className="list-disc space-y-1 pl-4">
            {more.guide.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </MoreItem>
        <MoreItem title={more.fanmade.title} open={open === 'fanmade'} onToggle={() => toggle('fanmade')}>
          <ul className="list-disc space-y-1 pl-4">
            {more.fanmade.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </MoreItem>
      </ul>

      <p className="px-5 py-5 text-[11px] text-black/35">{meta.disclaimer}</p>
    </>
  )
}

interface MoreItemProps {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function MoreItem({ title, open, onToggle, children }: MoreItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[14px] active:bg-black/5"
      >
        {title}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`text-black/35 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden
        >
          <path d="m4 2 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="px-5 pb-4 text-[12.5px] leading-relaxed text-black/55">{children}</div>}
    </li>
  )
}
