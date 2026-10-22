import type { AppDef } from '../config/apps'
import { homeContent } from '../content/home'
import { StatusBar } from '../phone/StatusBar'

// 아직 구현하지 않은 게임 속 앱
export function PlaceholderApp({ app }: { app: AppDef }) {
  return (
    <div className="flex h-full flex-col bg-ice-50 text-ice-900">
      <StatusBar color="#0f2c5e" />
      <h1 className="mt-2 px-5 text-[34px] font-bold">{app.name}</h1>
      <div className="flex flex-1 items-center justify-center pb-20 text-[15px] text-ice-900/45">
        {homeContent.appNotReady}
      </div>
    </div>
  )
}
