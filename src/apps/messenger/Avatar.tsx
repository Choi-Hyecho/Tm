import { useState } from 'react'
import { assetUrl } from '../../lib/asset'

// 프로필 사진 — 파일이 없으면 기본 프로필(사람 실루엣)
export function Avatar({ src, size }: { src: string; size: number }) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size, borderRadius: '38%' }

  if (failed) {
    return (
      <div className="flex shrink-0 items-end justify-center overflow-hidden bg-[#9fb4cb]" style={style} aria-hidden>
        <svg viewBox="0 0 24 24" className="size-[78%] translate-y-[8%]" fill="#e6eef7">
          <circle cx="12" cy="8.5" r="4.5" />
          <path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5Z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={assetUrl(src)}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="shrink-0 object-cover"
      style={style}
    />
  )
}
