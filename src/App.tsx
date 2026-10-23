import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { AppScreen, type OpenAppRequest } from './apps/renderApp'
import { theme } from './config/theme'
import { chatContent, chats } from './content/chats'
import { todoContent } from './content/missions'
import { shareContent } from './content/share'
import { DevPanel } from './dev/DevPanel'
import { useBrowserChromeColor } from './hooks/useBrowserChromeColor'
import { AppLayer } from './phone/AppLayer'
import { HomeScreen } from './phone/home/HomeScreen'
import { LockScreen } from './phone/LockScreen'
import { NotificationBanner } from './phone/NotificationBanner'
import { PhoneFrame } from './phone/PhoneFrame'
import { ReleaseEnding } from './phone/ReleaseEnding'
import { unlockTransitions } from './phone/unlockTransitions'
import { useGame } from './state/context'
import { addressPlayer } from './state/profile'
import { getVirtualDate } from './state/selectors'

type LockState = 'locked' | 'unlocking' | 'unlocked'

const APP_CLOSE_MS = 400
/** 홈 화면이 나타난 뒤 팀장님 첫 카톡이 오기까지 */
const INTRO_DELAY_MS = 1000
/** 앱을 열 때 남기는 방문 기록 — 뒤로가기로 앱 닫기 */
const APP_HISTORY_STATE = { touchedApp: true }
const isAppEntry = (state: unknown) => typeof state === 'object' && state !== null && 'touchedApp' in state

