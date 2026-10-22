import type { MemberIntent } from '../../chat/memberIntents'
import type { ReplyRule } from '../../chat/ruleEngine'

/**
 * 멤버 한 명의 대사 — 팬메이드 게임 속 가상 대사이며 실제 멤버의 발언이 아님.
 * 배열로 된 대사는 그 멤버가 최근에 한 말과 겹치지 않게 골라서 사용 (같은 말 반복 방지)
 */
export interface MemberScript {
  /** 부를 때 인식할 이름 (성/애칭 포함) — "윤민님", "승빈아" */
  names: string[]
  /** 사용자가 처음 인사했을 때 — 순서대로 전송 (한 번만) */
  greeting: string[]
  /** 업무 요청 — 다른 멤버 업무가 진행 중이 아닐 때 인사 직후 이어서 전송. 이 메시지가 도착하면 TODO에 업무가 공개됨 */
  request: string[]
  /** 인사 전에 다른 말을 먼저 했을 때 */
  beforeGreeting: string[]
  /** 이미 인사한 뒤 다시 인사했을 때 */
  greetAgain: string[]
  /** "사랑해요" 같은 애정 표현 — 여러 번 하면 팀장님 경고 (managerReplies.ts) */
  affection: string[]
  /** 상황별 반응 — 인식 규칙은 chat/memberIntents.ts */
  intents: Record<MemberIntent, string[]>
  /** 이 멤버만의 이스터에그 — 상황별 반응보다 먼저 확인 */
  extraRules: ReplyRule[]
  /** 업무 진행 중, 알아듣지 못한 말 */
  missionIdle: string[]
  /** 업무 완료 직후 */
  missionDone: string
  /** 업무 완료 후(또는 업무와 무관할 때), 알아듣지 못한 말 */
  afterMission: string[]
}
