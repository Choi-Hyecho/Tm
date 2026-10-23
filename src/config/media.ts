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
    /** 극야 발매 후 잠금화면 — 극야 단체 자켓 (파일을 받으면 이 경로에) */
    afterRelease: {
      image: 'images/release/lock_group.jpg',
      position: 'center',
      dim: 0.12,
      fallback:
        'radial-gradient(100% 50% at 50% 100%, #ffffff 0%, transparent 65%), linear-gradient(180deg, #0f2c5e 0%, #2468d6 55%, #c8e0ff 100%)',
    },
  },
  homeScreen: {
    /** 발매 전 홈 화면 */
    beforeRelease: {
      image: 'images/wall.jpg',
      position: '58% center',
      dim: 0.1,
      fallback:
        'radial-gradient(90% 50% at 85% 5%, #ffffff 0%, transparent 60%), radial-gradient(80% 45% at 10% 95%, #6aa9ff 0%, transparent 70%), linear-gradient(180deg, #c8e0ff 0%, #3b86f5 100%)',
    },
    /** 극야 발매 후 홈 화면 — 극야 콘셉트 배경 (파일을 받으면 이 경로에) */
    afterRelease: {
      image: 'images/release/home.jpg',
      position: 'center',
      dim: 0.15,
      fallback:
        'radial-gradient(70% 40% at 80% 8%, rgba(156,200,255,0.55) 0%, transparent 70%), radial-gradient(90% 50% at 10% 100%, #2468d6 0%, transparent 70%), linear-gradient(180deg, #0a1a3a 0%, #0f2c5e 60%, #1a4fa8 100%)',
    },
  },
} satisfies Record<string, Record<string, WallpaperConfig>>

/** 홈 화면 듀오링고 위젯 — 제공 이미지를 원본 비율 그대로 표시 (글씨/색 수정 없음) */
export const duolingoWidget = {
  /** 처음 상태 */
  before: 'images/duolingo-before.jpg',
  /** 쇼츠 방문 후 상태 — 파일이 없으면 before 이미지를 그대로 유지 */
  after: 'images/duolingo-after.jpg',
}

export interface PlayerTrack {
  title: string
  artist: string
  artwork: string
  /** 곡 길이 'MM:SS' (표시용) */
  duration: string
  /** 재생 버튼을 누르면 이동할 공식 음원/영상 링크 — 비워 두면 이동하지 않음 */
  link: string
}

/** 「극야」 앨범아트 (벅스 앨범 페이지 이미지) */
export const albumArt = 'images/release/album_cover.jpg'

/**
 * 잠금화면 음악 플레이어 — 배경화면과 독립적으로 설정.
 * 재생 위치는 항상 01:21로 고정 (터치드 데뷔일 1월 21일 = 잠금 비밀번호 0121 힌트). 시간이 흘러도 바뀌지 않음
 */
export const lockScreenPlayer = {
  position: '01:21',
  /** 발매 전 — 데뷔곡 새벽별 */
  beforeRelease: [
    { title: '새벽별', artist: 'TOUCHED', artwork: 'images/star_cover.jpg', duration: '04:28', link: '' },
  ] satisfies PlayerTrack[],
  /** 극야 발매 후 — 더블 타이틀곡을 번갈아 표시 */
  afterRelease: [
    {
      title: 'Fallen Angel',
      artist: 'TOUCHED',
      artwork: 'images/release/fallen_angel.jpg',
      duration: '03:01',
      link: 'https://youtu.be/Cj3QAPorkgI',
    },
    {
      title: '이 별',
      artist: 'TOUCHED',
      artwork: 'images/release/this_star.jpg',
      duration: '04:23',
      // 이 별 퍼포먼스 비디오
      link: 'https://www.youtube.com/watch?v=wmVmlnz22hM',
    },
  ] satisfies PlayerTrack[],
  /** 곡이 바뀌는 간격 */
  switchMs: 8000,
  /** 곡별 앨범아트 파일이 없을 때 쓰는 이미지 */
  fallbackArtwork: albumArt,
}

/**
 * 멤버 카카오톡 프로필 사진 — 발매 전 / 극야 발매 후 (팀장님은 바뀌지 않음).
 * 발매 후 사진은 지금 사진 앱의 「극야」 개인 자켓을 사용 — 따로 받으면 경로만 바꾸면 됨
 */
export const memberProfiles = {
  beforeRelease: {
    yunmin: 'images/profiles/yunmin.png',
    seungbin: 'images/profiles/seungbin.png',
    dohyun: 'images/profiles/dohyun.png',
    johnbekim: 'images/profiles/johnbekim.png',
  },
  afterRelease: {
    yunmin: 'images/photos/polar/YM.jpg',
    seungbin: 'images/photos/polar/SB.jpg',
    dohyun: 'images/photos/polar/CD.jpg',
    johnbekim: 'images/photos/polar/JB.jpg',
  },
}

/** 발매 엔딩 — 공식 뮤직비디오 (YouTube 영상 ID). 비워 두면 영상 자리에 '준비 중' 표시 */
export const releaseVideo = {
  /** 'Fallen Angel' Official MV — https://youtu.be/Cj3QAPorkgI */
  youtubeId: 'Cj3QAPorkgI',
  title: "터치드(TOUCHED) 'Fallen Angel' Official MV",
}
