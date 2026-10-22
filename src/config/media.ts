// 이미지 · 음원 링크 설정 — 이미지 파일은 public/images/ 아래 같은 이름으로 넣으면 바로 적용됩니다.
// 파일이 아직 없으면 fallback(임시 배경/임시 앨범아트)이 자동으로 보입니다.

export interface WallpaperConfig {
  /** public/ 기준 경로 */
  image: string
  /** CSS background-position — 사진의 어느 부분을 중심으로 보여줄지 (예: 'center', 'center top', '50% 30%') */
  position: string
  /** 어두움 효과 0(없음) ~ 1(완전 검정) */
  dim: number
  /** 이미지가 없을 때 쓰는 임시 배경 */
  fallback: string
}

export const wallpapers = {
  lockScreen: {
    /** 발매 전 잠금화면 */
    beforeRelease: {
      image: 'images/wall.jpg',
      position: '58% center',
      dim: 0.12,
      fallback:
        'radial-gradient(120% 55% at 50% 0%, #2468d6 0%, transparent 70%), linear-gradient(180deg, #3b86f5 0%, #9cc8ff 55%, #f3f8ff 100%)',
    },
    /** 극야 발매 후 잠금화면 — 극야 단체 자켓 */
    afterRelease: {
      image: 'images/lockscreen_released.webp',
      position: 'center',
      dim: 0.12,
      fallback:
        'radial-gradient(100% 50% at 50% 100%, #ffffff 0%, transparent 65%), linear-gradient(180deg, #0f2c5e 0%, #2468d6 55%, #c8e0ff 100%)',
    },
  },
  homeScreen: {
    image: 'images/wall.jpg',
    position: '58% center',
    dim: 0.1,
    fallback:
      'radial-gradient(90% 50% at 85% 5%, #ffffff 0%, transparent 60%), radial-gradient(80% 45% at 10% 95%, #6aa9ff 0%, transparent 70%), linear-gradient(180deg, #c8e0ff 0%, #3b86f5 100%)',
  },
} satisfies Record<string, WallpaperConfig | Record<string, WallpaperConfig>>

/** 홈 화면 듀오링고 위젯 — 제공 이미지를 원본 비율 그대로 표시 (글씨/색 수정 없음) */
export const duolingoWidget = {
  /** 처음 상태 */
  before: 'images/duolingo-before.jpg',
  /** 쇼츠 방문 후 상태 — 파일이 없으면 before 이미지를 그대로 유지 */
  after: 'images/duolingo-after.jpg',
}

/** 잠금화면 음악 플레이어 — 배경화면과 독립적으로 설정 */
export const lockScreenPlayer = {
  title: '새벽별',
  artist: 'TOUCHED',
  artwork: 'images/star_cover.jpg',
  /** 플레이어에 표시할 현재 재생 위치 'MM:SS' — 잠금 비밀번호(0121) 힌트 */
  position: '01:21',
  /** 플레이어에 표시할 곡 길이 'MM:SS' (표시용) */
  duration: '04:28',
  /** 재생 버튼을 누르면 이동할 공식 음원 링크 — 비워 두면 이동하지 않음 */
  link: '',
}
