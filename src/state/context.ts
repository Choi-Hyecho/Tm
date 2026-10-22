import { createContext, useContext, type Dispatch } from 'react'
import type { GameAction, GameState } from './types'

export const GameContext = createContext<{ state: GameState; dispatch: Dispatch<GameAction> } | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame은 GameProvider 안에서 사용해야 합니다')
  return ctx
}
