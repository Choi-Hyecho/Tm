// 도현 미션: LIAR 가사 받아쓰기
// 짧은 오디오 구간을 반복 재생하며 빈칸에 들어갈 단어를 고르는 방식 (음악과 실시간 동기화 없음)
//
// 오디오 교체: public/audio/dohyun/ 아래 같은 이름으로 파일을 넣으면 바로 적용됩니다.
//   - 문제마다 짧게 자른 파일을 쓰는 것을 권장 (반복 구간이 가장 정확함)
//   - 긴 파일 하나를 쓸 경우 clip.start/end(초)로 반복 구간 지정
//
// ⚠️ 아래 가사는 모두 임시 문구입니다. 실제 LIAR 가사로 교체해 주세요.

export interface LyricsQuestion {
  id: string
  /** public/ 기준 오디오 경로 */
  audio: string
  /** 긴 파일의 일부만 반복할 때 (초 단위). 생략하면 파일 전체 반복 */
  clip?: { start: number; end: number }
  /** 빈칸 앞 가사 */
  before: string
  /** 빈칸 뒤 가사 */
  after: string
  /** 정답 단어 */
  answer: string
  /** 오답 보기 — 화면에서는 정답과 섞어서 표시 */
  distractors: string[]
}

export const dohyunQuest = {
  songTitle: 'LIAR',
  /** 이 개수만큼 모두 맞히면 미션 완료 */
  questions: [
    {
      id: 'liar-1',
      audio: 'audio/dohyun/liar_q1.mp3',
      before: '[임시 가사] 첫 번째 소절',
      after: '다음 가사',
      answer: '정답1',
      distractors: ['오답1-1', '오답1-2', '오답1-3'],
    },
    {
      id: 'liar-2',
      audio: 'audio/dohyun/liar_q2.mp3',
      before: '[임시 가사] 두 번째 소절',
      after: '다음 가사',
      answer: '정답2',
      distractors: ['오답2-1', '오답2-2', '오답2-3'],
    },
    {
      id: 'liar-3',
      audio: 'audio/dohyun/liar_q3.mp3',
      before: '[임시 가사] 세 번째 소절',
      after: '다음 가사',
      answer: '정답3',
      distractors: ['오답3-1', '오답3-2', '오답3-3'],
    },
  ] satisfies LyricsQuestion[],

  // 가상 대화 — 실제 멤버의 발언이 아님
  lines: {
    request: '매니저님, LIAR 가사집 최종본 만들고 있는데 제가 너무 빨리 불러서 저도 헷갈려요… 들어보시고 빈칸 좀 채워주실 수 있나요?',
    wrong: '음… 그 단어는 아닌 것 같아요! 한 번만 더 들어봐 주세요 🎧',
    correct: '맞아요 그거예요!',
    cleared: '와 완벽해요! 가사집 바로 넘길게요. 감사합니다 매니저님!',
  },
}
