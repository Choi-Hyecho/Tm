// 채팅 관련 상태 변경 도우미 (reducer에서 사용하는 순수 함수)
import { isAffection } from '../chat/intent'
import type { ReplyContext } from '../chat/ruleEngine'
import { responders } from '../chat/scripts'
import { attachmentReplies, chatContent, type ChatId, type MemberId } from '../content/chats'
import { findPhoto } from '../content/gallery'
import { findFile } from '../content/gameFiles'
import { affectionWarning } from '../content/managerReplies'
import { affectionHesitation, memberGreetings } from '../content/memberGreetings'
import { isMemberMission, type MissionId } from '../content/missions'
import { attachmentChecks } from '../missions/attachmentChecks'
import { getActiveMissions, getMissionStatus, getProgress } from './selectors'
import type { ChatMessage, GameState, ScheduledMessage } from './types'

/** 답장 엔진에 넘기는 게임 상태 — TODO 진행도/미션 상태는 공통 게임 상태에서 계산 */
export function getReplyContext(state: GameState): ReplyContext {
  const { done, total } = getProgress(state)
  return {
    progress: { done, total },
    released: state.released,
    availableMissions: getActiveMissions(state),
    activeMissionId: state.activeMissionId,
    missionStatuses: state.missionStatuses,
  }
}

/** 다른 멤버 업무가 진행 중이라 지금은 답장하지 않는 상대 (팀장님은 항상 답장) */
export function isBusy(state: GameState, chatId: ChatId) {
  return chatId !== 'manager' && state.activeMissionId !== null && state.activeMissionId !== chatId
}

/** 답장 길이에 비례한 '입력 중' 시간 */
function typingDelay(text: string) {
  return Math.min(2400, Math.max(900, 700 + text.length * 30))
}

const messageId = (chatId: ChatId, index: number, now: number) => `${chatId}-${index}-${now}`

/** 상대방 메시지 도착 — 보고 있는 채팅방이 아니면 안 읽음 + 알림 배너 */
export function deliverMessage(state: GameState, chatId: ChatId, text: string, now: number): GameState {
  const thread = state.chats[chatId]
  const message: ChatMessage = { id: messageId(chatId, thread.messages.length, now), from: chatId, text, at: now }
  const isActive = state.activeChat === chatId

  return {
    ...state,
    chats: {
      ...state.chats,
      [chatId]: { ...thread, messages: [...thread.messages, message], unread: isActive ? 0 : thread.unread + 1 },
    },
    banner: isActive ? state.banner : { chatId, messageId: message.id },
  }
}

/** 고민 연출: 입력 중이 뜨기까지 잠깐 텀 */
const HESITATE_START_MS = 500

/** 고민하는 시간 — 범위 안에서 랜덤. reducer가 순수하도록 Math.random 대신 보낸 시각으로 섞음 */
function hesitationPause(now: number) {
  const { pauseMinMs, pauseMaxMs } = affectionHesitation
  return pauseMinMs + ((now * 7919) % (pauseMaxMs - pauseMinMs + 1))
}

/** 답장 예약 — 이미 예약된 답장 뒤로 이어서 도착 */
export function scheduleReplies(
  state: GameState,
  chatId: ChatId,
  replies: string[],
  now: number,
  options: { reveal?: { missionId: MemberId; index: number }; hesitate?: boolean } = {},
): GameState {
  const { reveal, hesitate } = options
  let time = Math.max(now, ...state.scheduled.filter((s) => s.chatId === chatId).map((s) => s.deliverAt))
  const scheduled: ScheduledMessage[] = replies.map((text, i) => {
    const base = { chatId, text, revealMission: reveal?.index === i ? reveal.missionId : undefined }
    if (hesitate && i === 0) {
      // 입력 중… → 사라짐(고민) → 다시 입력 중… → 도착
      const start = time + HESITATE_START_MS
      const resume = start + affectionHesitation.typingMs + hesitationPause(now)
      time = resume + typingDelay(text)
      return { ...base, deliverAt: time, typingWindows: [[start, start + affectionHesitation.typingMs], [resume, time]] }
    }
    time += typingDelay(text)
    return { ...base, deliverAt: time }
  })
  return { ...state, scheduled: [...state.scheduled, ...scheduled] }
}

