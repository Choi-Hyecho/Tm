// 존비킴 미션 게임 로직 — UI와 분리된 순수 함수 (useReducer로 사용)
import type { MixFile } from '../content/quests/johnbekim'
import { shuffle } from '../lib/shuffle'

export interface CompareState {
  /** 화면에 보이는 순서 */
  files: MixFile[]
  requireListenAll: boolean
  /** 한 번 이상 재생한 파일 id */
  listened: string[]
  selected: string | null
  /** 마지막 전송 결과 */
  result: 'correct' | 'wrong' | null
}

export type CompareAction =
  | { type: 'LISTEN'; id: string }
  | { type: 'SELECT'; id: string }
  | { type: 'SEND' }

export function createCompare(
  files: MixFile[],
  options: { requireListenAll: boolean; shuffle: boolean },
  random = Math.random,
): CompareState {
  return {
    files: options.shuffle ? shuffle(files, random) : files,
    requireListenAll: options.requireListenAll,
    listened: [],
    selected: null,
    result: null,
  }
}

export function canSend(state: CompareState) {
  if (!state.selected || state.result === 'correct') return false
  return !state.requireListenAll || state.files.every((f) => state.listened.includes(f.id))
}

export function compareReducer(state: CompareState, action: CompareAction): CompareState {
  if (state.result === 'correct') return state // 완료 후에는 변경 없음
  switch (action.type) {
    case 'LISTEN':
      if (state.listened.includes(action.id)) return state
      return { ...state, listened: [...state.listened, action.id] }
    case 'SELECT':
      // 다시 고르면 이전 오답 표시는 지움
      return { ...state, selected: action.id, result: null }
    case 'SEND': {
      if (!canSend(state)) return state
      const file = state.files.find((f) => f.id === state.selected)
      return { ...state, result: file?.correct ? 'correct' : 'wrong' }
    }
  }
}
