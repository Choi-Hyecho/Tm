import { createInitialState } from './reducer'
import type { GameState } from './types'

const STORAGE_KEY = 'touched-manager:state'

/** 저장된 상태 복원. 없거나 손상됐거나 버전이 다르면 초기 상태 (사생활 보호 모드 등 접근 실패 포함) */
export function loadState(): GameState {
  const initial = createInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const saved = JSON.parse(raw) as Partial<GameState>
    if (saved.version !== initial.version) return initial
    // 새로 추가된 필드는 기본값으로 채움
    return {
      ...initial,
      ...saved,
      intro: { ...initial.intro, ...saved.intro },
      chats: { ...initial.chats, ...saved.chats },
      pendingMessages: { ...initial.pendingMessages, ...saved.pendingMessages },
      missionStatuses: { ...initial.missionStatuses, ...saved.missionStatuses },
      affection: { ...initial.affection, ...saved.affection },
      lyrics: { ...initial.lyrics, ...saved.lyrics },
      tracklist: { ...initial.tracklist, ...saved.tracklist },
      // 예전 저장 데이터의 알림 형식(banner)은 버리고 새로 시작
      banners: Array.isArray(saved.banners) ? saved.banners : [],
      activeChat: null,
      // 발매했지만 엔딩을 끝까지 못 봤으면 다시 보여줌. 본 뒤로는 자동으로 뜨지 않음 (TODO에서 다시 보기)
      showEnding: Boolean(saved.released) && !saved.endingViewed,
    }
  } catch {
    return initial
  }
}

export function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, activeChat: null, showEnding: false }))
  } catch {
    // 저장 실패해도 게임은 계속 진행
  }
}

/** 개발용 초기화 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 무시
  }
}
