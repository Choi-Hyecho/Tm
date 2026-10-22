// 카카오톡 채팅방 데이터 — 대사는 모두 팬메이드 게임 속 가상 대화이며 실제 인물의 발언이 아님
// 프로필 이미지는 public/images/profiles/ 아래 같은 이름으로 넣으면 바로 적용 (없으면 기본 프로필)

export type ChatId = 'manager' | 'yunmin' | 'seungbin' | 'dohyun' | 'johnbekim'
export type MemberId = Exclude<ChatId, 'manager'>

export interface ChatDef {
  id: ChatId
  name: string
  avatar: string
  /** 친구 목록 상태 메시지 (선택) */
  statusMessage?: string
}

export const chats: Record<ChatId, ChatDef> = {
  manager: { id: 'manager', name: '팀장님', avatar: 'images/profiles/manager.png' },
  yunmin: { id: 'yunmin', name: '윤민', avatar: 'images/profiles/yunmin.png' },
  seungbin: { id: 'seungbin', name: '김승빈', avatar: 'images/profiles/seungbin.png' },
  dohyun: { id: 'dohyun', name: '채도현', avatar: 'images/profiles/dohyun.png' },
  johnbekim: { id: 'johnbekim', name: '존비킴', avatar: 'images/profiles/johnbekim.png' },
}

/** 친구 목록/채팅 목록 기본 순서 */
export const chatOrder: ChatId[] = ['manager', 'yunmin', 'seungbin', 'dohyun', 'johnbekim']

export const chatContent = {
  appName: '카카오톡',
  inputPlaceholder: '메시지 입력',
  notice: '팬메이드 게임 속 가상 대화예요. 실제 인물과 무관합니다.',
  /** 알림 배너 시간 표시 */
  justNow: '지금',
  linkNotReady: '준비 중이에요. 곧 연결될 예정이에요!',
  /** 채팅 목록이 비어 있을 때 (첫 카톡 도착 전) */
  noChats: '아직 대화가 없어요',
  /** 첨부 메뉴 */
  attach: {
    album: '앨범',
    file: '파일',
    camera: '카메라',
    cancel: '취소',
    comingSoon: '준비 중',
    send: '전송',
    reselect: '다시 선택',
    previewUnavailable: '미리듣기 준비 중',
  },
  /** 채팅 목록/알림에 보이는 첨부 메시지 미리보기 */
  photoPreview: '사진',
  filePreview: (fileName: string) => `파일: ${fileName}`,
}

/** 미션과 관계없는 첨부를 받았을 때 답장 */
export const attachmentReplies = {
  manager: { image: '사진 잘 받았습니다 :)', file: '파일 잘 받았습니다! 확인해볼게요 :)' },
  member: { image: '오 사진이네요 ㅎㅎ 잘 받았어요!', file: '파일 받았어요! 확인해볼게요' },
}

/** 팀장님 첫 대화 대사 — 자유 입력 답변(이스터에그)은 managerReplies.ts */
export const managerScript = {
  intro: '매니저님 안녕하세요! 오늘 업무 확인하셨을까요?',
  /** "확인했습니다" 계열 답변에 대한 응답 — 순서대로 전송, 이후 자유 대화 */
  confirmed: [
    '넵! 그러면 진행하시다가 궁금한 점 있으시면 언제든 톡 주세요 :)',
    '아 그리고 멤버분들 연락처는 등록 해두셨죠? 먼저 인사 한번 부탁드릴게요 ㅎㅎ',
  ],
  /** "아직이요" 계열 */
  notYet: '앗 아직이시군요! 인수인계 때 기록해두신 할 일 목록 한번 확인 부탁드릴게요 ㅎㅎ',
  /** 첫 대화 중 알아듣지 못한 답변 */
  nudge: '하하 그래서… 오늘 업무는 확인하셨을까요?',
}
