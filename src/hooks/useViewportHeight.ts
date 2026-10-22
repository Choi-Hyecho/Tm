import { useEffect } from 'react'

/**
 * 모바일 키보드 대응: 실제로 보이는 영역(visualViewport) 높이를 --app-height로 노출.
 * iOS Safari는 키보드가 올라와도 레이아웃 높이가 줄지 않고 페이지를 밀어 올리므로,
 * 화면 높이를 보이는 영역에 맞추고 스크롤을 원위치시켜 입력창이 키보드 바로 위에 붙게 함.
 */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const update = () => {
      document.documentElement.style.setProperty('--app-height', `${viewport.height}px`)
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])
}
