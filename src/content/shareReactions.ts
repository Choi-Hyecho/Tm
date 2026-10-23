// 사진/파일/메모를 카톡으로 보냈을 때 받는 사람의 반응 — 미션과 관계없을 때 (미션 정답 판별은 missions/attachmentChecks.ts)
// 여러 개 중 최근에 안 한 말을 하나 고름. 배열 안의 배열은 여러 줄 답장(순서대로 전송)
// 가상 대화 — 실제 인물의 발언이 아님
import type { ChatId, MemberId } from './chats'

type Lines = (string | string[])[]
type PerChat = Record<ChatId, Lines>

export const shareReactions = {
  photo: {
    /** 팀장님 — {owner}는 사진 속 사람 */
    manager: ['사진 잘 받았습니다 :)', '{owner}님 사진이네요! 근데 저한테 왜…? ㅎㅎ', '사진 감사합니다! 잘 나왔네요 ㅎㅎ'],
    managerGroup: ['단체 사진이네요 ㅎㅎ 잘 받았습니다!'],
    /** 멤버 본인 사진을 받았을 때 */
    self: {
      yunmin: ['오 제 사진이네요 ㅎㅎ 갑자기요?', '앗 이거 제 사진인데요?'],
      seungbin: [['제 사진을 왜 저한테…?', '…근데 잘 나왔네요.']],
      dohyun: ['어 제 사진이네요 ㅎㅎ', '앗 저 이때 좀 피곤했는데 ㅎㅎ'],
      johnbekim: ['오 저네요 ㅋㅋ 잘 나왔다~', '하하 이거 제 사진이네요!'],
    } satisfies Record<MemberId, Lines>,
    /** 다른 멤버 사진을 받았을 때 — {owner}는 사진 속 사람 */
    other: {
      yunmin: ['{owner} 사진이네요! 잘못 보내신 거 아니에요?', '오 {owner} 잘 나왔다 ㅎㅎ'],
      seungbin: ['이거 {owner} 사진인데요?', '{owner}한테 보내려던 거 아니에요?'],
      dohyun: ['앗 {owner} 사진이네요 ㅎㅎ 잘못 보내신 것 같아요!', '{owner} 사진 잘 나왔네요 ㅎㅎ'],
      johnbekim: ['오 {owner}다 ㅋㅋ 이거 저한테 보내신 거 맞아요?', '{owner} 사진이네요~'],
    } satisfies Record<MemberId, Lines>,
    group: ['오 단체 사진이네요 ㅎㅎ', '이 사진 좋다~'],
  },

  /** 존비킴 믹싱 파일을 다른 사람에게 보냈을 때 */
  file: {
    manager: ['이건 존비킴님 믹싱 파일 같은데요? 존비킴님께 보내주세요 ㅎㅎ'],
    yunmin: ['이거 병무오빠 파일 아니에요? 잘못 보내신 것 같아요!'],
    seungbin: [['…저 베이스 안 치는데요?', '존비킴한테 보내셔야 할 것 같아요.']],
    dohyun: ['어 이거 믹싱 파일이네요! 존비킴한테 보내셔야 할 것 같아요 ㅎㅎ'],
    /** 존비킴 업무가 진행 중이 아닐 때 (업무 완료 후 등) */
    johnbekim: ['어 이거 제가 보낸 파일이네요 ㅎㅎ', '오 베이스 소리 좋죠? ㅎㅎ'],
  } satisfies PerChat,

  /** 메모 — 메모 ID별 (content/notes.ts). 없는 메모는 default */
  memo: {
    athome: {
      manager: [['매니저님… 이거 저한테 보내신 거 맞죠?', '많이 힘드시죠 ㅎㅎ 조금만 버텨봐요. 퇴근은 업무 다 끝나고요!']],
      yunmin: [['매니저님 잘못 보내신 것 같아요…', '근데 저도 집 가고 싶어요']],
      seungbin: [['이걸 왜 저한테…?', '할 일이 출근이랑 퇴근이면 지금 반은 하신 거네요.']],
      dohyun: [['어… 잘못 보내신 것 같아요!', '많이 힘드시죠 ㅠㅠ 힘내세요 매니저님']],
      johnbekim: [['매니저님 ㅋㅋㅋ 이거 메모장에 쓰신 거 아니에요?', '저도 같은 마음입니다 🥲']],
    } satisfies PerChat,
    timetable: {
      manager: ['일정 정리 잘 하셨네요 ㅎㅎ 감사합니다!'],
      yunmin: ['오 타임테이블 감사합니다!'],
      seungbin: ['이렇게 보니까 진짜 얼마 안 남았네요.'],
      dohyun: ['타임테이블 감사합니다 매니저님 ㅎㅎ'],
      johnbekim: ['오 정리 깔끔하다 ㅎㅎ 감사해요!'],
    } satisfies PerChat,
    default: {
      manager: ['메모 잘 받았습니다 :)'],
      yunmin: ['메모 받았어요!'],
      seungbin: ['메모 받았어요.'],
      dohyun: ['메모 잘 받았어요 ㅎㅎ'],
      johnbekim: ['메모 받았어요~'],
    } satisfies PerChat,
  } as Record<string, PerChat>,
}
