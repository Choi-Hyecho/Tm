import { meta } from '../../content/meta'
import { missions, todoContent, type MissionDef } from '../../content/missions'
import { formatDate } from '../../lib/date'
import { StatusBar } from '../../phone/StatusBar'
import { useGame } from '../../state/context'
import { getMissionStatus, getProgress, getVirtualDate } from '../../state/selectors'
import type { MissionStatus } from '../../state/types'

const statusLabel: Record<MissionStatus, string> = {
  hidden: todoContent.missionHidden,
  locked: todoContent.missionLocked,
  active: todoContent.missionActive,
  completed: todoContent.missionCompleted,
}

/** 멤버 업무는 요청을 받기 전까지 담당자 이름만 표시 */
function missionLabel(mission: MissionDef, status: MissionStatus) {
  if (!mission.assignee) return mission.title
  return status === 'hidden' ? `${mission.assignee} - ${todoContent.missionHidden}` : `${mission.assignee} - ${mission.title}`
}

// 업무는 사용자가 직접 체크할 수 없음 — 각 미션 성공 시 자동 완료
export function TodoApp() {
  const { state } = useGame()
  const { done, total, allDone } = getProgress(state)
  const date = formatDate(getVirtualDate(state), { month: 'long', day: 'numeric', weekday: 'long' })

  let status = todoContent.statusInProgress
  if (state.released) status = todoContent.statusReleased
  else if (allDone) status = todoContent.statusAllDone

  return (
    <div className="flex h-full flex-col bg-ice-50 text-ice-900">
      <StatusBar color="#0f2c5e" />
      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <h1 className="mt-2 text-[30px] font-bold">{todoContent.title}</h1>
        <p className="text-[14px] text-ice-900/55">
          {todoContent.subtitle} · {date}
        </p>

        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between">
            <p className="text-[26px] leading-none font-bold tabular-nums">
              {done}
              <span className="text-[18px] text-ice-900/35">/{total}</span>
            </p>
            <p className={`text-[14px] font-semibold text-ice-600 ${state.released ? 'tracking-[0.12em]' : ''}`}>
              {status}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ice-100">
            <div
              className="h-full rounded-full bg-ice-500 transition-[width] duration-700"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </section>

        <ul className="mt-5 divide-y divide-ice-100 overflow-hidden rounded-2xl bg-white shadow-sm">
          {missions.map((m, i) => {
            const missionStatus = getMissionStatus(state, m.id)
            const muted = missionStatus === 'hidden' || missionStatus === 'locked'
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3.5">
                <StatusMark status={missionStatus} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[15px] ${
                      missionStatus === 'completed' ? 'text-ice-900/45' : muted ? 'text-ice-900/40' : 'font-medium'
                    }`}
                  >
                    {i + 1}. {missionLabel(m, missionStatus)}
                  </p>
                  {missionStatus !== 'hidden' && (
                    <p
                      className={`mt-0.5 text-[12px] ${
                        missionStatus === 'active'
                          ? 'font-semibold text-ice-600'
                          : missionStatus === 'completed'
                            ? 'text-ice-500'
                            : 'text-ice-900/35'
                      }`}
                    >
                      상태: {statusLabel[missionStatus]}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-3 px-1 text-[13px] text-ice-900/45">{todoContent.notice}</p>
        <p className="mt-6 px-1 text-[11px] text-ice-900/35">{meta.disclaimer}</p>
      </div>
    </div>
  )
}

function StatusMark({ status }: { status: MissionStatus }) {
  if (status === 'completed') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ice-500" aria-label="완료">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (status === 'locked') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center text-ice-900/30" aria-label="잠김">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A1.5 1.5 0 0 1 19 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10Zm2 0h6V7.5a3 3 0 0 0-6 0Z" />
        </svg>
      </span>
    )
  }
  if (status === 'hidden') {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ice-900/20 text-[12px] font-bold text-ice-900/30"
        aria-label="업무 확인 전"
      >
        ?
      </span>
    )
  }
  return <span className="size-6 shrink-0 rounded-full border-2 border-ice-400" aria-label="진행 중" />
}
