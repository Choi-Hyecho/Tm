// 설정 앱 문구 — 게임 초기화, 안내, 저작권, 문의/버그 제보
import { meta } from './meta'

export const settingsContent = {
  title: '설정',
  version: '테스트 버전 0.1',

  sections: {
    game: '게임',
    info: '정보',
    support: '지원',
  },

  reset: {
    label: '처음부터 다시 하기',
    /** 확인 창 */
    confirmTitle: '처음부터 다시 할까요?',
    confirmBody: '카카오톡 대화, TODO 진행 상황, 메모에 쓴 내용이 모두 지워져요. 되돌릴 수 없어요.',
    cancel: '취소',
    confirm: '초기화',
  },

  guide: {
    label: '게임 안내',
    body: [
      '오늘은 TOUCHED 정규 1집 「극야」 발매 전날이에요.',
      '신입 매니저가 되어 멤버들의 업무를 하나씩 도와주세요.',
      '카카오톡으로 멤버들에게 인사하면 업무를 받을 수 있어요. 한 번에 한 멤버의 업무만 진행돼요.',
      '홈 화면의 TODO에서 진행 상황을 확인할 수 있어요.',
      '막히면 팀장님께 "힌트 주세요"라고 물어보세요.',
      '진행 상황은 이 기기의 브라우저에 저장돼요.',
    ],
  },

  fanmade: {
    label: '비공식 팬메이드 프로젝트 안내',
    body: [
      meta.disclaimer,
      'TOUCHED, 소속사, 카카오, Apple 및 각 음원·굿즈 플랫폼과 관련이 없어요.',
      '게임 속 모든 대화와 인물의 대사는 가상으로 만든 것이며 실제 발언이 아니에요.',
      '음원·쇼핑 링크는 공식 페이지로 이동할 뿐, 이 사이트에서 결제가 이뤄지지 않아요.',
    ],
  },

  copyright: {
    label: '저작권 및 크레딧',
    body: [
      '비공식 팬메이드 게임이에요. 노래·사진·로고의 권리는 TOUCHED와 MPMG MUSIC 등 각 권리자에게 있어요.',
      '앱 아이콘의 권리는 각 서비스에 있어요.',
      '게임 기획·제작: @닿음의 기록',
      '문제가 되는 콘텐츠가 있다면 문의하기로 알려주세요. 확인 후 바로 조치할게요.',
    ],
  },

  /** detail: 항목 아래 작게 보이는 연락처 */
  contact: { label: '문의하기', detail: 'X(트위터) @RecOfTouched', notReady: '문의 창구를 준비 중이에요!' },
  bugReport: { label: '버그 제보', detail: '이메일 recoftouching@gmail.com', notReady: '버그 제보 창구를 준비 중이에요!' },
}
