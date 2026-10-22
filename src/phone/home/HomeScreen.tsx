import type { CSSProperties, ReactNode } from 'react'
import { apps, homeLayout, type AppDef, type AppId } from '../../config/apps'
import { links } from '../../config/links'
import { wallpapers } from '../../config/media'
import { homeContent } from '../../content/home'
import { openExternal, useToast } from '../../hooks/useToast'
import { HOME_UNIT, u } from '../../lib/units'
import { getUnreadTotal } from '../../state/chat'
import { useGame } from '../../state/context'
import { getActiveMissions } from '../../state/selectors'
import { HomeIndicator } from '../HomeIndicator'
import { StatusBar } from '../StatusBar'
import { Toast } from '../Toast'
import { Wallpaper } from '../Wallpaper'
import { AppIcon } from './AppIcon'
import { Dock } from './Dock'
import { DuolingoWidget } from './DuolingoWidget'
import { TodoWidget } from './TodoWidget'

interface HomeScreenProps {
  /** 게임 속 앱 열기 — el은 열림 애니메이션 시작 위치 */
  onLaunch: (id: AppId, el: HTMLElement) => void
}

export function HomeScreen({ onLaunch }: HomeScreenProps) {
  const { state, dispatch } = useGame()
  const { toast, showToast } = useToast()

  const openLink = (url: string) => openExternal(url, () => showToast(homeContent.linkNotReady))

  function openDuolingo() {
    dispatch({ type: 'VISIT_DUOLINGO' })
    openLink(links.duolingoShorts)
  }

  function handlePress(app: AppDef, el: HTMLElement) {
    switch (app.open.type) {
      case 'internal':
        onLaunch(app.id, el)
        break
      case 'external':
        openLink(app.open.link)
        break
      case 'duolingo':
        openDuolingo()
        break
    }
  }

  function badgeOf(app: AppDef) {
    // TODO: 지금 진행할 수 있는 업무 수
    if (app.id === 'todo') return getActiveMissions(state).length
    if (app.id === 'kakaotalk') return getUnreadTotal(state)
    return 0
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden text-white select-none"
      style={{ '--u': HOME_UNIT } as CSSProperties}
    >
      <Wallpaper config={wallpapers.homeScreen} />

      <div className="relative flex h-full flex-col items-center">
        <div className="w-full">
          <StatusBar />
        </div>

        <div
          className="grid grid-cols-4 items-start"
          style={{ width: u(90), columnGap: u(5.6), rowGap: u(3.6), marginTop: u(1.5) }}
        >
          <WidgetCell label={homeContent.todoWidgetLabel}>
            <TodoWidget onOpen={(el) => onLaunch('todo', el)} />
          </WidgetCell>
          <WidgetCell label={homeContent.duolingoWidgetLabel}>
            <DuolingoWidget onOpen={openDuolingo} />
          </WidgetCell>

          {homeLayout.map((id) => (
            <AppIcon key={id} app={apps[id]} badge={badgeOf(apps[id])} onPress={handlePress} />
          ))}
        </div>

        <div className="mt-auto" style={{ marginBottom: u(4.5) }}>
          <Dock badgeOf={badgeOf} onPress={handlePress} />
        </div>
      </div>

      <HomeIndicator />
      <Toast {...toast} />
    </div>
  )
}

function WidgetCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="col-span-2 flex flex-col items-center">
      {/* 위젯 = 아이콘 칸 2개 + 칸 사이 간격 */}
      <div style={{ width: u(42.2), height: u(42.2) }}>{children}</div>
      <span
        className="w-full truncate text-center leading-tight font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
        style={{ fontSize: u(3.05), marginTop: u(1.4) }}
      >
        {label}
      </span>
    </div>
  )
}
