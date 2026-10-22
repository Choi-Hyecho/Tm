import { useState, type ReactNode } from 'react'
import { assetUrl } from '../../lib/asset'

interface FallbackImageProps {
  src: string
  /** 이미지가 없을 때 배경 */
  fallback: string
  /** 이미지가 없을 때 위에 표시할 내용 */
  children?: ReactNode
  className?: string
  /** cover: 영역을 꽉 채움(잘릴 수 있음) / contain: 원본 비율 그대로 전부 보임 */
  fit?: 'cover' | 'contain'
}

// 설정된 이미지를 표시하고, 파일이 아직 없으면 그라디언트 임시 이미지로 대체
export function FallbackImage({ src, fallback, children, className = '', fit = 'cover' }: FallbackImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`flex items-center ${className}`} style={{ background: fallback }}>
        {children}
      </div>
    )
  }

  return (
    <img
      src={assetUrl(src)}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}
