import { apps, type AppId } from '../config/apps'
import type { ChatId } from '../content/chats'
import { KakaoApp } from './messenger/KakaoApp'
import { PhotosApp } from './photos/PhotosApp'
import { PlaceholderApp } from './PlaceholderApp'
import { TodoApp } from './todo/TodoApp'

export interface OpenAppRequest {
  id: AppId
  /** 카카오톡: 바로 열 채팅방 */
  chatId?: ChatId
}

// 게임 속 앱 화면 — 구현되면 여기에 추가. 앱 닫기는 AppLayer(홈 인디케이터)가 담당
export function AppScreen({ request }: { request: OpenAppRequest }) {
  switch (request.id) {
    case 'kakaotalk':
      return <KakaoApp chatId={request.chatId} />
    case 'todo':
      return <TodoApp />
    case 'photos':
      return <PhotosApp />
    default:
      return <PlaceholderApp app={apps[request.id]} />
  }
}
