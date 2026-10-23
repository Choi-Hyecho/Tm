import { useState } from 'react'
import { missions } from '../content/missions'
import { useGame } from '../state/context'
import { getActiveMissions } from '../state/selectors'
import { clearState } from '../state/storage'

// 개발 전용 테스트 도구 — App에서 import.meta.env.DEV일 때만 렌더링 (배포 빌드에 포함되지 않음)
export function DevPanel() {
  const { state, dispatch } = useGame()
  const [open, setOpen] = useState(false)
  // 미니게임이 생기기 전까지, 지금 진행 중인 업무를 성공 처리 (진행 중인 멤버 업무 우선)
  const targetId = state.activeMissionId ?? getActiveMissions(state)[0]
  const target = missions.find((m) => m.id === targetId && getActiveMissions(state).includes(m.id))

  function resetAll() {
    clearState()
    window.location.reload()
  }

  return (
    <div className="fixed top-3 left-3 z-[100] flex flex-col items-start gap-2 text-[13px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-black/70 px-3 py-1.5 font-semibold text-white opacity-50 shadow-lg hover:opacity-100"
      >
        DEV
      </button>
      {open && (
        <div className="flex w-56 flex-col gap-1.5 rounded-xl bg-black/85 p-3 text-white shadow-xl">
          <p className="mb-1 font-semibold text-ice-300">개발용 테스트</p>
          <p className="text-[11px] text-white/60">
            진행 중 멤버 업무: {state.activeMissionId ?? '없음'}
          </p>
          <button
            type="button"
            disabled={!target}
            onClick={() => target && dispatch({ type: 'COMPLETE_MISSION', id: target.id, now: Date.now() })}
            className="rounded-lg bg-ice-500 px-3 py-1.5 text-left disabled:opacity-40"
          >
            미션 완료 테스트{target ? `: ${target.assignee ?? target.title}` : ''}
          </button>
          <button
            type="button"
            disabled={state.released}
            onClick={() => dispatch({ type: 'DEV_FORCE_RELEASE', now: Date.now() })}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-left disabled:opacity-40"
          >
            엔딩 테스트: 모든 업무 완료 + 발매
          </button>
          <button type="button" onClick={resetAll} className="rounded-lg bg-red-500 px-3 py-1.5 text-left">
            처음 상태로 초기화
          </button>
        </div>
      )}
    </div>
  )
}
