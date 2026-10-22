// 홈 화면 크기 단위 — 화면 폭의 1%. 세로가 아주 짧을 때(SE, 주소창이 있는 Safari 등)만 높이에 맞춰 함께 줄어듦
export const HOME_UNIT = 'min(1cqw, 0.5cqh)'

export const u = (n: number) => `calc(var(--u) * ${n})`
