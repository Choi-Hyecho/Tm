// 존비킴 미션: 베이스 믹싱 파일 비교 청음
// 두 파일을 들어보고 베이스가 정상적으로 들어간 파일을 골라 카톡으로 전송
//
// 파일 목록/오디오 경로는 content/gameFiles.ts에서 관리 (카카오톡 파일 첨부와 공유)
// 화면에는 fileName만 보이고 순서는 매번 섞이므로, 정답 여부가 이름이나 위치로 드러나지 않습니다.
import { gameFiles, type GameFile } from '../gameFiles'

export interface MixFile extends GameFile {
  /** 베이스가 포함된 정상 파일 */
  correct: boolean
}

/** 정답(베이스 포함) 파일의 asset ID */
const CORRECT_FILE_ID = 'asset-mix-v8'
const MIX_FILE_IDS = ['asset-mix-v7', 'asset-mix-v8']

export const johnbekimQuest = {
  /** 곡명 — 미정 */
  songTitle: '',
  correctFileId: CORRECT_FILE_ID,
  files: gameFiles
    .filter((f) => MIX_FILE_IDS.includes(f.id))
    .map((f): MixFile => ({ ...f, correct: f.id === CORRECT_FILE_ID })),
  /** true면 두 파일을 모두 한 번 이상 들어야 전송 가능 (찍기 방지) */
  requireListenAll: true,
  /** 보기 순서를 매번 섞기 */
  shuffle: true,

  // 가상 대화 — 실제 멤버의 발언이 아님
  lines: {
    request: '매니저님!! 믹싱 파일이 두 개가 있는데 하나는 제 베이스가 통째로 빠졌대요… 들어보시고 정상 파일로 보내주실 수 있을까요? 🥲',
    needListen: '두 파일 다 들어보셔야 해요!',
    wrong: '어… 이거 베이스가 하나도 안 들리는데요?? 😇 다른 파일인 것 같아요!',
    correct: '이거예요!! 베이스 살아있네요 ㅎㅎ 감사합니다 매니저님 👍',
  },
}
