import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { lockContent } from '../content/lock'

const KEYS: [digit: string, letters: string][] = [
  ['1', ''],
  ['2', 'ABC'],
  ['3', 'DEF'],
  ['4', 'GHI'],
  ['5', 'JKL'],
  ['6', 'MNO'],
  ['7', 'PQRS'],
  ['8', 'TUV'],
  ['9', 'WXYZ'],
]

type Status = 'input' | 'error' | 'success'

interface PasscodePadProps {
  /** 화면에 보이는 동안만 키보드 입력을 받음 */
  active: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function PasscodePad({ active, onSuccess, onCancel }: PasscodePadProps) {
  const { passcode } = lockContent
  const [entered, setEntered] = useState('')
  const [status, setStatus] = useState<Status>('input')
  const [showError, setShowError] = useState(false)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function press(digit: string) {
    if (status !== 'input' || entered.length >= passcode.length) return
    const next = entered + digit
    setEntered(next)
    setShowError(false)
    if (next.length < passcode.length) return

    // 문자열끼리 비교 — 숫자로 바꾸면 '0121'의 앞자리 0이 사라짐
    if (next === passcode) {
      setStatus('success')
      timer.current = window.setTimeout(onSuccess, 180)
    } else {
      setStatus('error')
      setShowError(true)
      navigator.vibrate?.(120)
      timer.current = window.setTimeout(() => {
        setEntered('')
        setStatus('input')
      }, 520)
    }
  }

  function backspace() {
    if (status !== 'input') return
    if (entered) setEntered(entered.slice(0, -1))
    else onCancel()
  }

  // 데스크톱 키보드 입력 지원
  const handleKey = useEffectEvent((e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) press(e.key)
    else if (e.key === 'Backspace') backspace()
    else if (e.key === 'Escape') onCancel()
  })

  useEffect(() => {
    if (!active) return
    const listener = (e: KeyboardEvent) => handleKey(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [active])

  return (
    <div className="flex h-full flex-col items-center text-white select-none">
      {/* 위쪽 여백을 더 크게 — 숫자판이 화면 아래쪽으로 */}
      <div className="flex flex-[1.5] flex-col items-center justify-end pb-[3.5cqh]">
        <p className="text-[22px]">{lockContent.title}</p>
        <div className={`mt-6 flex gap-7 ${status === 'error' ? 'animate-shake' : ''}`}>
          {Array.from({ length: passcode.length }, (_, i) => (
            <span
              key={i}
              className={`size-[15px] rounded-full border-[1.5px] border-white transition-colors duration-100 ${
                i < entered.length ? 'animate-dot-pop bg-white' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
        <p className="mt-4 h-5 text-[14px]" aria-live="polite">
          {showError ? lockContent.errorMessage : ''}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-x-[min(28px,7cqw)] gap-y-[min(20px,2.4cqh)]">
        {KEYS.map(([digit, letters]) => (
          <Key key={digit} digit={digit} letters={letters} onPress={press} />
        ))}
        <span />
        <Key digit="0" letters="" onPress={press} />
        <span />
      </div>

      <div className="flex w-full flex-1 items-end justify-between px-[13cqw] pb-[calc(5cqh+var(--ui-bottom,0px))] text-[18px]">
        <span className="text-white/90">{lockContent.emergencyLabel}</span>
        <button type="button" onClick={backspace} className="active:opacity-50">
          {entered ? lockContent.deleteLabel : lockContent.cancelLabel}
        </button>
      </div>
    </div>
  )
}

interface KeyProps {
  digit: string
  letters: string
  onPress: (digit: string) => void
}

function Key({ digit, letters, onPress }: KeyProps) {
  return (
    <button
      type="button"
      aria-label={digit}
      onClick={() => onPress(digit)}
      className="flex size-[min(86px,22cqw,10.2cqh)] flex-col items-center justify-center rounded-full bg-white/20 transition-colors duration-300 active:bg-white/55 active:duration-0"
    >
      <span className="text-[min(40px,4.8cqh)] leading-none font-light">{digit}</span>
      <span className="mt-0.5 h-3 text-[11px] leading-3 font-semibold tracking-[0.18em]">{letters}</span>
    </button>
  )
}