/** 상대가 내 메시지들을 읽고 답장 — 여러 개면 순서대로 대화 흐름을 이어서 처리 (같은 답이 연달아 나오면 한 번만) */
function respond(state: GameState, chatId: ChatId, messages: ChatMessage[], now: number): GameState {
  let next = state
  let lastReply: string | undefined
  for (const message of messages) {
    // 사진/파일 — 미션 판별 또는 일반 답장
    if (message.kind === 'image' || message.kind === 'file') {
      next = respondAttachment(next, chatId, message, now)
      lastReply = undefined
      continue
    }

    const text = message.text
    const thread = next.chats[chatId]
    const result = responders[chatId]({
      flow: thread.flow,
      conversationContext: thread.conversationContext ?? null,
      text,
      turn: thread.messages.length,
      game: getReplyContext(next),
    })

    next = { ...next, chats: { ...next.chats, [chatId]: { ...thread, flow: result.flow, conversationContext: result.conversationContext } } }

    // 업무 요청 — 지금 이 순간부터 이 멤버만 업무 진행 (다른 멤버는 답장 보류)
    const startMission = result.startMission && chatId !== 'manager' && next.activeMissionId === null
    if (startMission) next = { ...next, activeMissionId: chatId as MemberId }
    const reveal =
      startMission && result.missionRequestIndex !== undefined
        ? { missionId: chatId as MemberId, index: result.missionRequestIndex }
        : undefined

    const repeated = !reveal && result.replies.length === 1 && result.replies[0] === lastReply
    if (!repeated) next = scheduleReplies(next, chatId, result.replies, now, { reveal, hesitate: result.hesitate })
    lastReply = result.replies.at(-1)
  }
  return next
}

/**
 * 첨부 답장 — 이 멤버의 첨부 미션이 진행 중(active)일 때만 asset ID로 정답 판별.
 * 업무 공개 전(hidden)이거나 완료 후라면 미션에 영향 없이 일반 답장만
 */
function respondAttachment(state: GameState, chatId: ChatId, message: ChatMessage, now: number): GameState {
  const kind = message.kind === 'file' ? 'file' : 'image'
  const check = chatId === 'manager' ? undefined : attachmentChecks[chatId]
  if (check && check.kind === kind && getMissionStatus(state, chatId as MemberId) === 'active') {
    return message.attachmentId === check.correctId
      ? completeMission(state, chatId as MemberId, now)
      : scheduleReplies(state, chatId, [check.wrongReply(message.attachmentId)], now)
  }
  const lines = chatId === 'manager' ? attachmentReplies.manager : attachmentReplies.member
  return scheduleReplies(state, chatId, [lines[kind]], now)
}

/**
 * 미션 완료 — 진행 중(active)인 업무만. 멤버 업무면 완료 인사를 보내고 activeMissionId 해제.
 * 숨김/잠김/이미 완료된 업무는 무시 (보상 중복 방지)
 */
export function completeMission(state: GameState, id: MissionId, now: number): GameState {
  if (getMissionStatus(state, id) !== 'active') return state
  let next: GameState = { ...state, missionStatuses: { ...state.missionStatuses, [id]: 'completed' } }
  if (!isMemberMission(id)) return next

  next = { ...next, activeMissionId: next.activeMissionId === id ? null : next.activeMissionId }
  next = scheduleReplies(next, id, [memberGreetings[id].missionDone], now)
  // 다른 멤버들이 한꺼번에 답장하지 않도록, 지금 보고 있는 채팅방만 보류 메시지 처리
  if (next.activeChat && next.activeChat !== id) next = readPending(next, next.activeChat, now)
  return next
}

