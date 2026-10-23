// 게임 속 가상 파일 — 존비킴이 카톡으로 보내고, 눌러서 파일 앱에 저장한 뒤 재생/공유
// 오디오는 public/ 기준 경로. 파일이 없으면 재생만 '준비 중'으로 표시되고 공유(전송)는 가능합니다.

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
    id: 'asset-bass-mix-1',
    fileName: 'bass_mix_최종.wav',
    audio: 'audio/johnbekim/mix_1.mp3',
    sizeLabel: '3.3MB',
    durationLabel: '00:19',
  },
  {
    id: 'asset-bass-mix-2',
    fileName: 'bass_mix_최종2.wav',
    audio: 'audio/johnbekim/mix_2.mp3',
    sizeLabel: '3.0MB',
    durationLabel: '00:17',
  },
  {
    id: 'asset-bass-mix-3',
    fileName: 'bass_mix_진짜최종.wav',
    // 베이스가 빠진 파일 (정답)
    audio: 'audio/johnbekim/mix_3.mp3',
    sizeLabel: '2.9MB',
    durationLabel: '00:17',
  },
  {
    id: 'asset-bass-mix-4',
    fileName: 'bass_mix_최종_수정.wav',
    audio: 'audio/johnbekim/mix_4.mp3',
    sizeLabel: '4.2MB',
    durationLabel: '00:25',
  },
]

export const findFile = (id: string | undefined) => gameFiles.find((f) => f.id === id)
