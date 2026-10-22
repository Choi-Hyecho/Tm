// 홈 화면 크기 단위 — 390px 폭 아이폰 기준 1u = 1%. 화면이 낮으면(SE 등) 높이에 맞춰 전체가 함께 줄어듦
export const HOME_UNIT = 'min(1cqw, 0.4621cqh)'

export const u = (n: number) => `calc(var(--u) * ${n})`
