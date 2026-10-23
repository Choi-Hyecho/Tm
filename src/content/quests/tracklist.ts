// 5번 미션: 극야 트랙리스트 최종 검수
// 멤버 업무 4개가 끝나면 팀장님이 카톡으로 검수용 플레이리스트 카드를 공유 → 카드(또는 TODO 5번)를 눌러
// 게임 속 Spotify 스타일 편집 화면에서 앨범 순서대로 정리 → '검수본 저장하기' → 맞으면 팀장님 답장 후 완료
// 실제 Spotify와 연결되지 않는 가상 화면 (홈 화면 Spotify 앱은 공식 앨범 페이지로 이동 — 별개)
// 가상 대화 — 실제 인물의 발언이 아님

export interface Track {
  id: string
  title: string
}

/** 정답 — 「극야」 수록 순서 (벅스 앨범 페이지 기준) */
export const tracklistTracks: Track[] = [
  { id: 'tunnel', title: '터널' },
  { id: 'fallen-angel', title: 'Fallen Angel' },
  { id: 'this-star', title: '이 별' },
  { id: 'mia', title: '미아' },
  { id: 'night-of-soul', title: '영혼의 밤' },
  { id: 'shibuya', title: 'Shibuya Scramble' },
  { id: 'liar', title: 'Liar' },
  { id: 'tantara', title: 'TANTARA' },
  { id: 'stay', title: 'Stay by My Side' },
  { id: 'alone', title: 'Alone' },
  { id: 'save-me', title: 'Save Me' },
  { id: 'at-home', title: 'At Home' },
]

export const tracklistQuest = {
  correctOrder: tracklistTracks.map((t) => t.id),
  /** 처음 공유된 플레이리스트 순서 — 뒤섞인 상태 */
  initialOrder: [
    'liar', 'this-star', 'at-home', 'tunnel', 'save-me', 'shibuya',
    'fallen-angel', 'alone', 'mia', 'tantara', 'night-of-soul', 'stay',
  ],

  /** 팀장님 카톡 — 멤버 업무 4개가 모두 끝나면 (한 번만) */
  manager: {
    /** 멤버 마지막 업무 완료 알림 뒤 이만큼 있다가 */
    delayMs: 3500,
    beforeCard: [
      '매니저님! 멤버분들이랑 인사는 다 나누셨을까요? ㅎㅎ',
      '멤버분들 업무는 모두 확인했습니다!',
      '저희 이제 마지막으로 트랙리스트 최종 검수만 하면 될 것 같은데요.',
      '스포티파이에 최종 검수용 플레이리스트 공유해뒀습니다!',
    ],
    afterCard: ['앨범 순서대로 정리해서 저장 부탁드리겠습니다 :)'],
    /** 저장했는데 순서가 틀림 */
    wrong: ['매니저님... 트랙 순서가 조금 다른 것 같은데요? ㅎㅎ', '다시 한번만 확인 부탁드리겠습니다!'],
    /** 정답 — 이 답장이 도착하면 5번 완료, 6번 최종 보고 열림 */
    correct: ['넵! 트랙리스트까지 확인했습니다.', '이제 진짜 발매만 남았네요 ㅎㅎ'],
  },
  /** 저장하기를 누르면 내 채팅으로 남는 말 */
  mySubmit: '트랙리스트 검수본 저장했습니다!',

  /** 카톡 공유 카드 */
  card: {
    label: 'PLAYLIST · 검수용',
    title: '극야 | TRACKLIST FINAL',
    meta: 'TOUCHED · 12곡',
    button: '플레이리스트 열기',
    /** 채팅 목록/알림 미리보기 */
    preview: '플레이리스트: 극야 | TRACKLIST FINAL',
  },

  /** 편집 화면 */
  screen: {
    back: '뒤로',
    title: '극야 | TRACKLIST FINAL',
    owner: '팀장님이 공유함',
    hint: '오른쪽 ≡ 를 끌어서 앨범 순서대로 정리해주세요',
    save: '검수본 저장하기',
    done: '검수 완료 ✓',
    saving: '팀장님 확인 중…',
  },
}
