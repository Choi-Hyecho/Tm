// 윤민 미션: 앨범 자켓 사진 전달
// 카카오톡 앨범 첨부로 윤민의 「극야」 자켓 사진을 보내면 완료 — 정답은 content/gallery.ts의 asset ID로 판별
// 가상 대화 — 실제 멤버의 발언이 아님

export const yunminQuest = {
  correctPhotoId: 'asset-polar-yunmin',
  /** 다른 사람 사진 */
  wrongReply: '어? 매니저님 이거 제 사진 아닌데요? ㅋㅋㅋ',
  /** 윤민 사진이지만 예전 앨범 */
  otherAlbumReply: '앗 이건 예전 앨범 사진이에요 ㅋㅋ 이번 극야 자켓 사진으로 부탁드려요!',
  // 정답일 때는 memberGreetings.yunmin.missionDone 대사가 전송됨
}
