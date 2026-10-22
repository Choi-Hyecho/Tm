import { useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '../lib/asset'

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface ClipOptions {
  /** 반복 구간 (초). 생략하면 파일 전체 */
  start?: number
  end?: number
  loop?: boolean
}

// 동시에 하나만 재생 — A/B 비교 시 다른 파일을 누르면 이전 파일은 멈춤
let activeAudio: HTMLAudioElement | null = null

/**
 * 짧은 오디오 구간 재생. 파일이 없거나 재생에 실패하면 status가 'error'가 되고 앱은 계속 동작.
 * iOS Safari는 사용자 터치 안에서만 재생되므로 toggle/play는 반드시 클릭 핸들러에서 호출할 것.
 */
export function useAudioClip(src: string, { start = 0, end, loop = false }: ClipOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] = useState<AudioStatus>('idle')

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audio.src = assetUrl(src)
    audio.loop = loop && end === undefined
    audioRef.current = audio

    const restartOrStop = () => {
      if (loop) {
        audio.currentTime = start
        void audio.play()
      } else {
        audio.pause()
        audio.currentTime = start
        setStatus('idle')
      }
    }
    // 구간 끝 감지 — timeupdate 간격(약 0.25초)만큼 오차가 있어 정밀한 반복은 잘라낸 파일을 권장
    const handleTimeUpdate = () => {
      if (end !== undefined && audio.currentTime >= end) restartOrStop()
    }
    const handleEnded = () => {
      if (!audio.loop) restartOrStop()
    }
    const handleError = () => setStatus('error')
    const handlePause = () => setStatus((s) => (s === 'playing' ? 'paused' : s))

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('pause', handlePause)
      audio.removeAttribute('src')
      if (activeAudio === audio) activeAudio = null
      setStatus('idle')
    }
  }, [src, start, end, loop])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false
    if (activeAudio && activeAudio !== audio) activeAudio.pause()
    activeAudio = audio
    if (audio.ended || audio.currentTime < start || (end !== undefined && audio.currentTime >= end)) {
      audio.currentTime = start
    }
    setStatus('loading')
    try {
      await audio.play()
      setStatus('playing')
      return true
    } catch {
      setStatus('error')
      return false
    }
  }, [start, end])

  const pause = useCallback(() => audioRef.current?.pause(), [])

  const toggle = useCallback(() => {
    if (status === 'playing') {
      pause()
      return Promise.resolve(false)
    }
    return play()
  }, [status, play, pause])

  return { status, play, pause, toggle }
}
