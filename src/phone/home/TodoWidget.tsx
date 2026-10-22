import { todoContent } from '../../content/missions'
import { u } from '../../lib/units'
import { useGame } from '../../state/context'
import { getProgress } from '../../state/selectors'

// TODO 앱과 같은 게임 상태를 읽음 — 미션 완료 시 자동 반영
export function TodoWidget({ onOpen }: { onOpen: (el: HTMLElement) => void }) {
  const { state } = useGame()
  const { done, total, allDone } = getProgress(state)
  const released = state.released

  let status = todoContent.statusInProgress
  if (released) status = todoContent.statusReleased
  else if (allDone) status = todoContent.statusAllDone

  return (
    <button
      type="button"
      aria-label={`${todoContent.title} ${done}/${total}`}
      onClick={(e) => onOpen(e.currentTarget)}
      className={`flex size-full flex-col text-left shadow-[0_4px_20px_rgba(15,44,94,0.18)] transition-transform duration-150 active:scale-95 ${
        released ? 'bg-gradient-to-br from-ice-500 to-ice-700 text-white' : 'bg-white text-ice-900'
      }`}
      style={{ borderRadius: u(5.6), padding: u(4) }}
    >
      <span className={`font-bold ${released ? 'text-white' : 'text-ice-600'}`} style={{ fontSize: u(3.8) }}>
        {todoContent.title}
      </span>
      <span className="font-medium opacity-60" style={{ fontSize: u(3.1) }}>
        {todoContent.subtitle}
      </span>

      <div className="mt-auto w-full">
        <p className="leading-none font-bold tabular-nums" style={{ fontSize: u(9.5) }}>
          {done}
          <span className="opacity-40" style={{ fontSize: u(5.5) }}>
            /{total}
          </span>
        </p>
        <div
          className={`w-full overflow-hidden rounded-full ${released ? 'bg-white/30' : 'bg-ice-100'}`}
          style={{ height: u(1.6), marginTop: u(2.2) }}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${released ? 'bg-white' : 'bg-ice-500'}`}
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
        <p
          className={`font-semibold ${released ? 'tracking-[0.12em] text-white' : 'text-ice-600'}`}
          style={{ fontSize: u(3), marginTop: u(1.8) }}
        >
          {status}
        </p>
      </div>
    </button>
  )
}
