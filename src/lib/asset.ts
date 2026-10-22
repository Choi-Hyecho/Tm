// public/ 기준 경로를 배포 경로(base)에 맞는 URL로 변환
export function assetUrl(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
