import { useRef, useState, type PointerEvent } from 'react'
import { albumArt } from '../../config/media'
import { tracklistQuest, tracklistTracks } from '../../content/quests/tracklist'
import { assetUrl } from '../../lib/asset'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { getMissionStatus } from '../../state/selectors'

const ROW_H = 60
const GREEN = '#1ed760'
const titleOf = (id: string) => tracklistTracks.find((t) => t.id === id)?.title ?? id

interface PlaylistEditorProps {
  /** 뒤로 — 팀장님 채팅방으로 */
  onBack: () => void
  /** 저장 후 — 팀장님 채팅방으로 돌아가 답장 확인 */
  onSaved: () => void
}

/** 배열에서 한 칸을 옮긴 새 배열 */
function move(list: string[], from: number, to: number) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

// 게임 속 Spotify 스타일 플레이리스트 편집 화면 (실제 Spotify와 연결되지 않음)
// 오른쪽 ≡ 를 끌어서 순서 변경 → 놓을 때마다 저장(나갔다 와도 유지) → '검수본 저장하기'로 채점
export function PlaylistEditor({ onBack, onSaved }: PlaylistEditorProps) {
  const { state, dispatch } = useGame()
  const { screen, card } = tracklistQuest
  const status = getMissionStatus(state, 'tracklist')
  const done = status === 'completed'
  const checking = state.scheduled.some((s) => s.completeMission === 'tracklist')
  const editable = status === 'active' && !checking

  const [order, setOrder] = useState(() => (done ? tracklistQuest.correctOrder : state.tracklist.order))
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null)
  const start = useRef({ y: 0, index: 0, scroll: 0 })
  const listRef = useRef<HTMLDivElement>(null)

  function handleDown(e: PointerEvent<HTMLButtonElement>, id: string) {
    if (!editable) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { y: e.clientY, index: order.indexOf(id), scroll: listRef.current?.scrollTop ?? 0 }
    setDrag({ id, offset: 0 })
  }

  function handleMove(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    const list = listRef.current
    // 화면 위/아래 끝으로 끌면 목록도 같이 스크롤
    if (list) {
      const rect = list.getBoundingClientRect()
      if (e.clientY < rect.top + 48) list.scrollTop -= 10
      else if (e.clientY > rect.bottom - 48) list.scrollTop += 10
    }
    const dy = e.clientY - start.current.y + ((list?.scrollTop ?? 0) - start.current.scroll)
    const target = Math.max(0, Math.min(order.length - 1, start.current.index + Math.round(dy / ROW_H)))
    const current = order.indexOf(drag.id)
    if (target !== current) setOrder((o) => move(o, current, target))
    setDrag({ id: drag.id, offset: dy - (target - start.current.index) * ROW_H })
  }

  function handleUp() {
    if (!drag) return
    setDrag(null)
    dispatch({ type: 'SET_TRACKLIST_ORDER', order })
  }

  function save() {
    if (!editable) return
    dispatch({ type: 'SET_TRACKLIST_ORDER', order })
    dispatch({ type: 'SUBMIT_TRACKLIST', now: Date.now() })
    onSaved()
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#121212] text-white">
      <div className="bg-gradient-to-b from-[#1f3f6e] to-[#121212]">
        <StatusBar color="#ffffff" />
        <header className="flex h-11 items-center px-2">
          <button type="button" onClick={onBack} aria-label={screen.back} className="flex size-10 items-center justify-center active:opacity-50">
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
              <path d="M10 2 2 10l8 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>
        <div className="flex items-end gap-4 px-5 pb-4">
          <img src={assetUrl(albumArt)} alt="" className="size-[108px] shrink-0 rounded-md object-cover shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-white/70">{card.label}</p>
            <h1 className="mt-1 text-[22px] leading-tight font-bold">{screen.title}</h1>
            <p className="mt-1 text-[12.5px] text-white/60">
              {screen.owner} · {card.meta}
            </p>
          </div>
        </div>
      </div>

      <p className="px-5 pb-2 text-[12px] text-white/50">{done ? screen.done : screen.hint}</p>

      {/* 곡 목록 — ≡ 를 끌어서 순서 변경 */}
      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
        <ol>
          {order.map((id, i) => {
            const dragging = drag?.id === id
            return (
              <li
                key={id}
                className={`flex items-center gap-3 rounded-md px-2 ${dragging ? 'relative z-10 bg-[#2a2a2a] shadow-[0_6px_18px_rgba(0,0,0,0.5)]' : ''}`}
                style={{ height: ROW_H, transform: dragging ? `translateY(${drag.offset}px)` : undefined }}
              >
                <span className="w-5 shrink-0 text-right text-[13px] text-white/45 tabular-nums">{i + 1}</span>
                <img src={assetUrl(albumArt)} alt="" className="size-10 shrink-0 rounded-sm object-cover" draggable={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]" style={{ color: done ? GREEN : undefined }}>
                    {titleOf(id)}
                  </p>
                  <p className="truncate text-[12.5px] text-white/50">TOUCHED</p>
                </div>
                {editable && (
                  <button
                    type="button"
                    aria-label={`${titleOf(id)} 순서 옮기기`}
                    onPointerDown={(e) => handleDown(e, id)}
                    onPointerMove={handleMove}
                    onPointerUp={handleUp}
                    onPointerCancel={handleUp}
                    className="flex h-full w-11 shrink-0 cursor-grab touch-none items-center justify-center text-white/55 active:cursor-grabbing"
                  >
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor" aria-hidden>
                      <rect y="1" width="18" height="2" rx="1" />
                      <rect y="6" width="18" height="2" rx="1" />
                      <rect y="11" width="18" height="2" rx="1" />
                    </svg>
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="shrink-0 px-5 pt-3 pb-[calc(34px+var(--ui-bottom,0px))]">
        <button
          type="button"
          onClick={save}
          disabled={!editable}
          className="w-full rounded-full py-3.5 text-[15px] font-bold text-black transition-opacity active:scale-[0.98] disabled:opacity-40"
          style={{ background: GREEN }}
        >
          {done ? screen.done : checking ? screen.saving : screen.save}
        </button>
      </div>
    </div>
  )
}
