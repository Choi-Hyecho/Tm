// 디자인 설정 — 색상/표시 형식/애니메이션은 이 파일에서 수정합니다.
// 배경화면 이미지와 음원 링크는 config/media.ts에서 관리합니다.

import type { AppId } from './apps'

export type ClockFormat = '12h' | '24h'
export type UnlockAnimation = 'slideUp' | 'fade' | 'zoom'

export const theme = {
  /** 상태바/잠금화면 시계 표기 */
  clockFormat: '12h' as ClockFormat,

  statusBar: {
    /** 잠금화면 상태바 왼쪽에 표시되는 통신사 이름 */
    carrier: 'TOUCHED',
    /** 배터리 잔량 0 ~ 1 */
    battery: 0.82,
  },

  lockScreen: {
    showDate: true,
    showTime: true,
    /** 날짜 표기 형식 (Intl.DateTimeFormat 옵션) — 예: 10월 14일 수요일 */
    dateFormat: { month: 'long', day: 'numeric', weekday: 'long' } as Intl.DateTimeFormatOptions,
    clockColor: '#ffffff',
    dateColor: 'rgba(255, 255, 255, 0.88)',
    /** 시계 가독성을 위한 그림자 ('none'으로 끄기) */
    textShadow: '0 1px 16px rgba(15, 44, 94, 0.35)',
    /** 음악 플레이어 배경 — 배경 사진이 더 보이게 하려면 투명도/흐림을 낮추기 */
    player: {
      background: 'rgba(20, 32, 60, 0.3)',
      blur: 30,
    },
    /** 암호 입력 화면 배경 흐림/어두움 */
    passcodeBlur: 28,
    passcodeDim: 0.35,
  },

  /**
   * 휴대폰 Safari 상단(상태바 영역) 색 — Safari는 이 영역을 사진이 아닌 단색으로 칠하므로 화면 맨 위와 같은 색으로 맞춤.
   * 잠금/홈 배경 사진을 바꾸면 lockAndHome도 사진 맨 위 색에 맞춰 주세요.
   */
  browserChrome: {
    lockAndHome: '#1a1a1a',
    apps: { kakaotalk: '#ffffff', photos: '#ffffff', notes: '#ffffff', todo: '#f3f8ff' } as Partial<Record<AppId, string>>,
    appDefault: '#f3f8ff',
  },

  unlock: {
    /** slideUp: 잠금화면이 위로 밀려 올라감 / fade: 서서히 사라짐 / zoom: 확대되며 사라짐 */
    animation: 'slideUp' as UnlockAnimation,
    durationMs: 450,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
}
