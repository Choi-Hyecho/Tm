import { chatOrder, managerScript, type ChatId } from '../content/chats'
import { findFile } from '../content/gameFiles'
import { missions, todoContent } from '../content/missions'
import { staticNotes } from '../content/notes'
import { releaseContent } from '../content/release'
import { initialFlows } from '../chat/scripts'
import { lyricBlanks } from '../missions/lyricsCheck'
import {
  completeMission,
  deliverDue,
  deliverMessage,
  pushSentNotice,
  pushTodoNotice,
  readPending,
  sendAttachment,
  sendMessage,
  shareTracklist,
  submitLyrics,
  submitTracklist,
} from './chat'
import { tracklistQuest } from '../content/quests/tracklist'
import { PROFILE_LIMITS } from './profile'
import { getMissionStatus } from './selectors'
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
    lastCompletedMission: null,
    released: false,
    endingViewed: false,
    showEnding: false,
    lyrics: { inputs: {}, submissions: [] },
    affection: { count: 0, warned: false },
    duolingoVisited: false,
    downloads: [],
    userNotes: [],
    noteEdits: {},
    tracklist: { order: tracklistQuest.initialOrder, shared: false, submissions: 0 },
    profile: { name: '', status: '', photoId: null },
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_INTRO': {
      if (state.intro.started) return state
      const delivered = deliverMessage(state, 'manager', managerScript.intro, action.now)
      // 팀장님 첫 카톡 다음으로 TODO 알림 — "오늘 일정을 확인해 주세요!" (팀장님 메시지를 읽을 틈을 두고)
      const { intro } = todoContent.notifications
      const next = pushTodoNotice(delivered, intro.title, intro.body, action.now, action.now + intro.delayMs)
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
      const isThisChat = (b: Banner) => (b.kind === 'chat' || b.kind === 'sent') && b.chatId === action.chatId
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
      const read = readPending(opened, action.chatId, action.now)
      // 멤버 업무가 다 끝났는데 플레이리스트를 아직 못 받았으면(예전 저장 데이터) 팀장님 채팅방에서 공유
      return action.chatId === 'manager' ? shareTracklist(read, action.now) : read
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
      // 한 번만 — 1~5번 업무가 실제로 끝나 최종 보고가 진행 가능할 때만
      if (state.released || getMissionStatus(state, 'report') !== 'active') return state
      // 보고 메시지 + 팀장님 축하 → 최종 보고 완료 → 발매
      const thread = state.chats.manager
      const report: GameState = {
        ...state,
        chats: {
          ...state.chats,
          manager: {
            ...thread,
            messages: [
              ...thread.messages,
              { id: `manager-${thread.messages.length}-${action.now}`, from: 'me', text: releaseContent.myMessage, at: action.now, read: true },
            ],
          },
        },
      }
      const replied = deliverMessage(report, 'manager', releaseContent.managerMessage, action.now + 1)
      return { ...completeMission(replied, 'report', action.now), released: true, showEnding: true }
    }
    case 'CLOSE_ENDING':
      return state.showEnding ? { ...state, showEnding: false, endingViewed: true } : state
    case 'REPLAY_ENDING':
      return state.released ? { ...state, showEnding: true } : state
    case 'DEV_FORCE_RELEASE': {
      if (state.released) return state
      const done = Object.fromEntries(missions.map((m) => [m.id, 'completed'])) as GameState['missionStatuses']
      return { ...state, missionStatuses: done, activeMissionId: null, released: true, showEnding: true }
    }
    case 'SET_PROFILE':
      return {
        ...state,
        profile: {
          name: action.name.trim().slice(0, PROFILE_LIMITS.name),
          status: action.status.trim().slice(0, PROFILE_LIMITS.status),
          photoId: action.photoId,
        },
      }
    case 'NOTIFY_SENT':
      return pushSentNotice(state, action.chatId, action.now)
    case 'DOWNLOAD_FILE':
      if (!findFile(action.fileId) || state.downloads.includes(action.fileId)) return state
      return { ...state, downloads: [...state.downloads, action.fileId] }
    case 'CREATE_NOTE':
      if (state.userNotes.some((n) => n.id === action.id)) return state
      return { ...state, userNotes: [...state.userNotes, { id: action.id, body: '', updatedAt: action.now }] }
    case 'UPDATE_NOTE': {
      if (state.userNotes.some((n) => n.id === action.id)) {
        return {
          ...state,
          userNotes: state.userNotes.map((n) => (n.id === action.id ? { ...n, body: action.body, updatedAt: action.now } : n)),
        }
      }
      // 기본 메모는 고친 내용만 따로 저장 (원문은 content/notes.ts)
      if (!staticNotes.some((n) => n.id === action.id)) return state
      return { ...state, noteEdits: { ...state.noteEdits, [action.id]: { body: action.body, updatedAt: action.now } } }
    }
    case 'DELETE_NOTE':
      return { ...state, userNotes: state.userNotes.filter((n) => n.id !== action.id) }
    case 'SET_TRACKLIST_ORDER': {
      // 검수가 끝났거나 곡 목록이 맞지 않는 순서는 무시
      const valid =
        action.order.length === tracklistQuest.correctOrder.length &&
        [...action.order].sort().join() === [...tracklistQuest.correctOrder].sort().join()
      if (!valid || state.missionStatuses.tracklist === 'completed') return state
      return { ...state, tracklist: { ...state.tracklist, order: action.order } }
    }
    case 'SUBMIT_TRACKLIST':
      return submitTracklist(state, action.now)
    case 'VISIT_DUOLINGO':
      return state.duolingoVisited ? state : { ...state, duolingoVisited: true }
    case 'RESET':
      return createInitialState()
  }
}
