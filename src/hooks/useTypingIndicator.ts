import { useEffect, useState } from 'react'
import type { ScheduledMessage } from '../state/types'

/**
 * 이 채팅방 상대가 지금 '입력 중'인지.
 * typingWindows가 있는 답장(고민 연출)은 해당 구간에만 표시하고, 구간 경계마다 다시 그림
 */
export function useTypingIndicator(scheduled: ScheduledMessage[]) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const current = Date.now()
    const boundaries = scheduled.flatMap((s) => s.typingWindows?.flat() ?? []).filter((t) => t > current)
    if (boundaries.length === 0) return
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(...boundaries) - current + 20)
    return () => window.clearTimeout(timer)
  }, [scheduled, now])

  return scheduled.some(
    (s) => !s.typingWindows || s.typingWindows.some(([start, end]) => now >= start && now < end),
  )
}
