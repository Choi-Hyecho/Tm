// TOUCHED 곡 목록 — 채팅에서 곡 이름을 인사/다른 말로 오해하지 않도록 (예: '하이라이트'의 '하이')
// 패턴은 정규화된 문장(공백/문장부호 제거, 영문 소문자) 기준. 새 곡이 나오면 여기에 추가
// 출처: 벅스 「극야」 앨범 페이지, gayo.wiki 터치드 곡 목록

export interface TouchedSong {
  title: string
  patterns: RegExp
}

/** 정규 1집 「극야」 더블 타이틀곡 — 승빈 토론에서 따로 인식 (content/quests/seungbin.ts) */
export const titleTracks: TouchedSong[] = [
  { title: 'Fallen Angel', patterns: /fallenangel|폴른엔젤|폴린엔젤|폴런엔젤/ },
  { title: '이 별', patterns: /이별/ },
]

/** 그 밖의 곡 — 「극야」 수록곡 먼저, 그다음 이전 곡 */
export const otherTracks: TouchedSong[] = [
  // 「극야」 수록곡
  { title: '터널', patterns: /터널|tunnel/ },
  { title: '미아', patterns: /미아/ },
  { title: '영혼의 밤', patterns: /영혼의밤/ },
  { title: 'Shibuya Scramble', patterns: /shibuya|scramble|시부야|스크램블/ },
  { title: 'Liar', patterns: /liar|라이어/ },
  { title: 'TANTARA', patterns: /tantara|딴따라|탄타라/ },
  { title: 'Stay by My Side', patterns: /staybymyside|스테이바이마이사이드|스바마사|밤맛쌀|밥맛쌀|밤맛살|밥맛살/ },
  { title: 'Alone', patterns: /alone|얼론|어론/ },
  { title: 'Save Me', patterns: /saveme|세이브미|셉미/ },
  { title: 'At Home', patterns: /athome|앳홈|엣홈/ },
  // 이전 곡
  { title: 'Highlight', patterns: /highlight|하이라이트|하라/ },
  { title: 'Hi Bully', patterns: /hibully|하이불리/ },
  { title: '새벽별', patterns: /새벽별|thedawnstar|dawnstar/ },
  { title: 'Dynamite', patterns: /dynamite|다이너마이트|다너마/ },
  { title: 'Get Back', patterns: /getback|겟백/ },
  { title: 'Ruby', patterns: /ruby|루비/ },
  { title: '카세트테이프', patterns: /카세트테이프|cassettetape/ },
  { title: '눈덩이', patterns: /눈덩이/ },
  { title: 'Stand Up!', patterns: /standup|스탠드업/ },
  { title: 'Night View', patterns: /nightview|나이트뷰|야경/ },
  { title: 'Fireflies', patterns: /fireflies|파이어플라이|반딧불이/ },
  { title: 'Shut Down', patterns: /shutdown|셧다운/ },
  { title: 'Bad Sniper', patterns: /badsniper|배드스나이퍼|밷스나/ },
  { title: 'Love is Dangerous', patterns: /loveisdangerous|러브이즈데인저러스|럽이댄/ },
  { title: 'Call Me', patterns: /callme|콜미/ },
  { title: '촛불', patterns: /촛불/ },
  { title: '여정', patterns: /여정/ },
  { title: 'Back to you', patterns: /backtoyou|백투유/ },
  { title: 'Where am I going', patterns: /whereamigoing|웨렘아|웨얼아임고잉/ },
  { title: 'Blue', patterns: /blue|블루/ },
  { title: 'Last Day', patterns: /lastday|라스트데이|라데/ },
  { title: 'Addiction', patterns: /addiction|어딕션|애딕션/ },
  { title: 'What shall I do', patterns: /whatshallido|나어떡해/ },
  { title: 'Regret', patterns: /regret|리그렛/ },
  { title: 'ALIVE', patterns: /alive|얼라이브/ },
  { title: '야경', patterns: /야경/ },
  { title: '불시', patterns: /불시/ },
  { title: '달춤', patterns: /달춤/ },
]

/** 문장(정규화됨)에서 처음 나오는 다른 곡 */
export const findOtherTrack = (normalized: string) => otherTracks.find((s) => s.patterns.test(normalized))

/** 정규화된 문장에서 곡 이름을 지움 — 인사 판별 등에서 곡 이름 속 단어를 오해하지 않게 */
export function stripSongNames(normalized: string) {
  return [...titleTracks, ...otherTracks].reduce((t, s) => t.replace(new RegExp(s.patterns.source, 'g'), ' '), normalized)
}
