// 카카오톡 탭 설정 — 이미지는 public/ 기준 경로, 링크는 비워 두면 "준비 중" 안내만 표시
// 이미지 파일이 없으면 그라디언트 임시 이미지가 자동으로 보입니다.

/** 친구 탭 상단 내 프로필 */
export const myProfile = {
  name: 'TOUCHED MANAGER',
  statusMessage: '극야 발매 준비 D-1',
  /** 극야 발매 후 상태 메시지 */
  statusMessageReleased: '극야 발매 완료 🌌',
  avatar: 'images/profiles/me.png',
}

export interface ShopItem {
  id: string
  title: string
  description: string
  image: string
  /** 공식 판매 페이지 — 사이트 안에서 결제하지 않고 새 탭으로 이동 */
  link: string
  cta: string
  fallback: string
  /** 정사각형 이미지 (상품 사진) — 없으면 가로형 16:9 */
  square?: boolean
}

/** 쇼핑 탭 — 앨범 사진은 MPMG 공식 스토어 상품 이미지 */
export const shopItems: ShopItem[] = [
  {
    id: 'album-special',
    title: '터치드 정규앨범 「극야」 스페셜반',
    description: 'TOUCHED 1st Full Album 극야 CD (Special ver.) — MPMG 공식 스토어',
    image: 'images/shop/album.jpg',
    link: 'https://mpmgmusic.com/product/TCD-MMR2618-CD',
    cta: '스페셜반 보러 가기',
    square: true,
    fallback: 'linear-gradient(135deg, #0f2c5e 0%, #2468d6 60%, #c8e0ff 100%)',
  },
  {
    id: 'album-digipak',
    title: '터치드 정규앨범 「극야」 디지팩',
    description: 'TOUCHED 1st Full Album 극야 CD (Digipak ver.) — MPMG 공식 스토어',
    image: 'images/shop/album-digipak.jpg',
    link: 'https://mpmgmusic.com/product/TCD-MMR2619-CD',
    cta: '디지팩 보러 가기',
    square: true,
    fallback: 'linear-gradient(135deg, #1a1f3a 0%, #3b5bb3 60%, #c8e0ff 100%)',
  },
  {
    id: 'goods',
    title: '터치드 공식 굿즈 구매하기',
    description: '터치드 공식 굿즈를 공식 스토어에서 만나보세요.',
    image: 'images/shop/goods.jpg',
    link: '',
    cta: '굿즈 보러 가기',
    fallback: 'linear-gradient(135deg, #f3f8ff 0%, #9cc8ff 55%, #3b86f5 100%)',
  },
]

export interface Promotion {
  id: string
  title: string
  subtitle: string
  /** 배너 이미지 (가로형 권장). 없으면 fallback 배경 + 제목 표시 */
  image: string
  link: string
  fallback: string
  /** 장난 광고 — 눌러도 아무 반응 없음 */
  joke?: boolean
}

/** 친구/채팅 탭 상단 팬메이드 프로모션 배너 — 이 중 하나를 세션마다 랜덤 표시 */
export const promotions: Promotion[] = [
  {
    id: 'album',
    title: '정규 1집 「극야」',
    subtitle: 'TOUCHED 1st Full Album 지금 만나보세요',
    image: 'images/promo/album.jpg',
    link: '',
    fallback: 'linear-gradient(120deg, #0f2c5e, #2468d6)',
  },
  {
    id: 'fallen-angel',
    title: 'Fallen Angel M/V',
    subtitle: '더블 타이틀곡 뮤직비디오 보러 가기',
    image: 'images/promo/fallen-angel.jpg',
    link: 'https://youtu.be/Cj3QAPorkgI',
    fallback: 'linear-gradient(120deg, #1a1f3a, #6a4fb3)',
  },
  {
    id: 'this-star',
    title: '이 별 Performance Video',
    subtitle: '더블 타이틀곡 퍼포먼스 비디오 보러 가기',
    image: 'images/promo/this-star.jpg',
    link: 'https://www.youtube.com/watch?v=wmVmlnz22hM',
    fallback: 'linear-gradient(120deg, #2468d6, #9cc8ff)',
  },
  {
    id: 'youtube',
    title: 'TOUCHED 공식 YouTube',
    subtitle: '무대와 비하인드 영상을 한곳에서',
    image: 'images/promo/youtube.jpg',
    link: 'https://www.youtube.com/@touched_official/videos',
    fallback: 'linear-gradient(120deg, #3a0d12, #d6243a)',
  },
  {
    id: 'members',
    title: '멤버 소개',
    subtitle: '윤민 · 김승빈 · 채도현 · 존비킴',
    image: 'images/promo/members.jpg',
    link: 'https://mpmgmusic.com/touched',
    fallback: 'linear-gradient(120deg, #1a4fa8, #6aa9ff)',
  },
  // ── 장난 광고 (눌러도 반응 없음) — 가상 문구, 실제 기사·광고 아님 ──
  {
    id: 'joke-yunmin',
    title: '조윤민, 그녀는 고양이인가 여우인가?',
    subtitle: '아니면 토끼? 강아지? 전문가들도 결론 못 내',
    image: '',
    link: '',
    fallback: 'linear-gradient(120deg, #ff8fb1, #ffc06e)',
    joke: true,
  },
  {
    id: 'joke-door',
    title: "유명 밴드 남성 멤버 '문짝설'… 그 주인공은?",
    subtitle: '업계 관계자 "문을 열고 들어오는데 문이 두 개인 줄"',
    image: '',
    link: '',
    fallback: 'linear-gradient(120deg, #3d3d3d, #8a7a6a)',
    joke: true,
  },
  {
    id: 'joke-dohyun',
    title: '베토벤의 환생? 피아노 천재 채도현',
    subtitle: '그는 과연 누구인가',
    image: '',
    link: '',
    fallback: 'linear-gradient(120deg, #2b2140, #8c6bd1)',
    joke: true,
  },
]