/** 내 메시지 추가 — 상대가 바쁘면 읽지 않음(1)으로 보류, 아니면 바로 읽고 답장 */
function addMyMessage(state: GameState, chatId: ChatId, content: Pick<ChatMessage, 'kind' | 'attachmentId' | 'text'>, now: number) {
  const busy = isBusy(state, chatId)
  const thread = state.chats[chatId]
  const message: ChatMessage = { id: messageId(chatId, thread.messages.length, now), from: 'me', at: now, read: !busy, ...content }
  const next: GameState = {
    ...state,
    chats: { ...state.chats, [chatId]: { ...thread, messages: [...thread.messages, message] } },
  }
  return busy
    ? { ...next, pendingMessages: { ...next.pendingMessages, [chatId]: [...next.pendingMessages[chatId], message.id] } }
    : respond(next, chatId, [message], now)
}

export function sendMessage(state: GameState, chatId: ChatId, rawText: string, now: number): GameState {
  const text = rawText.trim()
  if (!text) return state
  return countAffection(addMyMessage(state, chatId, { kind: 'text', text }, now), chatId, text, now)
}

/** 사진/파일 전송 — 존재하는 asset만 */
export function sendAttachment(
  state: GameState,
  chatId: ChatId,
  kind: 'image' | 'file',
  attachmentId: string,
  now: number,
): GameState {
  const preview = kind === 'image' ? findPhoto(attachmentId) && chatContent.photoPreview : findFile(attachmentId)?.fileName
  if (!preview) return state
  const text = kind === 'image' ? preview : chatContent.filePreview(preview)
  return addMyMessage(state, chatId, { kind, attachmentId, text }, now)
}

/** 멤버에게 애정 표현을 여러 번 하면 팀장님이 한 번 경고 (멤버 반응 뒤에 도착) */
function countAffection(state: GameState, chatId: ChatId, text: string, now: number): GameState {
  if (chatId === 'manager' || !isAffection(text)) return state
  const count = state.affection.count + 1
  const warn = !state.affection.warned && count >= affectionWarning.threshold
  const next: GameState = { ...state, affection: { count, warned: state.affection.warned || warn } }
  if (!warn) return next
  // 멤버 반응(고민 연출 포함)이 도착한 뒤에 경고가 오도록
  const memberReplyAt = Math.max(now, ...next.scheduled.filter((s) => s.chatId === chatId).map((s) => s.deliverAt))
  return scheduleReplies(next, 'manager', [affectionWarning.message], memberReplyAt + affectionWarning.delayMs)
}

/** 보류된 내 메시지를 읽음 처리하고 답장 시작 — 상대가 이제 바쁘지 않을 때만 (채팅방에 들어왔을 때 호출) */
export function readPending(state: GameState, chatId: ChatId, now: number): GameState {
  const pendingIds = state.pendingMessages[chatId]
  if (pendingIds.length === 0 || isBusy(state, chatId)) return state

  const thread = state.chats[chatId]
  const pending = thread.messages.filter((m) => pendingIds.includes(m.id))
  const next: GameState = {
    ...state,
    chats: {
      ...state.chats,
      [chatId]: { ...thread, messages: thread.messages.map((m) => (pendingIds.includes(m.id) ? { ...m, read: true } : m)) },
    },
    pendingMessages: { ...state.pendingMessages, [chatId]: [] },
  }
  return respond(next, chatId, pending, now)
}

/** 도착 시간이 된 예약 답장을 순서대로 배달 — 업무 요청 메시지가 도착하면 TODO에 업무 공개 */
export function deliverDue(state: GameState, now: number): GameState {
  const due = state.scheduled.filter((s) => s.deliverAt <= now).sort((a, b) => a.deliverAt - b.deliverAt)
  if (due.length === 0) return state

  const rest = state.scheduled.filter((s) => s.deliverAt > now)
  return due.reduce((next, s) => {
    const delivered = deliverMessage(next, s.chatId, s.text, s.deliverAt)
    if (!s.revealMission || delivered.missionStatuses[s.revealMission] !== 'hidden') return delivered
    return { ...delivered, missionStatuses: { ...delivered.missionStatuses, [s.revealMission]: 'active' } }
  }, { ...state, scheduled: rest })
}

export function getUnreadTotal(state: GameState) {
  return Object.values(state.chats).reduce((sum, thread) => sum + thread.unread, 0)
}
