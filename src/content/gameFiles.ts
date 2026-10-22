// 게임 속 가상 파일 — 카카오톡 파일 첨부(그리고 이후 파일 앱)가 함께 사용
// 오디오는 public/ 기준 경로. 파일이 없으면 미리듣기만 '준비 중'으로 표시되고 전송은 가능합니다.

export interface GameFile {
  /** 고유 asset ID — 미션 정답 판별에 사용 */
  id: string
  /** 화면에 보이는 파일명 — 정답 힌트가 되지 않게 지을 것 */
  fileName: string
  audio: string
  sizeLabel: string
  durationLabel: string
}

export const gameFiles: GameFile[] = [
  {
    id: 'asset-mix-v7',
    fileName: 'MIX_FINAL_v7.wav',
    audio: 'audio/johnbekim/mix_no_bass.mp3',
    sizeLabel: '41.2MB',
    durationLabel: '03:58',
  },
  {
    id: 'asset-mix-v8',
    fileName: 'MIX_FINAL_v8.wav',
    audio: 'audio/johnbekim/mix_with_bass.mp3',
    sizeLabel: '41.5MB',
    durationLabel: '03:58',
  },
]

export const findFile = (id: string | undefined) => gameFiles.find((f) => f.id === id)
