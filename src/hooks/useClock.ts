import { useEffect, useState } from 'react'

/** 분 단위로 갱신되는 현재 시각. 백그라운드 복귀 시(모바일 Safari 타이머 정지 대비) 즉시 갱신 */
export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number

    function tick() {
      const current = new Date()
      setNow(current)
      const msToNextMinute = 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds())
      timer = window.setTimeout(tick, msToNextMinute)
    }

    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      window.clearTimeout(timer)
      tick()
    }

    tick()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return now
}
