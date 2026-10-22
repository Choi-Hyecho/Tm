// 멤버별 대사 모음 — 각 멤버 파일에서 대사를 관리
import type { MemberId } from '../chats'
import { dohyun } from './dohyun'
import { johnbekim } from './johnbekim'
import { seungbin } from './seungbin'
import type { MemberScript } from './types'
import { yunmin } from './yunmin'

export type { MemberScript } from './types'

export const memberScripts: Record<MemberId, MemberScript> = { yunmin, seungbin, dohyun, johnbekim }

/** 애정 표현에 답할 때 '입력 중…'이 보였다가 사라졌다가 다시 나오는 고민 연출 */
export const affectionHesitation = {
  /** 처음 '입력 중…'이 보이는 시간 */
  typingMs: 1500,
  /** 사라져 있는 시간 (고민 중) — 이 범위에서 매번 랜덤 */
  pauseMinMs: 3000,
  pauseMaxMs: 5000,
}
