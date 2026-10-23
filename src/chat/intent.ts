// 자유 입력 문장의 정규화와 첫 대화용 긍정/부정 판별
import { stripSongNames } from '../content/discography'

/** 공백/문장부호/이모지/웃음(ㅋㅎ)을 지우고 소문자로 — 인사 'ㅎㅇ'의 ㅎ은 남김 */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/ㅋ+|ㅎ+(?!ㅇ)/g, '')
}

// 사람을 향한 애정 표현 — 노래/무대 칭찬("노래가 너무 좋아요")은 제외
const AFFECTION = /사랑(?:해|합|함|한다|하는거|해용|해여|스러)|좋아해|좋아합|보고싶|보구싶|뽀뽀|결혼해|최애|내꺼|내거야|짱좋아|하트/
const AFFECTION_EXCLUDE = /노래|곡|음악|앨범|가사|무대|목소리|연주|베이스|기타|드럼|멜로디|뮤비|공연|사진/
const HEARTS = /[♥♡❤💕💖💗💘💓💞😍🥰😘]/u

/** 멤버를 향한 애정 표현 */
export function isAffection(text: string) {
  const t = normalize(text)
  if (AFFECTION_EXCLUDE.test(t)) return false
  return AFFECTION.test(t) || HEARTS.test(text)
}

/** "밥 먹었어요?", "식사하셨어요?" */
export function isMealQuestion(text: string) {
  return /밥(?:은|을|좀)?(?:먹|드셨|드시)|식사(?:는|하셨|했|하셨나)|(?:점심|저녁|아침)(?:은|을)?(?:먹|드셨|드시)|끼니/.test(normalize(text))
}

const GREETING = /안녕|하이|ㅎㅇ|ㅎ2|hi|hello|헬로|반갑|반가워|반가웡|처음뵙|첨뵙|인사드|잘부탁|굿모닝|좋은아침/

/** "안녕하세요", "안녕하십니까", "반갑습니다", "ㅎㅇ" 같은 인사 — 곡 이름 속 '하이'(하이라이트), 'hi'(Shibuya)는 제외 */
export function isGreeting(text: string) {
  return GREETING.test(stripSongNames(normalize(text)))
}

// '넵넵', '네네', 'ㅇㅇ' 처럼 짧은 긍정 대답만으로 이뤄진 문장
const YES_ONLY = /^(네|넵|넷|넹|넴|예|옙|응|웅|ㅇㅇ|ㅇㅋ|ok|okay|오케이|yes|yep)+$/
const YES_WORDS = ['확인', '봤', '읽었', '알겠', '알고있', '숙지', '체크했']
const NO_WORDS = ['아직', '아니', '못', '안했', '안봤', '안읽', '모르', '몰라', '글쎄', '깜빡']

/** 부정 표현 — '확인 못 했어요'처럼 긍정 단어가 섞여도 부정으로 판단 */
export function isNegative(text: string) {
  const t = normalize(text)
  return NO_WORDS.some((w) => t.includes(w))
}

/** '넵', '네네'처럼 짧은 긍정 대답만 */
export function isYesOnly(text: string) {
  return YES_ONLY.test(normalize(text))
}

// '어디서 확인하면 되나요?'처럼 '확인'이 들어간 질문을 긍정 대답으로 오해하지 않도록
const QUESTION = /어디|어떻게|어떡|어딨|뭘|뭐|무엇|무슨|어떤|언제|왜/

/** 질문 단어가 들어간 문장 */
export function isQuestion(text: string) {
  return QUESTION.test(normalize(text))
}

export function isAffirmative(text: string) {
  const t = normalize(text)
  if (!t || isNegative(text) || isQuestion(text)) return false
  return YES_ONLY.test(t) || YES_WORDS.some((w) => t.includes(w))
}
