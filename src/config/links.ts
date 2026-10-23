// 외부 링크 설정 — 비워 둔 링크는 누르면 "링크 준비 중" 안내만 표시하고 이동하지 않습니다.

/** 플랫폼별 TOUCHED 정규 1집 '극야' 앨범 페이지 */
export const albumLinks = {
  /** 멜론·지니·애플 뮤직은 TOUCHED 아티스트 페이지 */
  melon: 'https://www.melon.com/artist/timeline.htm?artistId=2905108',
  genie: 'https://www.genie.co.kr/detail/artistInfo?xxnm=80981969',
  spotify: 'https://open.spotify.com/album/6kUmjbeGJaY3Q1uBY9jvf9',
  appleMusic: 'https://music.apple.com/us/artist/touched/1543982676',
  youtubeMusic: '',
  bugs: 'https://music.bugs.co.kr/album/20846623',
}

export const links = {
  /** TOUCHED 공식 유튜브 채널 또는 공식 뮤직비디오 */
  youtube: 'https://www.youtube.com/@touched_official/videos',
  /** TOUCHED 공식 X */
  x: 'https://x.com/band_touched',
  /** TOUCHED 관련 공식 웹사이트 */
  safari: '',
  /** 윤민 듀오링고 관련 YouTube Shorts (위젯과 앱 아이콘이 함께 사용) */
  duolingoShorts: '',
  /** TOUCHED 공식 b.stage */
  bstage: 'https://touched.bstage.in/',
  /** 설정 앱 '문의하기' — 구글 폼, 오픈채팅, 'mailto:주소' 등 */
  contact: 'https://x.com/RecOfTouched',
  /** 설정 앱 '버그 제보' — 구글 폼, 'mailto:주소' 등 */
  bugReport: `mailto:recoftouching@gmail.com?subject=${encodeURIComponent('[TOUCHED MANAGER] 버그 제보')}`,
}
