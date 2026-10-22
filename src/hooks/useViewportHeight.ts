import { useEffect } from 'react'

const isTyping = () => {
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

/**
 * 모바일 Safari 대응
 * - 평소: 게임 화면을 페이지 전체(하단 툴바 뒤까지)로 채우고, 툴바가 가리는 높이를 --ui-bottom으로 노출
 *   → Dock·입력창 등 눌러야 하는 하단 요소는 그만큼 위로 올림 (데스크톱/홈 화면 앱에서는 0)
 * - 입력 중(키보드 표시): 실제로 보이는 영역 높이를 --app-height로 지정해 입력창이 키보드 바로 위에 붙게 함
 */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const root = document.documentElement.style

    const update = () => {
      if (isTyping()) {
        root.setProperty('--app-height', `${viewport.height}px`)
        root.setProperty('--ui-bottom', '0px')
      } else {
        root.removeProperty('--app-height')
        const covered = Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
        root.setProperty('--ui-bottom', `${Math.max(0, covered)}px`)
      }
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }
    // 포커스 변화 직후에는 키보드 애니메이션이 끝나지 않았으므로 조금 뒤에 한 번 더
    const updateSoon = () => {
      update()
      window.setTimeout(update, 350)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    document.addEventListener('focusin', updateSoon)
    document.addEventListener('focusout', updateSoon)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.removeEventListener('focusin', updateSoon)
      document.removeEventListener('focusout', updateSoon)
    }
  }, [])
}
