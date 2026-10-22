import { useEffect, useRef, useState } from 'react'
import { AppScreen, type OpenAppRequest } from './apps/renderApp'
import { theme } from './config/theme'
import { chats } from './content/chats'
import { DevPanel } from './dev/DevPanel'
import { AppLayer } from './phone/AppLayer'
import { HomeScreen } from './phone/home/HomeScreen'
import { LockScreen } from './phone/LockScreen'
import { NotificationBanner } from './phone/NotificationBanner'
import { PhoneFrame } from './phone/PhoneFrame'
import { unlockTransitions } from './phone/unlockTransitions'
import { useGame } from './state/context'
import { getVirtualDate } from './state/selectors'

type LockState = 'locked' | 'unlocking' | 'unlocked'

const APP_CLOSE_MS = 400
/** 홈 화면이 나타난 뒤 팀장님 첫 카톡이 오기까지 */
const INTRO_DELAY_MS = 1000

function App() {
  const { state, dispatch } = useGame()

  // 잠금/열린 앱은 화면 상태라 저장하지 않음 — 새로고침하면 잠금화면부터 (대화/진행 상태는 유지)
  const [lockState, setLockState] = useState<LockState>('locked')
  const [openApp, setOpenApp] = useState<
    (OpenAppRequest & { origin: { x: number; y: number }; launchId: number }) | null
  >(null)
  const [appVisible, setAppVisible] = useState(false)
  const closeTimer = useRef<number>(undefined)

  const { animation, durationMs, easing } = theme.unlock
  const preset = unlockTransitions[animation]
  const transition = `transform ${durationMs}ms ${easing}, opacity ${durationMs}ms ${easing}`

  // 첫 잠금 해제 후 팀장님 첫 메시지 도착 (한 번만)
  useEffect(() => {
    if (lockState !== 'unlocked' || state.intro.started) return
    const timer = window.setTimeout(() => dispatch({ type: 'START_INTRO', now: Date.now() }), INTRO_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [lockState, state.intro.started, dispatch])

  function handleUnlock() {
    setLockState('unlocking')
    window.setTimeout(() => setLockState('unlocked'), durationMs)
  }

  function launchApp(request: OpenAppRequest, el: HTMLElement) {
    const screen = el.closest('[data-screen]')?.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const origin = screen
      ? { x: rect.left + rect.width / 2 - screen.left, y: rect.top + rect.height / 2 - screen.top }
      : { x: 0, y: 0 }

    window.clearTimeout(closeTimer.current)
    setOpenApp((prev) => ({ ...request, origin, launchId: (prev?.launchId ?? 0) + 1 }))
    setAppVisible(false)
    // 축소 상태로 먼저 그린 다음 프레임에 확대 — transition이 적용되도록
    requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true)))
  }

  function closeApp() {
    setAppVisible(false)
    closeTimer.current = window.setTimeout(() => setOpenApp(null), APP_CLOSE_MS)
  }

  const banner = state.banner
  const bannerMessage = banner && state.chats[banner.chatId].messages.find((m) => m.id === banner.messageId)

  return (
    <>
      <PhoneFrame>
        <div
          className="absolute inset-0 will-change-transform"
          inert={lockState !== 'unlocked' || openApp !== null}
          style={{ transition, ...(lockState === 'locked' ? preset.homeHidden : null) }}
        >
          <HomeScreen onLaunch={(id, el) => launchApp({ id }, el)} />
        </div>

        {openApp && (
          <AppLayer origin={openApp.origin} visible={appVisible} onClose={closeApp}>
            {/* 열 때마다 새로 그림 — 카카오톡이 열린 상태에서 다른 채팅 알림을 눌러도 해당 방으로 */}
            <AppScreen key={openApp.launchId} request={openApp} />
          </AppLayer>
        )}

        {lockState === 'unlocked' && banner && bannerMessage && (
          <NotificationBanner
            key={banner.messageId}
            sender={chats[banner.chatId].name}
            message={bannerMessage.text}
            onOpen={(el) => launchApp({ id: 'kakaotalk', chatId: banner.chatId }, el)}
            onDismiss={() => dispatch({ type: 'DISMISS_BANNER' })}
          />
        )}

        {lockState !== 'unlocked' && (
          <div
            className="absolute inset-0 z-30 will-change-transform"
            style={{ transition, ...(lockState === 'unlocking' ? preset.lockExit : null) }}
          >
            <LockScreen date={getVirtualDate(state)} released={state.released} onUnlock={handleUnlock} />
          </div>
        )}
      </PhoneFrame>

      {/* 개발 서버에서만 표시 — 배포 빌드에서는 제거됨 */}
      {import.meta.env.DEV && <DevPanel />}
    </>
  )
}

export default App
