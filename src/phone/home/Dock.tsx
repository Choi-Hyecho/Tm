import { apps, dockApps, type AppDef } from '../../config/apps'
import { u } from '../../lib/units'
import { AppIcon } from './AppIcon'

interface DockProps {
  badgeOf: (app: AppDef) => number
  onPress: (app: AppDef, el: HTMLElement) => void
}

export function Dock({ badgeOf, onPress }: DockProps) {
  return (
    <div
      className="grid grid-cols-4 items-center justify-items-center bg-white/25 backdrop-blur-2xl backdrop-saturate-150"
      style={{ width: u(95), height: u(25), borderRadius: u(8.5), paddingInline: u(2.5), columnGap: u(5.6) }}
    >
      {dockApps.map((id) => (
        <AppIcon key={id} app={apps[id]} badge={badgeOf(apps[id])} showLabel={false} onPress={onPress} />
      ))}
    </div>
  )
}
