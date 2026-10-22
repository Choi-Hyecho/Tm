import { useState } from 'react'
import { galleryPhotos } from '../../content/gallery'
import { StatusBar } from '../../phone/StatusBar'
import { PhotoTile } from './PhotoTile'
import { PhotoViewer } from './PhotoViewer'

// 사진첩 — 카카오톡 앨범 첨부와 같은 사진 데이터(content/gallery.ts)를 사용. 여기서 보기만 해서는 미션이 진행되지 않음
export function PhotosApp() {
  const [viewing, setViewing] = useState<string | null>(null)

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <StatusBar color="#1c1c1e" />
      <h1 className="px-4 pt-1 pb-2 text-[28px] font-bold">사진</h1>
      <div className="flex-1 overflow-y-auto pb-[calc(34px+var(--ui-bottom,0px))]">
        <div className="grid grid-cols-3 gap-0.5">
          {galleryPhotos.map((p) => (
            <button key={p.id} type="button" onClick={() => setViewing(p.id)} aria-label={p.fileName} className="active:opacity-70">
              <PhotoTile photo={p} className="aspect-square w-full" />
            </button>
          ))}
        </div>
        <p className="py-4 text-center text-[12px] text-black/40">사진 {galleryPhotos.length}장</p>
      </div>
      {viewing && (
        <PhotoViewer photoIds={galleryPhotos.map((p) => p.id)} initialId={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}
