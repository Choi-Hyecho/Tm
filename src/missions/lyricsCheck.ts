// 도현 미션 — 가사 해석, 정답 비교, 전송 파일 이름 (UI와 분리된 순수 함수)
import { dohyunQuest } from '../content/quests/dohyun'

export type LyricSegment = { type: 'text'; text: string } | { type: 'blank'; id: string; answer: string }

/** 가사 원문을 줄 단위 조각으로 — {정답}은 빈칸(등장 순서대로 blank-1, blank-2…). 앞뒤 빈 줄은 무시 */
export function parseLyrics(source: string): LyricSegment[][] {
  let count = 0
  return source.replace(/^\s*\n|\n\s*$/g, '').split('\n').map((line) => {
    const segments: LyricSegment[] = []
    let last = 0
    for (const match of line.matchAll(/\{([^}]+)\}/g)) {
      if (match.index > last) segments.push({ type: 'text', text: line.slice(last, match.index) })
      segments.push({ type: 'blank', id: `blank-${++count}`, answer: match[1] })
      last = match.index + match[0].length
    }
    if (last < line.length) segments.push({ type: 'text', text: line.slice(last) })
    return segments
  })
}

export const lyricLines = parseLyrics(dohyunQuest.lyrics)
export const lyricBlanks = lyricLines.flat().filter((s) => s.type === 'blank')

/** 앞뒤 공백 무시, 한글 조합형/완성형 차이 제거 */
const normalizeAnswer = (value: string) => value.trim().normalize('NFC')

export const allBlanksFilled = (inputs: Record<string, string>) =>
  lyricBlanks.every((b) => normalizeAnswer(inputs[b.id] ?? '') !== '')

/** 모든 빈칸이 정확한 단어인지 — 전송할 때만 검사 */
export const isLyricsCorrect = (inputs: Record<string, string>) =>
  lyricBlanks.every((b) => normalizeAnswer(inputs[b.id] ?? '') === normalizeAnswer(b.answer))

/** 전송 파일 내용 — 빈칸 자리에 사용자가 쓴 단어를 넣은 가사 */
export const renderLyrics = (inputs: Record<string, string>) =>
  lyricLines
    .map((line) => line.map((s) => (s.type === 'text' ? s.text : normalizeAnswer(inputs[s.id] ?? ''))).join(''))
    .join('\n')

/** n번째 전송 파일 이름 — 극야_라이어_가사검수.txt → _찐 → _찐완 → _찐찐완 → _real → _real_2 … */
export function lyricsFileName(n: number) {
  const { fileBaseName, fileSuffixes } = dohyunQuest
  const suffix = n <= fileSuffixes.length ? fileSuffixes[n - 1] : `${fileSuffixes.at(-1)}_${n - fileSuffixes.length + 1}`
  return `${fileBaseName}${suffix}.txt`
}
