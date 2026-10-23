// 멤버 자유 대화 의도 판별 — 어떤 말이 어떤 상황인지(공통). 대사는 멤버별 파일(content/members/)에서 관리
import { isMealQuestion, normalize } from './intent'

export type MemberIntent =
  | 'call'
  | 'sorry'
  | 'thanks'
  | 'meal'
  | 'bye'
  | 'release'
  | 'cheer'
  | 'praiseMusic'
  | 'compliment'
  | 'tired'
  | 'howAreYou'
  | 'laugh'

/** 부르기만 한 경우 — "윤민님", "승빈아", "존비킴 계세요?" */
function isCall(t: string, names: string[]) {
  // 호칭도 입력과 똑같이 정규화 — '여자의 악마'처럼 띄어쓰기가 있어도 인식. 긴 호칭부터 비교
  const normalized = [...new Set(names.map(normalize).filter(Boolean))].sort((a, b) => b.length - a.length)
  const name = `(?:${normalized.join('|')})`
  const call = new RegExp(`^(?:저기요|혹시)?${name}(?:아|야|이|님|씨|형|누나|오빠|쌤)?(?:님)?(?:있어요|계세요|계신가요|있나요|저기요|혹시|바쁘세요)?$`)
  return call.test(t)
}

// 배열 순서가 우선순위 — 구체적인 것부터
const PATTERNS: [MemberIntent, RegExp][] = [
  ['sorry', /죄송|미안|쏘리|sorry/],
  ['thanks', /감사|고마|고맙|땡큐|thank|ㄱㅅ/],
  ['bye', /잘자|굿나잇|수고하셨|수고했|내일봐|이따봐|다음에봐|들어가세요|푹쉬|쉬세요|빠이|바이바이/],
  ['release', /발매|떨려|떨리|긴장|컴백|디데이|d-?1/],
  [
    'praiseMusic',
    /(?:노래|곡|앨범|극야|음악|목소리|무대|라이브|연주|베이스|기타|드럼|가사|뮤비)(?:가|이|도|는|은)?(?:너무|진짜|정말|완전|넘)?(?:좋|최고|대박|미쳤|명곡|기대|띵곡|짱)|명곡|띵곡/,
  ],
  ['compliment', /잘생|예쁘|이쁘|멋있|멋져|멋지|귀여|귀엽|천재|존잘|짱이에요|최고예요/],
  ['cheer', /화이팅|파이팅|힘내|홧팅|응원/],
  ['tired', /피곤|졸려|졸리|힘들|지쳐|지친|잠와|잠온/],
  ['howAreYou', /뭐해|뭐하세요|뭐하고|바빠|바쁘|잘지내|괜찮아|괜찮으세요|컨디션|어떠세요|어때요/],
]

/** 멤버에게 한 말의 의도 — 인사·애정 표현은 scripts.ts에서 먼저 처리 */
export function detectMemberIntent(text: string, names: string[]): MemberIntent | null {
  const t = normalize(text)
  // ㅋㅋㅋ, ㅎㅎ처럼 웃음만 보낸 경우 (정규화하면 빈 문자열)
  if (!t) return /[ㅋㅎ]/.test(text) ? 'laugh' : null
  if (isCall(t, names)) return 'call'
  if (isMealQuestion(text)) return 'meal'
  return PATTERNS.find(([, pattern]) => pattern.test(t))?.[0] ?? null
}
