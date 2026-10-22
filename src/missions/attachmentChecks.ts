// 첨부(사진/파일) 전송으로 완료되는 멤버 미션 — 해당 멤버 미션이 active일 때 전송한 첨부의 asset ID로 판별
// 존비킴 파일 미션은 이후 연결 예정: { kind: 'file', correctId: johnbekimQuest.correctFileId, wrongReplies: (_, pick) => [pick([johnbekimQuest.lines.wrong])] }
import type { LinePicker } from '../chat/ruleEngine'
import type { MemberId } from '../content/chats'
import { findPhoto } from '../content/gallery'
import { yunminQuest } from '../content/quests/yunmin'

export type AttachmentKind = 'image' | 'file'

export interface AttachmentCheck {
  kind: AttachmentKind
  correctId: string
  /** 오답일 때 답장들 (순서대로 전송) — 보낸 첨부에 따라 다르게, pick으로 최근에 안 한 말을 고름 */
  wrongReplies: (attachmentId: string | undefined, pick: LinePicker) => string[]
}

export const attachmentChecks: Partial<Record<MemberId, AttachmentCheck>> = {
  yunmin: {
    kind: 'image',
    correctId: yunminQuest.correctPhotoId,
    wrongReplies: (id, pick) => {
      const photo = findPhoto(id)
      // 윤민 사진이지만 예전 앨범 → "옛날 앨범 사진이에요" + 그 앨범 코멘트
      if (photo?.owner === 'yunmin') {
        const { reactions, comments } = yunminQuest.otherAlbum
        return [pick(reactions), pick(comments[photo.album] ?? comments.default)]
      }
      // 다른 사람 사진 → "저 아닌 거 같은데요?" + 사진 속 사람 코멘트
      const { reactions, comments } = yunminQuest.wrongPerson
      const about = photo ? comments[photo.owner as keyof typeof comments] : undefined
      return about ? [pick(reactions), pick(about)] : [pick(reactions)]
    },
  },
}
