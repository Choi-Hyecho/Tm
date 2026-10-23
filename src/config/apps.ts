// 홈 화면 앱 설정 — 아이콘 파일은 public/images/icons/<id>.png 로 넣으면 바로 적용됩니다.
// 파일이 없으면 앱 이름 글자로 된 임시 아이콘을 표시합니다 (공식 로고를 흉내 내지 않음).
import { albumLinks, links } from './links'

export type AppId =
  | 'kakaotalk'
  | 'todo'
  | 'photos'
  | 'files'
  | 'melon'
  | 'genie'
  | 'spotify'
  | 'appleMusic'
  | 'youtubeMusic'
  | 'bugs'
  | 'youtube'
  | 'x'
  | 'safari'
  | 'calendar'
  | 'clock'
  | 'instagram'
  | 'notes'
  | 'duolingo'
  | 'bstage'
  | 'settings'

export type AppOpen =
  /** 게임 속 앱 화면 */
  | { type: 'internal' }
  /** 외부 링크 (새 탭) */
  | { type: 'external'; link: string }
  /** 듀오링고 쇼츠 — 방문 상태를 위젯과 공유 */
  | { type: 'duolingo' }

export interface AppDef {
  id: AppId
  name: string
  /** 공식 아이콘 경로 (public/ 기준). 빈 문자열이면 builtinIcon 또는 임시 아이콘 사용 */
  icon: string
  /** 게임 자체 아이콘 — calendar: iOS처럼 게임 날짜 표시 / todo: 게임 전용 앱 */
  builtinIcon?: 'calendar' | 'todo'
  /** 임시 아이콘 (배경, 글자색, 표시 글자) */
  placeholder: { background: string; color: string; text: string }
  open: AppOpen
}

const icon = (id: AppId) => `images/icons/${id}.png`

export const apps: Record<AppId, AppDef> = {
  kakaotalk: {
    id: 'kakaotalk',
    name: '카카오톡',
    icon: icon('kakaotalk'),
    placeholder: { background: '#fee500', color: '#3c1e1e', text: '카톡' },
    open: { type: 'internal' },
  },
  todo: {
    id: 'todo',
    name: 'TODO',
    icon: '',
    builtinIcon: 'todo',
    placeholder: { background: '#3b86f5', color: '#ffffff', text: 'TODO' },
    open: { type: 'internal' },
  },
  photos: {
    id: 'photos',
    name: '사진',
    icon: icon('photos'),
    placeholder: { background: '#ffffff', color: '#3b86f5', text: '사진' },
    open: { type: 'internal' },
  },
  files: {
    id: 'files',
    name: '파일',
    icon: icon('files'),
    placeholder: { background: '#ffffff', color: '#1a7cf5', text: '파일' },
    open: { type: 'internal' },
  },
  melon: {
    id: 'melon',
    name: '멜론',
    icon: icon('melon'),
    placeholder: { background: '#00cd3c', color: '#ffffff', text: 'Melon' },
    open: { type: 'external', link: albumLinks.melon },
  },
  genie: {
    id: 'genie',
    name: '지니',
    icon: icon('genie'),
    placeholder: { background: '#ffffff', color: '#1f6bff', text: 'genie' },
    open: { type: 'external', link: albumLinks.genie },
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    icon: icon('spotify'),
    placeholder: { background: '#191414', color: '#1ed760', text: 'Spotify' },
    open: { type: 'external', link: albumLinks.spotify },
  },
  appleMusic: {
    id: 'appleMusic',
    name: 'Apple Music',
    icon: icon('appleMusic'),
    placeholder: { background: 'linear-gradient(180deg, #fb5c74, #fa233b)', color: '#ffffff', text: 'Music' },
    open: { type: 'external', link: albumLinks.appleMusic },
  },
  youtubeMusic: {
    id: 'youtubeMusic',
    name: 'YouTube Music',
    icon: icon('youtubeMusic'),
    placeholder: { background: '#212121', color: '#ff3b3b', text: 'YT Music' },
    open: { type: 'external', link: albumLinks.youtubeMusic },
  },
  bugs: {
    id: 'bugs',
    name: '벅스',
    icon: icon('bugs'),
    placeholder: { background: '#ff4a26', color: '#ffffff', text: 'Bugs' },
    open: { type: 'external', link: albumLinks.bugs },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: icon('youtube'),
    placeholder: { background: '#ffffff', color: '#ff0000', text: 'YouTube' },
    open: { type: 'external', link: links.youtube },
  },
  x: {
    id: 'x',
    name: 'X',
    icon: icon('x'),
    placeholder: { background: '#000000', color: '#ffffff', text: 'X' },
    open: { type: 'external', link: links.x },
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    icon: icon('safari'),
    placeholder: { background: '#ffffff', color: '#1a7cf5', text: 'Safari' },
    open: { type: 'external', link: links.safari },
  },
  calendar: {
    id: 'calendar',
    name: '캘린더',
    icon: '',
    builtinIcon: 'calendar',
    placeholder: { background: '#ffffff', color: '#ff3b30', text: '캘린더' },
    open: { type: 'internal' },
  },
  clock: {
    id: 'clock',
    name: '시계',
    icon: icon('clock'),
    placeholder: { background: '#000000', color: '#ffffff', text: '시계' },
    open: { type: 'internal' },
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: icon('instagram'),
    placeholder: { background: 'linear-gradient(45deg, #feda75, #d62976, #4f5bd5)', color: '#ffffff', text: 'Insta' },
    open: { type: 'external', link: links.instagram },
  },
  notes: {
    id: 'notes',
    name: '메모',
    icon: icon('notes'),
    placeholder: { background: 'linear-gradient(180deg, #ffd60a 0 24%, #ffffff 24%)', color: '#6b5a00', text: '메모' },
    open: { type: 'internal' },
  },
  duolingo: {
    id: 'duolingo',
    name: 'Duolingo',
    icon: icon('duolingo'),
    placeholder: { background: '#58cc02', color: '#ffffff', text: 'Duo' },
    open: { type: 'duolingo' },
  },
  bstage: {
    id: 'bstage',
    name: 'b.stage',
    icon: icon('bstage'),
    placeholder: { background: '#ffffff', color: '#000000', text: 'b.stage' },
    open: { type: 'external', link: links.bstage },
  },
  settings: {
    id: 'settings',
    name: '설정',
    // Apple 설정 아이콘 (Wikimedia Commons 'Settings (iOS).png', 퍼블릭 도메인 표기) — 여백을 잘라 256px로
    icon: icon('settings'),
    placeholder: { background: '#8e8e93', color: '#ffffff', text: '설정' },
    open: { type: 'internal' },
  },
}

/** 홈 화면 아이콘 순서 (위젯 아래, 4열) */
export const homeLayout: AppId[] = [
  'melon',
  'genie',
  'spotify',
  'appleMusic',
  'youtubeMusic',
  'bugs',
  'youtube',
  'x',
  'safari',
  'calendar',
  'clock',
  'instagram',
  'notes',
  'duolingo',
  'bstage',
  'settings',
]

/** 하단 Dock 고정 앱 */
export const dockApps: AppId[] = ['kakaotalk', 'todo', 'photos', 'files']
