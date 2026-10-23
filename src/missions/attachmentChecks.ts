// 첨부(사진/파일) 전송으로 완료되는 멤버 미션 — 해당 멤버 미션이 active일 때 전송한 첨부의 asset ID로 판별
import type { LinePicker } from '../chat/ruleEngine'
import type { MemberId } from '../content/chats'
import { findPhoto } from '../content/gallery'
import { johnbekimQuest } from '../content/quests/johnbekim'
import { yunminQuest } from '../content/quests/yunmin'

export type AttachmentKind = 'image' | 'file'

export interface AttachmentCheck {
  kind: AttachmentKind
  correctId: string
  /** 정답일 때 답장들 — 다 도착하면 업무 완료. 없으면 멤버의 missionDone 한 줄 */
  correctReplies?: string[]
  /** 오답일 때 답장들 (순서대로 전송) — 보낸 첨부에 따라 다르게, pick으로 최근에 안 한 말을 고름 */
  wrongReplies: (attachmentId: string | undefined, pick: LinePicker) => string[]
}

export const attachmentChecks: Partial<Record<MemberId, AttachmentCheck>> = {
  yunmin: {
    kind: 'image',
    correctId: yunminQuest.correctPhotoId,
    correctReplies: yunminQuest.correct,
    wrongReplies: (id, pick) => {
      const photo = findPhoto(id)
      // 윤민 사진이지만 예전 앨범 → "옛날 앨범 사진이에요" + 그 앨범 코멘트
      if (photo?.owner === 'yunmin') {
        const { reactions, comments } = yunminQuest.otherAlbum
        return [pick(reactions), pick(comments[photo.album] ?? comments.default)]
      }
      // 단체 사진 → "개인 자켓으로 부탁드려요" + "단체 사진 잘 나왔네요~"
      if (photo?.owner === 'group') {
        return [pick(yunminQuest.groupPhoto.reactions), pick(yunminQuest.wrongPerson.comments.group)]
      }
      // 다른 사람 사진 → "저 아닌 거 같은데요?" + 사진 속 사람 코멘트
      const { reactions, comments } = yunminQuest.wrongPerson
      const about = photo ? comments[photo.owner as keyof typeof comments] : undefined
      return about ? [pick(reactions), pick(about)] : [pick(reactions)]
    },
  },
  // 믹싱 파일 4개 중 베이스가 제대로 들어간 파일 (파일 앱 → 공유 → 카카오톡 → 존비킴)
  johnbekim: {
    kind: 'file',
    correctId: johnbekimQuest.correctFileId,
    // 어떤 오답 파일이든 랜덤 반응 — 묶음의 첫 줄로 최근에 안 한 말을 고름
    wrongReplies: (_, pick) => {
      const groups = johnbekimQuest.lines.wrong
      const first = pick(groups.map((g) => g[0]))
      return groups.find((g) => g[0] === first) ?? groups[0]
    },
  },
}
