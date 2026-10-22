import { useEffect, useReducer, type ReactNode } from 'react'
import { GameContext } from './context'
import { gameReducer } from './reducer'
import { loadState, saveState } from './storage'

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState)

  useEffect(() => saveState(state), [state])

  // 예약된 답장 배달 — 새로고침 후 이미 시간이 지난 답장은 바로 도착
  useEffect(() => {
    if (state.scheduled.length === 0) return
    const next = Math.min(...state.scheduled.map((s) => s.deliverAt))
    const timer = window.setTimeout(() => dispatch({ type: 'DELIVER_DUE', now: Date.now() }), Math.max(0, next - Date.now()))
    return () => window.clearTimeout(timer)
  }, [state.scheduled])

  return <GameContext value={{ state, dispatch }}>{children}</GameContext>
}
