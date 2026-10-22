import { useEffect } from 'react'

/**
 * Safari 상단 상태바 영역은 이미지가 아닌 페이지 배경색으로 칠해짐 —
 * 지금 화면 맨 위와 같은 색을 지정해 게임 화면과 이어져 보이게 함 (theme-color + 페이지 배경)
 */
export function useBrowserChromeColor(color: string) {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = color
    document.documentElement.style.backgroundColor = color
    document.body.style.backgroundColor = color
  }, [color])
}
