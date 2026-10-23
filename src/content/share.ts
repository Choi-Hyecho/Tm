// 공유 시트 / 파일 앱 문구
export const shareContent = {
  title: '공유',
  cancel: '닫기',
  kakao: '카카오톡',
  pickFriend: '카카오톡으로 보내기',
  send: '보내기',
  /** 보낸 뒤 안내 — 받는 사람 이름 */
  sent: (name: string) => `${name}님에게 보냈어요`,
  shareButton: '공유',
}

export const filesContent = {
  title: '다운로드',
  empty: '다운로드한 파일이 없어요',
  emptyHint: '카카오톡에서 받은 파일을 누르면 여기에 저장돼요',
  back: '다운로드',
  /** 파일 개수 */
  count: (n: number) => `${n}개의 항목`,
  audioUnavailable: '재생할 수 없는 파일이에요 (오디오 준비 중)',
  /** 카톡에서 파일을 눌러 저장했을 때 */
  saved: (fileName: string) => `'파일' 앱에 저장했어요 · ${fileName}`,
  /** 카톡 파일 메시지 아래 안내 */
  tapToSave: '눌러서 저장',
  savedLabel: '저장됨',
  /** 카톡 첨부 '파일'에 저장한 파일이 없을 때 */
  pickerEmpty: '파일 앱에 저장된 파일이 없어요',
}
