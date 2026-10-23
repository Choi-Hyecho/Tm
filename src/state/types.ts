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
  /** 텍스트 파일 (가사 검수 TXT) — 보낸 당시 내용 그대로 보관, 이후 메모를 고쳐도 바뀌지 않음 */
  document?: { fileName: string; content: string }
  /**
   * 파일을 눌렀을 때 — 'openNotes': 내용 보기 대신 메모 앱 열기 (도현이 공유한 가사 메모)
   * 'download': 파일 앱에 저장 (존비킴이 보낸 믹싱 파일, attachmentId = 파일 ID)
   */
  action?: 'openNotes' | 'download'
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
  /** 이 메시지가 도착한 뒤 해당 업무 완료 (도현 가사 검수 — 답장 후 TODO 체크) */
  completeMission?: MemberId
  /** 파일 메시지로 도착 (상대가 보내는 파일) */
  attachment?: SharedFile
}

/** 상대가 보내는 파일 메시지 */
export type SharedFile =
  /** 누르면 메모 앱으로 이동 */
  | { action: 'openNotes'; fileName: string }
  /** 누르면 파일 앱에 저장 — 파일 정보는 content/gameFiles.ts */
  | { action: 'download'; fileId: string }

/** 도현 가사 검수 전송 기록 한 건 */
export interface LyricsSubmission {
  /** 몇 번째 전송인지 (1부터) */
  number: number
  fileName: string
  correct: boolean
  at: number
}

/** 화면 위에서 내려오는 알림 — 카카오톡 새 메시지 / TODO 업무 변경 */
export type Banner =
  | { id: string; kind: 'chat'; chatId: ChatId; messageId: string }
  | {
      id: string
      kind: 'todo'
      title: string
      body: string
      /** 이 시각(ms)이 지나야 표시 — 앞 알림과 너무 붙지 않게 */
      notBefore?: number
    }

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
  /** 가장 최근에 완료한 업무 — 팀장님 힌트("○○님이랑 얘기 나누셨군요?")에 사용 */
  lastCompletedMission: MissionId | null
  /** 극야 발매 완료 (= albumReleased) — 날짜 10/15, 배경/프로필/Now Playing이 극야 버전으로 */
  released: boolean
  /** 발매 엔딩을 끝까지 보고 '발매된 업무폰 확인하기'를 눌렀는지 — 이후 접속 때 엔딩이 자동으로 뜨지 않음 */
  endingViewed: boolean
  /** 지금 엔딩 팝업을 보여주는 중 — 화면 상태라 저장하지 않음 (불러올 때 released && !endingViewed로 계산) */
  showEnding: boolean
  /** 도현 가사 검수 — 빈칸별 입력(임시 저장)과 전송 기록 */
  lyrics: { inputs: Record<string, string>; submissions: LyricsSubmission[] }
  /** 이스터에그: 멤버에게 한 애정 표현 횟수와 팀장님 경고 여부 */
  affection: { count: number; warned: boolean }
  /** 보너스: 듀오링고 쇼츠 방문 여부 */
  duolingoVisited: boolean
  /** 파일 앱에 저장한 파일 ID (카톡으로 받은 파일을 눌러서 저장) */
  downloads: string[]
  /** 사용자가 메모 앱에서 직접 만든 메모 — 첫 줄이 제목 */
  userNotes: UserNote[]
  /** 기본 메모(At Home 등)를 고친 내용 — 메모 ID별 */
  noteEdits: Record<string, { body: string; updatedAt: number }>
}

export interface UserNote {
  id: string
  body: string
  updatedAt: number
}

/** 공유 시트로 카톡에 보내는 것 — 사진 / 파일 / 메모 */
export type ShareKind = 'image' | 'file' | 'memo'

export type GameAction =
  | { type: 'START_INTRO'; now: number }
  | { type: 'SEND_MESSAGE'; chatId: ChatId; text: string; now: number }
  /** 카카오톡 첨부/공유 전송 — 전송했을 때만 미션 판별 (첨부 메뉴 열기/미리보기는 상태 변화 없음). memo는 메모 ID */
  | { type: 'SEND_ATTACHMENT'; chatId: ChatId; kind: ShareKind; attachmentId: string; now: number }
  /** 카톡으로 받은 파일을 파일 앱에 저장 */
  | { type: 'DOWNLOAD_FILE'; fileId: string }
  /** 메모 앱 — 새 메모 (ID는 화면에서 만들어 넘김) / 내용 수정 (내 메모 또는 기본 메모) / 내 메모 삭제 */
  | { type: 'CREATE_NOTE'; id: string; now: number }
  | { type: 'UPDATE_NOTE'; id: string; body: string; now: number }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'DELIVER_DUE'; now: number }
  | { type: 'OPEN_CHAT'; chatId: ChatId; now: number }
  | { type: 'CLOSE_CHAT'; chatId: ChatId }
  | { type: 'DISMISS_BANNER'; id: string }
  /** 메모 앱 가사 빈칸 입력 (임시 저장, 입력 중에는 채점하지 않음) */
  | { type: 'SET_LYRIC_INPUT'; blankId: string; value: string }
  /** 메모 '전송하기' — 도현에게 TXT 파일 전송 후 채점 */
  | { type: 'SUBMIT_LYRICS'; now: number }
  /** 미션 성공 이벤트로만 호출 (TODO 직접 체크 없음) */
  | { type: 'COMPLETE_MISSION'; id: MissionId; now: number }
  /** 팀장님 최종 보고에서 '앨범 발매하기' — 1~5번 업무가 모두 끝났을 때만. 최종 보고 완료 + 발매 + 엔딩 */
  | { type: 'RELEASE'; now: number }
  /** 엔딩 팝업 닫기 ('발매된 업무폰 확인하기') */
  | { type: 'CLOSE_ENDING' }
  /** TODO의 '발매 축하 다시 보기' */
  | { type: 'REPLAY_ENDING' }
  /** 개발 전용 — 모든 업무 완료 처리 후 발매 */
  | { type: 'DEV_FORCE_RELEASE'; now: number }
  | { type: 'VISIT_DUOLINGO' }
  | { type: 'RESET' }
