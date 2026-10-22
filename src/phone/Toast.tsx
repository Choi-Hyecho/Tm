interface ToastProps {
  /** 표시 중인 메시지 (null이면 숨김) */
  message: string | null
  /** 사라지는 애니메이션 동안 유지할 마지막 메시지 */
  lastMessage: string
}

// 상단 알림 배너 형태의 짧은 안내
export function Toast({ message, lastMessage }: ToastProps) {
  const visible = message !== null
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-[58px] z-40 flex justify-center px-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 250ms ease, transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {lastMessage && (
        <p className="rounded-2xl bg-white/90 px-4 py-2.5 text-center text-[14px] font-medium text-ice-900 shadow-lg backdrop-blur-xl">
          {message ?? lastMessage}
        </p>
      )}
    </div>
  )
}
