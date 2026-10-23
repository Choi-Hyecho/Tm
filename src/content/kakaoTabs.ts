// 카카오톡 탭 문구
export const kakaoTabsContent = {
  tabs: { friends: '친구', chats: '채팅', shopping: '쇼핑', more: '더보기' },
  friendsCount: (n: number) => `친구 ${n}`,
  promoLabel: '팬메이드',
  /** 장난 광고 배지 */
  adLabel: 'AD',
  shoppingNotice: '결제는 공식 판매처에서 진행돼요. 버튼을 누르면 새 탭으로 열려요.',
  more: {
    profile: {
      title: '내 프로필',
      body: '극야 발매를 하루 앞둔 TOUCHED의 신입 매니저예요. 프로필 사진은 곧 바뀔 예정이에요.',
    },
    guide: {
      title: '게임 안내',
      body: [
        '오늘은 TOUCHED 정규 1집 「극야」 발매 전날이에요.',
        '홈 화면의 TODO에서 오늘 할 업무를 확인할 수 있어요.',
        '팀장님과 멤버들에게 카카오톡으로 연락하며 업무를 진행해 보세요.',
        '업무를 마치면 TODO가 자동으로 체크되고, 진행 상황은 이 기기에 저장돼요.',
      ],
    },
    fanmade: {
      title: '비공식 팬메이드 프로젝트 안내',
      body: [
        '이 게임은 TOUCHED를 응원하는 팬이 만든 비공식 프로젝트예요.',
        'TOUCHED, 소속사, 카카오 및 각 음원·굿즈 플랫폼과 관련이 없어요.',
        '게임 속 모든 대화와 인물의 대사는 가상으로 만든 것이며 실제 발언이 아니에요.',
        '쇼핑과 음원 링크는 공식 페이지로 이동할 뿐, 이 사이트에서 결제가 이뤄지지 않아요.',
      ],
    },
  },
}