function App() {
  const { state, dispatch } = useGame()

  // 잠금/열린 앱은 화면 상태라 저장하지 않음 — 새로고침하면 잠금화면부터 (대화/진행 상태는 유지)
  const [lockState, setLockState] = useState<LockState>('locked')
  const [openApp, setOpenApp] = useState<
    (OpenAppRequest & { origin: { x: number; y: number }; launchId: number }) | null
  >(null)
  const [appVisible, setAppVisible] = useState(false)
  const closeTimer = useRef<number>(undefined)

  // Safari 상단 영역 색 — 잠금/홈 화면은 배경 사진 맨 위 색, 앱이 열려 있으면 그 앱의 상단 색
  // 발매 엔딩이 떠 있으면 엔딩의 파란색, 발매 후 잠금/홈은 단체 자켓 사진 색
  const { lockAndHome, lockAndHomeReleased, ending, apps: appChromeColors, appDefault } = theme.browserChrome
  const homeChrome = state.released ? lockAndHomeReleased : lockAndHome
  useBrowserChromeColor(
    state.showEnding ? ending : openApp && appVisible ? (appChromeColors[openApp.id] ?? appDefault) : homeChrome,
  )

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
    // 안드로이드 뒤로가기로 앱을 닫을 수 있도록 방문 기록을 하나 남김 (앱이 이미 열려 있으면 그대로)
    if (!isAppEntry(history.state)) history.pushState(APP_HISTORY_STATE, '')
    setOpenApp((prev) => ({ ...request, origin, launchId: (prev?.launchId ?? 0) + 1 }))
    setAppVisible(false)
    // 축소 상태로 먼저 그린 다음 프레임에 확대 — transition이 적용되도록
    requestAnimationFrame(() => requestAnimationFrame(() => setAppVisible(true)))
  }

  /** 앱 안에서 다른 앱으로 이동 — 화면 가운데에서 열림 (예: 카톡 + 메뉴 → 메모, 메모 전송 → 카톡) */
  function switchApp(request: OpenAppRequest) {
    const screen = document.querySelector<HTMLElement>('[data-screen]')
    if (screen) launchApp(request, screen)
  }

  function closeApp() {
    setAppVisible(false)
    closeTimer.current = window.setTimeout(() => setOpenApp(null), APP_CLOSE_MS)
  }

  /** 홈 바/Esc로 닫을 때 — 남겨 둔 방문 기록도 지움 (지우면 아래 popstate에서 닫힘) */
  function requestCloseApp() {
    if (isAppEntry(history.state)) history.back()
    else closeApp()
  }

  // 안드로이드 뒤로가기(버튼/제스처), 브라우저 뒤로 → 열린 앱을 닫고 홈 화면으로
  const handlePopState = useEffectEvent(() => {
    if (openApp) closeApp()
  })
  useEffect(() => {
    // 앱을 연 채로 새로고침하면 앱 기록만 남으므로 지워 둠
    if (isAppEntry(history.state)) history.replaceState(null, '')
    const listener = () => handlePopState()
    window.addEventListener('popstate', listener)
    return () => window.removeEventListener('popstate', listener)
  }, [])

  /** '발매된 업무폰 확인하기' — 엔딩을 닫고(영상도 함께 사라짐) 열린 앱을 정리한 뒤 극야 버전 잠금화면으로 */
  function finishEnding() {
    dispatch({ type: 'CLOSE_ENDING' })
    window.clearTimeout(closeTimer.current)
    setOpenApp(null)
    setAppVisible(false)
    if (isAppEntry(history.state)) history.replaceState(null, '')
    setLockState('locked')
  }

  // 표시 시각(notBefore)이 남은 알림은 그때 다시 그림
  const [bannerClock, setBannerClock] = useState(() => Date.now())
  useEffect(() => {
    const waits = state.banners.flatMap((b) => (b.kind === 'todo' && b.notBefore ? [b.notBefore] : []))
    const next = Math.min(...waits.filter((t) => t > bannerClock))
    if (!Number.isFinite(next)) return
    const timer = window.setTimeout(() => setBannerClock(Date.now()), next - Date.now())
    return () => window.clearTimeout(timer)
  }, [state.banners, bannerClock])

  // 알림은 앞에서부터 하나씩 — 카톡 새 메시지 / TODO 업무 변경 (표시 시각 전인 알림은 건너뜀)
  const banner = state.banners.find((b) => b.kind !== 'todo' || !b.notBefore || b.notBefore <= bannerClock)
  const bannerView =
    banner &&
    (banner.kind === 'chat'
      ? {
          appId: 'kakaotalk' as const,
          appName: chatContent.appName,
          title: chats[banner.chatId].name,
          message: addressPlayer(state.chats[banner.chatId].messages.find((m) => m.id === banner.messageId)?.text ?? '', state),
        }
      : banner.kind === 'sent'
        ? {
            appId: 'kakaotalk' as const,
            appName: chatContent.appName,
            title: chats[banner.chatId].name,
            message: shareContent.sent(chats[banner.chatId].name),
          }
        : { appId: 'todo' as const, appName: todoContent.notifications.appName, title: banner.title, message: banner.body })

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
          <AppLayer origin={openApp.origin} visible={appVisible} onClose={requestCloseApp}>
            {/* 열 때마다 새로 그림 — 카카오톡이 열린 상태에서 다른 채팅 알림을 눌러도 해당 방으로 */}
            <AppScreen key={openApp.launchId} request={openApp} onOpenApp={switchApp} />
          </AppLayer>
        )}

        {lockState === 'unlocked' && !state.showEnding && banner && bannerView && (
          <NotificationBanner
            key={banner.id}
            {...bannerView}
            onOpen={(el) => {
              // 카톡 알림(받은 메시지/보낸 공유)은 채팅방을 열면 저절로 정리됨, TODO 알림은 여기서 정리
              if (banner.kind === 'todo') dispatch({ type: 'DISMISS_BANNER', id: banner.id })
              launchApp(banner.kind === 'todo' ? { id: 'todo' } : { id: 'kakaotalk', chatId: banner.chatId }, el)
            }}
            onDismiss={() => dispatch({ type: 'DISMISS_BANNER', id: banner.id })}
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

        {/* 극야 발매 엔딩 — 처음 발매했을 때(또는 TODO에서 다시 보기) */}
        {state.showEnding && <ReleaseEnding onFinish={finishEnding} />}
      </PhoneFrame>

      {/* 개발 서버, 또는 테스트 배포에서 VITE_DEV_PANEL=true일 때만 표시 — 정식 배포에서는 이 변수를 두지 말 것 */}
      {(import.meta.env.DEV || import.meta.env.VITE_DEV_PANEL === 'true') && <DevPanel />}
    </>
  )
}

export default App
