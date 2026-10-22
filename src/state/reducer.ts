import { chatOrder, managerScript, type ChatId } from '../content/chats'
import { missions } from '../content/missions'
import { initialFlows } from '../chat/scripts'
import { completeMission, deliverDue, deliverMessage, readPending, sendAttachment, sendMessage } from './chat'
import type { ChatThread, GameAction, GameState } from './types'

function createThread(id: ChatId): ChatThread {
  return { messages: [], unread: 0, flow: initialFlows[id], conversationContext: null }
}

export function createInitialState(): GameState {
  return {
    version: 3,
    intro: { started: false, notificationSeen: false },
    // 채팅방마다 대화 기록/안 읽음/대화 흐름을 독립적으로 저장
    chats: Object.fromEntries(chatOrder.map((id) => [id, createThread(id)])) as GameState['chats'],
    scheduled: [],
    pendingMessages: Object.fromEntries(chatOrder.map((id) => [id, []])) as unknown as GameState['pendingMessages'],
    banner: null,
    activeChat: null,
    missionStatuses: {
      yunmin: 'hidden',
      seungbin: 'hidden',
      dohyun: 'hidden',
      johnbekim: 'hidden',
      tracklist: 'locked',
      report: 'locked',
    },
    activeMissionId: null,
    released: false,
    affection: { count: 0, warned: false },
    duolingoVisited: false,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_INTRO': {
      if (state.intro.started) return state
      const next = deliverMessage(state, 'manager', managerScript.intro, action.now)
      return { ...next, intro: { ...next.intro, started: true } }
    }
    case 'SEND_MESSAGE':
      return sendMessage(state, action.chatId, action.text, action.now)
    case 'SEND_ATTACHMENT':
      return sendAttachment(state, action.chatId, action.kind, action.attachmentId, action.now)
    case 'DELIVER_DUE':
      return deliverDue(state, action.now)
    case 'OPEN_CHAT': {
      const thread = state.chats[action.chatId]
      const bannerForChat = state.banner?.chatId === action.chatId
      const opened: GameState = {
        ...state,
        activeChat: action.chatId,
        chats: { ...state.chats, [action.chatId]: { ...thread, unread: 0 } },
        banner: bannerForChat ? null : state.banner,
        intro: { ...state.intro, notificationSeen: state.intro.notificationSeen || bannerForChat },
      }
      // 이전에 보내 둔 메시지가 있고 이제 답장할 수 있으면 읽고 답장 시작
      return readPending(opened, action.chatId, action.now)
    }
    case 'CLOSE_CHAT':
      return state.activeChat === action.chatId ? { ...state, activeChat: null } : state
    case 'DISMISS_BANNER':
      if (!state.banner) return state
      return { ...state, banner: null, intro: { ...state.intro, notificationSeen: true } }
    case 'COMPLETE_MISSION':
      return completeMission(state, action.id, action.now)
    case 'RELEASE': {
      if (!missions.every((m) => state.missionStatuses[m.id] === 'completed')) return state
      return { ...state, released: true }
    }
    case 'VISIT_DUOLINGO':
      return state.duolingoVisited ? state : { ...state, duolingoVisited: true }
    case 'RESET':
      return createInitialState()
  }
}
