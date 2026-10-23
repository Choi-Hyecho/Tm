// 존비킴 미션: 베이스 믹싱 파일 확인
// 존비킴이 카톡으로 파일 4개를 보냄 → 눌러서 파일 앱에 저장 → 파일 앱에서 들어보고
// 베이스가 제대로 들어간 파일을 공유하기 → 카카오톡 → 존비킴에게 전송 → 맞으면 완료
//
// 파일 이름/오디오 경로는 content/gameFiles.ts. 화면에는 파일명만 보이므로 정답이 이름으로 드러나지 않게 할 것
// 가상 대화 — 실제 멤버의 발언이 아님

export const johnbekimQuest = {
  /** 존비킴이 보내는 파일 (보내는 순서대로) */
  fileIds: ['asset-bass-mix-1', 'asset-bass-mix-2', 'asset-bass-mix-3', 'asset-bass-mix-4'],
  /** 베이스가 제대로 들어간 정답 파일 */
  correctFileId: 'asset-bass-mix-3',

  lines: {
    /** 틀린 파일을 보냈을 때 — 파일마다 (오디오 내용에 맞게 수정) */
    wrong: {
      'asset-bass-mix-1': ['어… 이거 베이스가 하나도 안 들리는데요?? 😇', '다른 파일인 것 같아요!'],
      'asset-bass-mix-2': ['음… 이것도 베이스가 빠진 것 같은데요 🥲', '한 번만 더 들어봐 주실 수 있을까요?'],
      'asset-bass-mix-4': ['매니저님 이거 베이스 없는 버전이에요 ㅠㅠ', '이어폰 끼고 들으면 더 잘 들려요!'],
    } as Record<string, string[]>,
    /** 위에 없는 파일일 때 */
    wrongDefault: ['이거 아닌 것 같아요… 다시 한번만 들어봐 주세요 🥲'],
  },
}
