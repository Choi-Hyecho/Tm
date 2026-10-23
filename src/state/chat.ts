// 채팅 관련 상태 변경 도우미 (reducer에서 사용하는 순수 함수)
import { isAffection } from '../chat/intent'
import { pickFresh, type LinePicker, type ReplyContext } from '../chat/ruleEngine'
import { responders } from '../chat/scripts'
import { chatContent, chats, type ChatId, type MemberId } from '../content/chats'
import { findPhoto, PHOTO_OWNER_LABELS } from '../content/gallery'
import { findFile } from '../content/gameFiles'
import { shareReactions } from '../content/shareReactions'
import { affectionWarning } from '../content/managerReplies'
import { affectionHesitation, memberScripts } from '../content/members'

/** 반복 방지에 참고할 상대의 최근 메시지 수 */
const RECENT_LIMIT = 8

/** 곧 도착할 상대의 답장 */
const upcomingReplies = (state: GameState, chatId: ChatId) =>
  state.scheduled.filter((s) => s.chatId === chatId).map((s) => s.text)

/** 상대가 최근에 한 말 + 곧 도착할 말 — 같은 대사가 반복되지 않도록 */
const recentReplies = (state: GameState, chatId: ChatId) => [
  ...state.chats[chatId].messages
    .filter((m) => m.from === chatId)
    .slice(-RECENT_LIMIT)
    .map((m) => m.text),
  ...upcomingReplies(state, chatId),
]

/** 최근에 한 말을 피해서 고르는 picker — 같은 picker로 여러 줄을 고르면 서로도 겹치지 않음 */
function pickerFor(state: GameState, chatId: ChatId): LinePicker {
  const recent = recentReplies(state, chatId)
  let seed = state.chats[chatId].messages.length + recent.length
  return (lines) => {
    const line = pickFresh(lines, recent, seed++)
    recent.push(line)
    return line
  }
}
import { isMemberMission, missionLabel, missions, todoContent, type MissionId } from '../content/missions'
import { dohyunQuest } from '../content/quests/dohyun'
import { attachmentChecks } from '../missions/attachmentChecks'
import { allBlanksFilled, isLyricsCorrect, lyricsFileName, renderLyrics } from '../missions/lyricsCheck'
import { findNote } from './notes'
import { getActiveMissions, getMissionStatus, getProgress } from './selectors'
import type { Banner, ChatMessage, GameState, ScheduledMessage, ShareKind, SharedFile } from './types'

