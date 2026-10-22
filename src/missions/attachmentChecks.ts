// 첨부(사진/파일) 전송으로 완료되는 멤버 미션 — 해당 멤버 미션이 active일 때 전송한 첨부의 asset ID로 판별
// 존비킴 파일 미션은 이후 연결 예정: { kind: 'file', correctId: johnbekimQuest.correctFileId, wrongReply: () => johnbekimQuest.lines.wrong }
import type { MemberId } from '../content/chats'
import { findPhoto } from '../content/gallery'
import { yunminQuest } from '../content/quests/yunmin'

export type AttachmentKind = 'image' | 'file'

export interface AttachmentCheck {
  kind: AttachmentKind
  correctId: string
  /** 오답일 때 답장 — 보낸 첨부에 따라 다르게 */
  wrongReply: (attachmentId: string | undefined) => string
}

export const attachmentChecks: Partial<Record<MemberId, AttachmentCheck>> = {
  yunmin: {
    kind: 'image',
    correctId: yunminQuest.correctPhotoId,
    // 윤민 사진이지만 예전 앨범이면 다른 반응
    wrongReply: (id) => (findPhoto(id)?.owner === 'yunmin' ? yunminQuest.otherAlbumReply : yunminQuest.wrongReply),
  },
}
