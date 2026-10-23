import { useState } from 'react'
import { myProfile } from '../../config/kakao'
import { findPhoto, galleryPhotos } from '../../content/gallery'
import { kakaoTabsContent } from '../../content/kakaoTabs'
import { useGame } from '../../state/context'
import { PROFILE_LIMITS, resizeImageFile } from '../../state/profile'
import { PhotoTile } from '../photos/PhotoTile'
import { Avatar } from './Avatar'

// 카톡 내 프로필 편집 — 이름(멤버들이 '○○님'으로 부름), 상태 메시지, 프로필 사진(휴대폰 사진첩 또는 사진 앱 사진)
export function ProfileEditor({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const t = kakaoTabsContent.profileEditor
  const [name, setName] = useState(state.profile.name)
  const [status, setStatus] = useState(state.profile.status)
  const [photoId, setPhotoId] = useState(state.profile.photoId)
  const [photoData, setPhotoData] = useState(state.profile.photoData ?? null)
  const [picking, setPicking] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const avatar = photoData ?? findPhoto(photoId ?? undefined)?.src ?? myProfile.avatar

  function save() {
    dispatch({ type: 'SET_PROFILE', name, status, photoId, photoData })
    onClose()
  }

  /** 휴대폰 사진첩에서 고른 사진 — 256px로 줄여 이 기기에만 저장 */
  async function pickFromDevice(file: File | undefined) {
    if (!file) return
    try {
      setPhotoData(await resizeImageFile(file))
      setPhotoId(null)
      setPhotoError(false)
    } catch {
      setPhotoError(true)
    }
  }

  function pickGame(id: string | null) {
    setPhotoId(id)
    setPhotoData(null)
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white text-black" role="dialog" aria-label={t.title}>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/5 px-3 pt-[var(--status-h)] box-content">
        <button type="button" onClick={onClose} className="px-2 text-[15px] text-black/60 active:opacity-50">
          {t.cancel}
        </button>
        <h2 className="text-[16px] font-semibold">{t.title}</h2>
        <button type="button" onClick={save} className="px-2 text-[15px] font-semibold active:opacity-50">
          {t.done}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-[calc(34px+var(--ui-bottom,0px))]">
        {/* 프로필 사진 — 누르면 사진 앱 사진 중에서 고르기 */}
        <button type="button" onClick={() => setPicking((p) => !p)} className="mx-auto flex flex-col items-center gap-2 active:opacity-70">
          <Avatar src={avatar} size={96} />
          <span className="text-[13px] font-medium text-[#3b86f5]">{t.changePhoto}</span>
        </button>
        {picking && (
          <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-black/[0.03] p-1">
            {/* 휴대폰 사진첩 — 사진은 서버로 보내지 않고 이 기기에만 저장 */}
            <label
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-white text-[11px] font-semibold text-[#3b86f5] active:bg-black/5 ${photoData ? 'ring-3 ring-[#3b86f5]' : ''}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m4 17 5-5 4 4 3-3 4 4" />
              </svg>
              {t.devicePhoto}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void pickFromDevice(e.target.files?.[0])} />
            </label>
            <button
              type="button"
              onClick={() => pickGame(null)}
              aria-pressed={photoId === null && !photoData}
              className={`flex aspect-square items-center justify-center rounded-lg bg-[#9fb4cb] text-[11px] font-semibold text-white ${photoId === null && !photoData ? 'ring-3 ring-[#3b86f5]' : ''}`}
            >
              {t.defaultPhoto}
            </button>
            {galleryPhotos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickGame(p.id)}
                aria-pressed={photoId === p.id && !photoData}
                aria-label={p.fileName}
                className={`overflow-hidden rounded-lg ${photoId === p.id && !photoData ? 'ring-3 ring-[#3b86f5]' : ''}`}
              >
                <PhotoTile photo={p} className="aspect-square w-full" />
              </button>
            ))}
          </div>
        )}
        {photoError && <p className="mt-2 text-center text-[12px] text-[#ff3b30]">{t.photoError}</p>}

        <label className="mt-6 block">
          <span className="text-[12px] font-semibold text-black/45">{t.nameLabel}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, PROFILE_LIMITS.name))}
            placeholder={myProfile.name}
            className="mt-1 w-full border-b border-black/15 py-2 text-[16px] outline-none focus:border-black/60"
          />
          <span className="mt-1 flex justify-between text-[11.5px] text-black/40">
            <span>{t.nameHint}</span>
            <span>
              {name.length}/{PROFILE_LIMITS.name}
            </span>
          </span>
        </label>

        <label className="mt-5 block">
          <span className="text-[12px] font-semibold text-black/45">{t.statusLabel}</span>
          <input
            value={status}
            onChange={(e) => setStatus(e.target.value.slice(0, PROFILE_LIMITS.status))}
            placeholder={state.released ? myProfile.statusMessageReleased : myProfile.statusMessage}
            className="mt-1 w-full border-b border-black/15 py-2 text-[16px] outline-none focus:border-black/60"
          />
          <span className="mt-1 block text-right text-[11.5px] text-black/40">
            {status.length}/{PROFILE_LIMITS.status}
          </span>
        </label>
      </div>
    </div>
  )
}