/** 답장 엔진에 넘기는 게임 상태 — TODO 진행도/미션 상태는 공통 게임 상태에서 계산 */
export function getReplyContext(state: GameState): ReplyContext {
  const { done, total } = getProgress(state)
  return {
    progress: { done, total },
    released: state.released,
    availableMissions: getActiveMissions(state),
    activeMissionId: state.activeMissionId,
    missionStatuses: state.missionStatuses,
    lyricsWrongCount: state.lyrics.submissions.filter((s) => !s.correct).length,
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

/**
 * 알림 추가 — 같은 채팅방 알림이 이미 기다리고 있으면 최신 메시지로 바꿔서 쌓이지 않게 함.
 * 그 밖에는 뒤에 붙여 차례대로 표시
 */
function pushBanner(state: GameState, banner: Banner): GameState {
  if (banner.kind === 'chat') {
    const index = state.banners.findIndex((b) => b.kind === 'chat' && b.chatId === banner.chatId)
    if (index >= 0) return { ...state, banners: state.banners.map((b, i) => (i === index ? banner : b)) }
  }
  return { ...state, banners: [...state.banners, banner] }
}

/** TODO 알림 — 업무 등록/완료/열림 */
export function pushTodoNotice(state: GameState, title: string, body: string, now: number, notBefore?: number): GameState {
  return pushBanner(state, { id: `todo-${state.banners.length}-${now}-${body}`, kind: 'todo', title, body, notBefore })
}

/** 상대방 메시지 도착 — 보고 있는 채팅방이 아니면 안 읽음 + 알림 배너 */
export function deliverMessage(
  state: GameState,
  chatId: ChatId,
  text: string,
  now: number,
  /** 파일 메시지로 도착 (상대가 보내는 파일) */
  attachment?: SharedFile,
): GameState {
  const thread = state.chats[chatId]
  const message: ChatMessage = {
    id: messageId(chatId, thread.messages.length, now),
    from: chatId,
    text,
    at: now,
    ...(attachment?.action === 'openNotes' && {
      kind: 'file' as const,
      document: { fileName: attachment.fileName, content: '' },
      action: attachment.action,
    }),
    // 누르면 파일 앱에 저장되는 파일
    ...(attachment?.action === 'download' && { kind: 'file' as const, attachmentId: attachment.fileId, action: attachment.action }),
  }
  const isActive = state.activeChat === chatId

  const next: GameState = {
    ...state,
    chats: {
      ...state.chats,
      [chatId]: { ...thread, messages: [...thread.messages, message], unread: isActive ? 0 : thread.unread + 1 },
    },
  }
  return isActive ? next : pushBanner(next, { id: message.id, kind: 'chat', chatId, messageId: message.id })
}

/** 파일 전송 예약 — 이미 예약된 답장 뒤에 잠깐 텀을 두고 도착 */
function scheduleAttachment(state: GameState, chatId: ChatId, attachment: SharedFile, now: number): GameState {
  const after = Math.max(now, ...state.scheduled.filter((s) => s.chatId === chatId).map((s) => s.deliverAt))
  const fileName = attachment.action === 'download' ? findFile(attachment.fileId)?.fileName : attachment.fileName
  if (!fileName) return state
  const message: ScheduledMessage = {
    chatId,
    text: chatContent.filePreview(fileName),
    deliverAt: after + FILE_DELAY_MS,
    attachment,
  }
  return { ...state, scheduled: [...state.scheduled, message] }
}

const FILE_DELAY_MS = 900

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
  options: {
    reveal?: { missionId: MemberId; index: number }
    hesitate?: boolean
    /** 마지막 답장이 도착하면 이 업무 완료 */
    completeAfter?: MemberId
  } = {},
): GameState {
  const { reveal, hesitate, completeAfter } = options
  let time = Math.max(now, ...state.scheduled.filter((s) => s.chatId === chatId).map((s) => s.deliverAt))
  const scheduled: ScheduledMessage[] = replies.map((text, i) => {
    const base = {
      chatId,
      text,
      revealMission: reveal?.index === i ? reveal.missionId : undefined,
      completeMission: i === replies.length - 1 ? completeAfter : undefined,
    }
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

/** 상대가 내 메시지들을 읽고 답장 — 여러 개면 순서대로 대화 흐름을 이어서 처리 (같은 종류가 연달아 나오면 한 번만) */
function respond(state: GameState, chatId: ChatId, messages: ChatMessage[], now: number): GameState {
  let next = state
  let lastReply: string | undefined
  let lastCategory: string | undefined
  for (const message of messages) {
    // 사진/파일 — 미션 판별 또는 일반 답장
    if (message.kind === 'image' || message.kind === 'file') {
      next = respondAttachment(next, chatId, message, now)
      lastReply = undefined
      lastCategory = undefined
      continue
    }

    const text = message.text
    const thread = next.chats[chatId]
    const upcoming = upcomingReplies(next, chatId)
    const result = responders[chatId]({
      flow: thread.flow,
      conversationContext: thread.conversationContext ?? null,
      text,
      turn: thread.messages.length + upcoming.length,
      // 상대가 최근에 한 말 + 곧 도착할 말 — 같은 대사가 반복되지 않도록
      recent: recentReplies(next, chatId),
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

    // 한꺼번에 읽은 메시지가 같은 종류로 이어지면(예: 애정 표현 여러 번) 답은 한 번만
    const repeated =
      !reveal &&
      result.replies.length === 1 &&
      (result.category !== undefined ? result.category === lastCategory : result.replies[0] === lastReply)
    const completeAfter = result.completeMission && chatId !== 'manager' ? (chatId as MemberId) : undefined
    if (!repeated) next = scheduleReplies(next, chatId, result.replies, now, { reveal, hesitate: result.hesitate, completeAfter })
    // 답장이 다 도착한 뒤 팀장님 카톡
    if (result.managerFollowup && chatId !== 'manager') {
      const lastAt = Math.max(now, ...next.scheduled.filter((s) => s.chatId === chatId).map((s) => s.deliverAt))
      next = scheduleReplies(next, 'manager', [result.managerFollowup.text], lastAt + result.managerFollowup.delayMs)
    }
    // 답장 다음에 파일 (예: 도현의 가사 메모 파일, 존비킴의 믹싱 파일)
    for (const attachment of result.attachments ?? []) next = scheduleAttachment(next, chatId, attachment, now)
    lastReply = result.replies.at(-1)
    lastCategory = result.category
  }
  return next
}

/**
 * 첨부 답장 — 이 멤버의 첨부 미션이 진행 중(active)일 때만 asset ID로 정답 판별.
 * 업무 공개 전(hidden)이거나 완료 후, 또는 다른 사람에게 보냈으면 받는 사람별 반응 (content/shareReactions.ts)
 */
function respondAttachment(state: GameState, chatId: ChatId, message: ChatMessage, now: number): GameState {
  const kind = message.kind === 'file' ? 'file' : 'image'
  const check = chatId === 'manager' ? undefined : attachmentChecks[chatId]
  if (check && check.kind === kind && getMissionStatus(state, chatId as MemberId) === 'active') {
    return message.attachmentId === check.correctId
      ? completeMission(state, chatId as MemberId, now)
      : scheduleReplies(state, chatId, check.wrongReplies(message.attachmentId, pickerFor(state, chatId)), now)
  }
  const reacted = scheduleReplies(state, chatId, shareReaction(state, chatId, message), now)
  return chatId === 'manager' ? reacted : scheduleMemoTattle(reacted, chatId, message)
}

/** 멤버가 받은 메모(At Home 등)를 팀장님께 이른 것처럼 — 멤버 답장 뒤 팀장님 카톡 (이미 예약돼 있으면 또 보내지 않음) */
function scheduleMemoTattle(state: GameState, memberId: ChatId, message: ChatMessage): GameState {
  const tattle = message.document && message.attachmentId ? shareReactions.memoTattle[message.attachmentId] : undefined
  if (!tattle) return state
  // 여러 멤버에게 연달아 보내도 팀장님은 한 번만 (아직 도착 안 한 같은 종류 카톡이 있으면 생략)
  const isTattleLine = (text: string) =>
    tattle.manager.flat().some((line) => {
      const [before, after] = line.split('{member}')
      return after === undefined ? text === line : text.startsWith(before) && text.endsWith(after)
    })
  if (upcomingReplies(state, 'manager').some(isTattleLine)) return state
  // 최근에 안 한 말 묶음
  const recent = recentReplies(state, 'manager')
  const name = chats[memberId].name
  const groups = tattle.manager.map((lines) => lines.map((l) => l.replaceAll('{member}', name)))
  const fresh = groups.filter((g) => !g.some((l) => recent.includes(l)))
  const pool = fresh.length > 0 ? fresh : groups
  const lines = pool[(state.chats.manager.messages.length * 7919 + 13) % pool.length]
  const memberReplyAt = Math.max(...state.scheduled.filter((s) => s.chatId === memberId).map((s) => s.deliverAt))
  return scheduleReplies(state, 'manager', lines, memberReplyAt + tattle.delayMs)
}

/** 미션과 관계없이 사진/파일/메모를 받았을 때 반응 — 최근에 안 한 말로 */
function shareReaction(state: GameState, chatId: ChatId, message: ChatMessage): string[] {
  const { photo, file, memo } = shareReactions
  const recent = recentReplies(state, chatId)
  const pickLines = (lines: (string | string[])[]) => {
    const groups = lines.map((l) => (Array.isArray(l) ? l : [l]))
    const fresh = groups.filter((g) => !g.some((line) => recent.includes(line)))
    const pool = fresh.length > 0 ? fresh : groups
    return pool[(state.chats[chatId].messages.length * 7919 + 13) % pool.length]
  }

  // 메모 (메모 ID가 attachmentId)
  if (message.document && message.attachmentId) {
    return pickLines((memo[message.attachmentId] ?? memo.default)[chatId])
  }
  if (message.kind === 'file') return pickLines(file[chatId])

  const shot = findPhoto(message.attachmentId)
  const owner = shot?.owner
  const label = owner ? PHOTO_OWNER_LABELS[owner] : ''
  const lines =
    chatId === 'manager'
      ? owner === 'group' ? photo.managerGroup : photo.manager
      : owner === 'group' ? photo.group
      : owner === chatId ? photo.self[chatId]
      : photo.other[chatId]
  return pickLines(lines).map((line) => line.replaceAll('{owner}', label))
}

/**
 * 미션 완료 — 진행 중(active)인 업무만. 멤버 업무면 완료 인사를 보내고 activeMissionId 해제.
 * 숨김/잠김/이미 완료된 업무는 무시 (보상 중복 방지)
 */
export function completeMission(
  state: GameState,
  id: MissionId,
  now: number,
  options: { /** 멤버가 이미 감사 답장을 보냈으면 기본 완료 인사 생략 */ skipDoneMessage?: boolean } = {},
): GameState {
  if (getMissionStatus(state, id) !== 'active') return state
  let next: GameState = { ...state, missionStatuses: { ...state.missionStatuses, [id]: 'completed' } }

  // TODO 알림 — 완료, 그리고 이번 완료로 새로 열린 업무(트랙리스트/최종 보고)
  const { notifications } = todoContent
  next = pushTodoNotice(next, notifications.completedTitle, missionLabel(id), now)
  for (const m of missions) {
    if (getMissionStatus(state, m.id) === 'locked' && getMissionStatus(next, m.id) === 'active') {
      next = pushTodoNotice(next, notifications.unlockedTitle, missionLabel(m.id), now)
    }
  }
  if (!isMemberMission(id)) return next

  next = { ...next, activeMissionId: next.activeMissionId === id ? null : next.activeMissionId }
  if (!options.skipDoneMessage) next = scheduleReplies(next, id, [memberScripts[id].missionDone], now)
  // 다른 멤버들이 한꺼번에 답장하지 않도록, 지금 보고 있는 채팅방만 보류 메시지 처리
  if (next.activeChat && next.activeChat !== id) next = readPending(next, next.activeChat, now)
  return next
}

/** 내 메시지 추가 — 상대가 바쁘면 읽지 않음(1)으로 보류, 아니면 바로 읽고 답장 */
function addMyMessage(
  state: GameState,
  chatId: ChatId,
  content: Pick<ChatMessage, 'kind' | 'attachmentId' | 'text' | 'document'>,
  now: number,
) {
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

/**
 * 도현 가사 검수 전송 — 메모 내용을 TXT 파일 메시지로 보내고 그때 채점.
 * 틀리면 회차별 답장 (위치/정답은 알려주지 않음), 맞으면 감사 답장이 도착한 뒤 업무 완료
 */
export function submitLyrics(state: GameState, now: number): GameState {
  const { inputs, submissions } = state.lyrics
  if (getMissionStatus(state, 'dohyun') !== 'active' || !allBlanksFilled(inputs)) return state

  const number = submissions.length + 1
  const fileName = lyricsFileName(number)
  const correct = isLyricsCorrect(inputs)
  const thread = state.chats.dohyun
  const message: ChatMessage = {
    id: messageId('dohyun', thread.messages.length, now),
    from: 'me',
    kind: 'file',
    text: chatContent.filePreview(fileName),
    // 보낸 당시 내용 그대로 — 이후 메모를 고쳐도 이 파일은 바뀌지 않음
    document: { fileName, content: renderLyrics(inputs) },
    at: now,
    read: true,
  }
  const next: GameState = {
    ...state,
    chats: { ...state.chats, dohyun: { ...thread, messages: [...thread.messages, message] } },
    lyrics: { ...state.lyrics, submissions: [...submissions, { number, fileName, correct, at: now }] },
  }

  const { lines } = dohyunQuest
  if (correct) return scheduleReplies(next, 'dohyun', lines.correct, now, { completeAfter: 'dohyun' })
  const wrongCount = submissions.filter((s) => !s.correct).length + 1
  return scheduleReplies(next, 'dohyun', [lines.wrong[Math.min(wrongCount, lines.wrong.length) - 1]], now)
}

/** 사진/파일/메모 전송 (카톡 첨부 또는 공유 시트) — 존재하는 asset만 */
export function sendAttachment(state: GameState, chatId: ChatId, kind: ShareKind, attachmentId: string, now: number): GameState {
  if (kind === 'image') {
    if (!findPhoto(attachmentId)) return state
    return addMyMessage(state, chatId, { kind, attachmentId, text: chatContent.photoPreview }, now)
  }
  if (kind === 'file') {
    const file = findFile(attachmentId)
    if (!file) return state
    return addMyMessage(state, chatId, { kind, attachmentId, text: chatContent.filePreview(file.fileName) }, now)
  }
  // 메모 — 보낸 당시 내용 그대로 TXT 파일로 (고친 내용/내가 만든 메모 포함)
  const note = findNote(state, attachmentId)
  if (!note) return state
  const fileName = `${note.title}.txt`
  const document = { fileName, content: note.body }
  return addMyMessage(state, chatId, { kind: 'file', attachmentId, document, text: chatContent.filePreview(fileName) }, now)
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
    const delivered = deliverMessage(next, s.chatId, s.text, s.deliverAt, s.attachment)
    // 답장이 도착한 뒤 업무 완료 (도현 가사 검수)
    if (s.completeMission) return completeMission(delivered, s.completeMission, s.deliverAt, { skipDoneMessage: true })
    if (!s.revealMission || delivered.missionStatuses[s.revealMission] !== 'hidden') return delivered
    const revealed: GameState = { ...delivered, missionStatuses: { ...delivered.missionStatuses, [s.revealMission]: 'active' } }
    return pushTodoNotice(revealed, todoContent.notifications.addedTitle, missionLabel(s.revealMission), s.deliverAt)
  }, { ...state, scheduled: rest })
}

export function getUnreadTotal(state: GameState) {
  return Object.values(state.chats).reduce((sum, thread) => sum + thread.unread, 0)
}
