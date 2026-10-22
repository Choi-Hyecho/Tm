// 첨부(사진/파일) 전송으로 완료되는 멤버 미션 — 해당 멤버 미션이 active일 때 전송한 첨부의 asset ID로 판별
// 존비킴 파일 미션은 이후 연결 예정: { kind: 'file', correctId: johnbekimQuest.correctFileId, wrongReply: johnbekimQuest.lines.wrong }
import type { MemberId } from '../content/chats'
import { yunminQuest } from '../content/quests/yunmin'

export type AttachmentKind = 'image' | 'file'

export interface AttachmentCheck {
  kind: AttachmentKind
  correctId: string
  wrongReply: string
}

export const attachmentChecks: Partial<Record<MemberId, AttachmentCheck>> = {
  yunmin: { kind: 'image', correctId: yunminQuest.correctPhotoId, wrongReply: yunminQuest.wrongReply },
}
