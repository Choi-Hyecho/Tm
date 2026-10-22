import type { ChatId, MemberId } from '../content/chats'
import type { MissionId } from '../content/missions'

export interface ChatMessage {
  id: string
  /** 'me' = 사용자, 그 외 = 채팅방 상대 */
  from: 'me' | ChatId
  /** 메시지 종류 — 없으면 텍스트 (이전 저장 데이터 호환) */
  kind?: 'text' | 'image' | 'file'
  /** 사진/파일 메시지의 asset ID (content/gallery.ts, content/gameFiles.ts) */
  attachmentId?: string
  /** 텍스트 메시지 내용. 첨부는 채팅 목록/알림에 보일 미리보기 문구 */
  text: string
  /** 실제 시각 (ms) */
  at: number
  /** 내 메시지를 상대가 읽었는지 — false면 말풍선 옆에 '1' 표시 (이전 저장 데이터는 읽음으로 간주) */
  read?: boolean
}

/** 채팅방 하나의 기록 (= chatHistories의 한 항목) */
export interface ChatThread {
  messages: ChatMessage[]
  /** 내가 아직 안 읽은 상대 메시지 수 (채팅 목록/아이콘 배지) */
  unread: number
  /** 대화 흐름 상태 — chat/scripts.ts의 responder가 사용 */
  flow: string
  /** 직전 질문의 맥락 (예: 카페 제안 직후 'cafeInvitation'). 이전 저장 데이터에는 없을 수 있음 */
  conversationContext?: string | null
}

/** 입력 중 표시 후 도착할 답장. 새로고침해도 사라지지 않도록 저장 */
export interface ScheduledMessage {
  chatId: ChatId
  text: string
  deliverAt: number
  /** 이 메시지가 도착할 때 해당 멤버 업무를 TODO에 공개 */
  revealMission?: MemberId
  /** '입력 중…' 표시 구간 [시작, 끝] — 없으면 도착할 때까지 계속 표시 */
  typingWindows?: [number, number][]
}

/** 화면 위에서 내려오는 알림 — 카카오톡 새 메시지 / TODO 업무 변경 */
export type Banner =
  | { id: string; kind: 'chat'; chatId: ChatId; messageId: string }
  | { id: string; kind: 'todo'; title: string; body: string }

/**
 * hidden: 아직 업무 내용을 전달받지 않음 (멤버 업무)
 * locked: 선행 업무가 남아 잠김 (마지막 두 업무)
 * active: 진행 중 / 진행 가능
 * completed: 완료
 */
export type MissionStatus = 'hidden' | 'locked' | 'active' | 'completed'

export interface GameState {
  /** 저장 스키마 버전 — 구조가 바뀌면 올리고 storage.ts에서 처리 */
  version: 3
  intro: {
    /** 잠금 해제 후 팀장님 첫 메시지가 도착했는지 */
    started: boolean
    /** 첫 카톡 알림을 눌렀거나 닫았는지 */
    notificationSeen: boolean
  }
  /** 채팅방별 대화 기록 (chatHistories) */
  chats: Record<ChatId, ChatThread>
  scheduled: ScheduledMessage[]
  /** 상대가 아직 읽지 않은 내 메시지 id — 다른 멤버 업무가 끝나고 채팅방에 들어가면 읽고 답장 */
  pendingMessages: Record<ChatId, string[]>
  /** 표시할 알림 배너 — 앞에서부터 하나씩 표시 (카톡 + TODO) */
  banners: Banner[]
  /** 지금 열려 있는 채팅방 — 화면 상태라 저장하지 않음 */
  activeChat: ChatId | null
  /** 업무별 상태. 마지막 두 업무는 저장값이 locked여도 선행 업무가 끝나면 active로 표시 (selectors) */
  missionStatuses: Record<MissionId, MissionStatus>
  /** 지금 진행 중인 멤버 업무 — 한 번에 하나만. 업무 요청을 보내는 순간 예약됨 */
  activeMissionId: MemberId | null
  released: boolean
  /** 이스터에그: 멤버에게 한 애정 표현 횟수와 팀장님 경고 여부 */
  affection: { count: number; warned: boolean }
  /** 보너스: 듀오링고 쇼츠 방문 여부 */
  duolingoVisited: boolean
}

export type GameAction =
  | { type: 'START_INTRO'; now: number }
  | { type: 'SEND_MESSAGE'; chatId: ChatId; text: string; now: number }
  /** 카카오톡 첨부 전송 — 전송했을 때만 미션 판별 (첨부 메뉴 열기/미리보기는 상태 변화 없음) */
  | { type: 'SEND_ATTACHMENT'; chatId: ChatId; kind: 'image' | 'file'; attachmentId: string; now: number }
  | { type: 'DELIVER_DUE'; now: number }
  | { type: 'OPEN_CHAT'; chatId: ChatId; now: number }
  | { type: 'CLOSE_CHAT'; chatId: ChatId }
  | { type: 'DISMISS_BANNER'; id: string }
  /** 미션 성공 이벤트로만 호출 (TODO 직접 체크 없음) */
  | { type: 'COMPLETE_MISSION'; id: MissionId; now: number }
  | { type: 'RELEASE' }
  | { type: 'VISIT_DUOLINGO' }
  | { type: 'RESET' }
