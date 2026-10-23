import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Avatar } from '../apps/messenger/Avatar'
import { chatOrder, chats, type ChatId } from '../content/chats'
import { shareContent } from '../content/share'
import { assetUrl } from '../lib/asset'
import { useGame } from '../state/context'
import type { ShareKind } from '../state/types'

const SLIDE_MS = 280
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

export interface ShareItem {
  kind: ShareKind
  /** 사진/파일 asset ID 또는 메모 ID */
  id: string
  /** 시트 위에 보이는 이름 (파일명, 메모 제목 등) */
  title: string
  /** 이름 옆 미리보기 (사진 썸네일, 파일 아이콘 등) */
  preview?: ReactNode
}

interface ShareSheetProps {
  item: ShareItem
  onClose: () => void
  /** 보낸 뒤 — 받는 사람 이름으로 안내 */
  onSent: (name: string) => void
}

// iOS 공유 시트 → 카카오톡 → 받을 사람 고르기. 보내면 그 채팅방에 사진/파일/메모 메시지가 생기고 상대가 반응
export function ShareSheet({ item, onClose, onSent }: ShareSheetProps) {
  const { dispatch } = useGame()
  const [step, setStep] = useState<'apps' | 'kakao'>('apps')
  const [target, setTarget] = useState<ChatId | null>(null)
  const [shown, setShown] = useState(false)
  const closeTimer = useRef<number>(undefined)

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  function close(after?: () => void) {
    setShown(false)
    closeTimer.current = window.setTimeout(() => {
      after?.()
      onClose()
    }, SLIDE_MS)
  }

  function send() {
    if (!target) return
    dispatch({ type: 'SEND_ATTACHMENT', chatId: target, kind: item.kind, attachmentId: item.id, now: Date.now() })
    close(() => onSent(chats[target].name))
  }

  return (
    <div className="absolute inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ opacity: shown ? 1 : 0, transition: `opacity ${SLIDE_MS}ms ease` }}
        onClick={() => close()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label={shareContent.title}
        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[20px] bg-[#f2f2f7] text-black"
        style={{
          height: step === 'kakao' ? '80%' : undefined,
          transform: shown ? 'none' : 'translateY(100%)',
          transition: `transform ${SLIDE_MS}ms ${EASE}`,
        }}
      >
        {step === 'apps' ? (
          <div className="pb-[calc(34px+var(--ui-bottom,0px))]">
            {/* 보낼 것 */}
            <div className="flex items-center gap-3 border-b border-black/10 px-4 pt-4 pb-3">
              {item.preview}
              <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{item.title}</p>
              <button
                type="button"
                onClick={() => close()}
                aria-label={shareContent.cancel}
                className="flex size-8 items-center justify-center rounded-full bg-black/10 text-black/60 active:opacity-60"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {/* 앱 — 게임 안에서는 카카오톡만 */}
            <div className="flex gap-5 px-5 pt-4 pb-5">
              <button type="button" onClick={() => setStep('kakao')} className="flex w-16 flex-col items-center gap-1.5 active:opacity-60">
                <img src={assetUrl('images/icons/kakaotalk.png')} alt="" className="size-14 rounded-[14px]" draggable={false} />
                <span className="text-[11.5px]">{shareContent.kakao}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-12 shrink-0 items-center border-b border-black/5 bg-white px-2">
              <button type="button" onClick={() => setStep('apps')} aria-label="뒤로" className="flex size-10 items-center justify-center active:opacity-40">
                <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h2 className="flex-1 text-center text-[15px] font-semibold">{shareContent.pickFriend}</h2>
              <span className="size-10" />
            </div>
            <ul className="flex-1 overflow-y-auto bg-white">
              {chatOrder.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTarget(id)}
                    aria-pressed={target === id}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-black/5"
                  >
                    <Avatar src={chats[id].avatar} size={40} />
                    <span className="min-w-0 flex-1 truncate text-[15px]">{chats[id].name}</span>
                    <span
                      className={`flex size-6 items-center justify-center rounded-full border-2 ${
                        target === id ? 'border-talk-yellow bg-talk-yellow' : 'border-black/15'
                      }`}
                      aria-hidden
                    >
                      {target === id && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3c1e1e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5 9-10" />
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="shrink-0 border-t border-black/5 bg-white px-4 pt-3 pb-[calc(34px+var(--ui-bottom,0px))]">
              <button
                type="button"
                onClick={send}
                disabled={!target}
                className="w-full rounded-xl bg-talk-yellow py-3 text-[15px] font-semibold text-black/85 transition-opacity active:brightness-95 disabled:opacity-40"
              >
                {shareContent.send}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** 공유 버튼 아이콘 (iOS) */
export function ShareIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M8 10.5H6.5A1.5 1.5 0 0 0 5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5H16" />
    </svg>
  )
}
