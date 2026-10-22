import { useEffect, useRef, useState } from 'react'

/** <Toast message={toast.message} lastMessage={toast.lastMessage} />와 함께 사용 */
export function useToast(durationMs = 2200) {
  const [state, setState] = useState({ text: '', visible: false })
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function showToast(text: string) {
    window.clearTimeout(timer.current)
    setState({ text, visible: true })
    timer.current = window.setTimeout(() => setState((s) => ({ ...s, visible: false })), durationMs)
  }

  return {
    toast: { message: state.visible ? state.text : null, lastMessage: state.text },
    showToast,
  }
}

/** 외부 링크는 새 탭으로 — 게임 탭과 진행 상태는 그대로 유지됨. 미입력 링크는 안내만 표시하고 이동하지 않음 */
export function openExternal(url: string, onMissing: () => void) {
  if (!url) {
    onMissing()
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
