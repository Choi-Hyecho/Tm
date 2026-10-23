import { useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '../lib/asset'

/**
 * 재생 위치 이동/속도 조절이 되는 오디오 플레이어 (메모 앱 녹음본 등).
 * 화면을 떠나면(언마운트) 자동으로 멈춤. 파일이 없거나 재생에 실패하면 error.
 * 볼륨은 iOS Safari에서 웹페이지가 바꿀 수 없어 제공하지 않음 — 기기 볼륨 버튼 사용
 */
export function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRateState] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = assetUrl(src)
    audioRef.current = audio
    let frame = 0

    // 재생 중에는 매 프레임 위치 갱신 (timeupdate만으로는 진행 바가 끊겨 보임)
    const tick = () => {
      setCurrentTime(audio.currentTime)
      frame = requestAnimationFrame(tick)
    }
    const onPlay = () => {
      setPlaying(true)
      frame = requestAnimationFrame(tick)
    }
    const onPause = () => {
      setPlaying(false)
      cancelAnimationFrame(frame)
      setCurrentTime(audio.currentTime)
    }
    const onEnded = () => {
      onPause()
      audio.currentTime = 0
      setCurrentTime(0)
    }
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onError = () => setError(true)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('error', onError)
    return () => {
      cancelAnimationFrame(frame)
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('error', onError)
      audio.removeAttribute('src')
    }
  }, [src])

  // iOS Safari는 사용자 터치 안에서만 재생되므로 클릭 핸들러에서 호출할 것
  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setError(true))
    else audio.pause()
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const max = Number.isFinite(audio.duration) ? audio.duration : time
    audio.currentTime = Math.min(Math.max(0, time), max)
    setCurrentTime(audio.currentTime)
  }, [])

  const skip = useCallback((seconds: number) => seek((audioRef.current?.currentTime ?? 0) + seconds), [seek])

  const setRate = useCallback((value: number) => {
    if (audioRef.current) audioRef.current.playbackRate = value
    setRateState(value)
  }, [])

  return { playing, currentTime, duration, rate, error, toggle, seek, skip, setRate }
}
