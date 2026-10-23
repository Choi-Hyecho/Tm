// public/ 기준 경로를 배포 경로(base)에 맞는 URL로 변환 — data:/blob:/http 주소는 그대로 (사용자가 고른 프로필 사진 등)
export function assetUrl(path: string) {
  if (/^(?:data:|blob:|https?:)/.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
