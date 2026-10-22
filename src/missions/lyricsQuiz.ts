// 도현 미션 게임 로직 — UI와 분리된 순수 함수 (useReducer로 사용)
import type { LyricsQuestion } from '../content/quests/dohyun'
import { shuffle } from '../lib/shuffle'

export type QuizStatus = 'answering' | 'wrong' | 'correct' | 'cleared'

export interface QuizState {
  questions: LyricsQuestion[]
  /** 문제별 보기 순서 (시작 시 한 번만 섞음) */
  choices: string[][]
  index: number
  status: QuizStatus
  selected: string | null
  /** 오답 횟수 (대사 분기용) */
  wrongCount: number
}

export type QuizAction =
  /** 보기 선택 → 즉시 채점 */
  | { type: 'SELECT'; choice: string }
  /** 오답 표시 후 다시 고르기 */
  | { type: 'RETRY' }
  /** 정답 표시 후 다음 문제 (마지막이면 cleared) */
  | { type: 'NEXT' }

export function createQuiz(questions: LyricsQuestion[], random = Math.random): QuizState {
  return {
    questions,
    choices: questions.map((q) => shuffle([q.answer, ...q.distractors], random)),
    index: 0,
    status: 'answering',
    selected: null,
    wrongCount: 0,
  }
}

/** 띄어쓰기/대소문자 차이는 정답으로 인정 (직접 입력 방식으로 바꿀 때 대비) */
export function isCorrectAnswer(question: LyricsQuestion, input: string) {
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase()
  return normalize(input) === normalize(question.answer)
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT': {
      if (state.status !== 'answering') return state
      const correct = isCorrectAnswer(state.questions[state.index], action.choice)
      return {
        ...state,
        selected: action.choice,
        status: correct ? 'correct' : 'wrong',
        wrongCount: correct ? state.wrongCount : state.wrongCount + 1,
      }
    }
    case 'RETRY':
      if (state.status !== 'wrong') return state
      return { ...state, status: 'answering', selected: null }
    case 'NEXT': {
      if (state.status !== 'correct') return state
      const isLast = state.index >= state.questions.length - 1
      if (isLast) return { ...state, status: 'cleared' }
      return { ...state, index: state.index + 1, status: 'answering', selected: null }
    }
  }
}
