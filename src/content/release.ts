// 극야 발매 엔딩 문구 — 이미지/영상/곡 설정은 config/media.ts, 음원 링크는 config/links.ts(albumLinks)
// 가상 대화 — 실제 인물의 발언이 아님

export const releaseContent = {
  /** 팀장님 채팅방 — 최종 보고가 진행 가능할 때 입력창 위에 표시 */
  reportCard: {
    title: '최종 보고',
    body: '모든 업무를 마쳤어요. 팀장님께 보고하고 「극야」를 발매할까요?',
    button: '앨범 발매하기',
  },
  /** 발매 버튼을 누르면 남는 대화 */
  myMessage: '팀장님, 모든 업무 마쳤습니다! 「극야」 발매하겠습니다.',
  managerMessage: '고생 많으셨습니다 매니저님! 「극야」 발매되었습니다 🎉',

  /** 엔딩 팝업 — 제목은 「극야」 손글씨 로고 이미지(config/media.ts의 albumLogo) */
  headline: '극야',
  headlineSuffix: 'RELEASED',
  /** 축하 문구 위 작은 날짜 */
  releaseDate: '2026. 10. 15  12PM',
  /** 날짜 아래 마무리 인사 — 한 줄씩 */
  congrats: ['오늘 하루 너무 고생 많으셨어요.', '터치드 「극야」도 많이 사랑해주세요.'],
  video: {
    unavailable: '공식 뮤직비디오 준비 중',
    unmute: '소리 켜기',
    mute: '소리 끄기',
    openYoutube: 'YouTube에서 보기',
    failed: '여기서 재생할 수 없는 영상이에요',
  },
  platformsTitle: '지금 「극야」 듣기',
  platformNotReady: '준비 중',
  finish: '닫기',

  /** TODO 완료 화면 */
  replay: '발매 축하 다시 보기',
}

/** 엔딩 팝업의 음원 플랫폼 (홈 화면 앱과 같은 아이콘/링크를 사용) — 3열 2행 */
export const releasePlatforms = ['melon', 'genie', 'spotify', 'appleMusic', 'youtubeMusic', 'bugs'] as const
