import { apps, type AppId } from '../config/apps'
import type { ChatId } from '../content/chats'
import { CalendarApp } from './calendar/CalendarApp'
import { KakaoApp } from './messenger/KakaoApp'
import { NotesApp } from './notes/NotesApp'
import { PhotosApp } from './photos/PhotosApp'
import { PlaceholderApp } from './PlaceholderApp'
import { SettingsApp } from './settings/SettingsApp'
import { TodoApp } from './todo/TodoApp'

export interface OpenAppRequest {
  id: AppId
  /** 카카오톡: 바로 열 채팅방 */
  chatId?: ChatId
}

interface AppScreenProps {
  request: OpenAppRequest
  /** 앱 안에서 다른 앱으로 이동 (예: 카톡 + 메뉴의 메모, 메모의 전송하기 → 카톡) */
  onOpenApp: (request: OpenAppRequest) => void
}

// 게임 속 앱 화면 — 구현되면 여기에 추가. 앱 닫기는 AppLayer(홈 인디케이터)가 담당
export function AppScreen({ request, onOpenApp }: AppScreenProps) {
  switch (request.id) {
    case 'kakaotalk':
      return <KakaoApp chatId={request.chatId} onOpenApp={onOpenApp} />
    case 'todo':
      return <TodoApp />
    case 'photos':
      return <PhotosApp />
    case 'notes':
      return <NotesApp onOpenApp={onOpenApp} />
    case 'settings':
      return <SettingsApp />
    case 'calendar':
      return <CalendarApp />
    default:
      return <PlaceholderApp app={apps[request.id]} />
  }
}
