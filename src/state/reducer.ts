import { chatOrder, managerScript, type ChatId } from '../content/chats'
import { missions, todoContent } from '../content/missions'
import { initialFlows } from '../chat/scripts'
import { lyricBlanks } from '../missions/lyricsCheck'
import {
  completeMission,
  deliverDue,
  deliverMessage,
  pushTodoNotice,
  readPending,
  sendAttachment,
  sendMessage,
  submitLyrics,
} from './chat'
import type { Banner, ChatThread, GameAction, GameState } from './types'

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
    banners: [],
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
    lyrics: { inputs: {}, submissions: [] },
    affection: { count: 0, warned: false },
    duolingoVisited: false,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_INTRO': {
      if (state.intro.started) return state
      const delivered = deliverMessage(state, 'manager', managerScript.intro, action.now)
      // 팀장님 첫 카톡 다음으로 TODO 알림 — "오늘 일정을 확인해 주세요!"
      const { intro } = todoContent.notifications
      const next = pushTodoNotice(delivered, intro.title, intro.body, action.now)
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
      const isThisChat = (b: Banner) => b.kind === 'chat' && b.chatId === action.chatId
      const opened: GameState = {
        ...state,
        activeChat: action.chatId,
        chats: { ...state.chats, [action.chatId]: { ...thread, unread: 0 } },
        // 이 채팅방 알림은 이제 필요 없음
        banners: state.banners.filter((b) => !isThisChat(b)),
        intro: {
          ...state.intro,
          notificationSeen: state.intro.notificationSeen || (action.chatId === 'manager' && state.banners.some(isThisChat)),
        },
      }
      // 이전에 보내 둔 메시지가 있고 이제 답장할 수 있으면 읽고 답장 시작
      return readPending(opened, action.chatId, action.now)
    }
    case 'CLOSE_CHAT':
      return state.activeChat === action.chatId ? { ...state, activeChat: null } : state
    case 'DISMISS_BANNER': {
      const banner = state.banners.find((b) => b.id === action.id)
      if (!banner) return state
      const managerSeen = banner.kind === 'chat' && banner.chatId === 'manager'
      return {
        ...state,
        banners: state.banners.filter((b) => b.id !== action.id),
        intro: { ...state.intro, notificationSeen: state.intro.notificationSeen || managerSeen },
      }
    }
    case 'COMPLETE_MISSION':
      return completeMission(state, action.id, action.now)
    case 'SET_LYRIC_INPUT': {
      // 검수가 끝난 뒤나 없는 빈칸은 무시
      if (state.missionStatuses.dohyun === 'completed' || !lyricBlanks.some((b) => b.id === action.blankId)) return state
      return { ...state, lyrics: { ...state.lyrics, inputs: { ...state.lyrics.inputs, [action.blankId]: action.value } } }
    }
    case 'SUBMIT_LYRICS':
      return submitLyrics(state, action.now)
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
