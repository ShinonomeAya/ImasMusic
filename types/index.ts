// ============================================================
// 核心数据模型 —— ImasMusic Rebuilt
// ============================================================

/** 企划品牌色映射 */
export type SeriesBrand =
  | '765'
  | 'cinderella'
  | 'million'
  | 'sidem'
  | 'shinycolors'
  | 'gakuen'

/** 发行物类型 */
export type ReleaseType = 'SINGLE' | 'ALBUM' | 'COMPILATION' | 'EP'

/** 艺人角色类型 */
export type ArtistRole = 'IDOL' | 'UNIT' | 'CV' | 'CREATOR'

/** 创作者细分角色 */
export type CreditRole = 'VOCALS' | 'COMPOSER' | 'LYRICIST' | 'ARRANGER'

/** 音调 (Spotify API 标准) */
export type MusicalKey =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
// 0=C, 1=C#, 2=D, ..., 11=B

/** 大小调 (Spotify API 标准) */
export type MusicalMode = 0 | 1 // 0=minor, 1=major

/** 曲目 (Track) —— 单曲级别的原子数据 */
export interface Track {
  id: string
  /** 日文标题 (主要展示) */
  titleJa: string
  /** 中文标题 */
  titleZh?: string
  /** 罗马音标题 */
  titleRomaji?: string
  /** 所属发行物 ID */
  releaseId: string
  /** 演唱者 (艺人 ID 列表) */
  artistIds: string[]
  /** 创作者 Credits */
  credits: TrackCredit[]
  /** 音轨序号 */
  trackNumber: number
  /** 时长 (秒) */
  durationSec?: number
  /** BPM (Spotify API: tempo) */
  bpm?: number
  /** 能量值 0.0-1.0 (Spotify API: energy) */
  energy?: number
  /** 情感值 0.0-1.0 (Spotify API: valence) */
  valence?: number
  /** 音调 (Spotify API: key) */
  key?: MusicalKey
  /** 大小调 (Spotify API: mode) */
  mode?: MusicalMode
  /** iTunes 30秒试听 URL */
  previewUrl?: string
  /** Spotify 曲目 ID (用于外链) */
  spotifyId?: string
  /** 歌词 */
  lyrics?: string
}

/** 曲目创作者 Credit */
export interface TrackCredit {
  artistId: string
  role: CreditRole
}

/** 发行物 (Release) —— 专辑/单曲/合集 */
export interface Release {
  id: string
  /** 发行物类型 */
  type: ReleaseType
  /** 日文标题 */
  titleJa: string
  /** 中文标题 */
  titleZh?: string
  /** 罗马音标题 */
  titleRomaji?: string
  /** 所属企划 */
  series: SeriesBrand
  /** 发行日期 (ISO 8601) */
  releaseDate?: string
  /** 封面图 URL (iTunes/Apple Music CDN) */
  coverUrl?: string
  /** 封面主色 (提取值) */
  dominantColor?: string
  /** 收录曲目 */
  trackIds: string[]
  /** Catalog Number */
  catalogNumber?: string
  /** 唱片公司 */
  label?: string
  /** 格式 (CD/BD/Digital) */
  format?: string
  /** 该 Master Release 的其他版本 */
  versionIds?: string[]
  /** Apple Music / iTunes 链接 */
  appleMusicUrl?: string
  /** Spotify 链接 */
  spotifyUrl?: string
}

/** 艺人 (Artist) —— 统一实体：偶像/小队/声优/创作者 */
export interface Artist {
  id: string
  /** 日文名称 */
  nameJa: string
  /** 中文/英文名称 */
  nameEn?: string
  /** 角色类型 */
  role: ArtistRole
  /** 所属企划 (可选，部分创作者跨企划) */
  series?: SeriesBrand[]
  /** 头像/肖像 URL */
  portraitUrl?: string
  /** 简介 */
  bio?: string
  /** 关联曲目 ID */
  trackIds?: string[]
  /** 关联发行物 ID */
  releaseIds?: string[]
  /** 如果是偶像：关联声优 ID */
  cvId?: string
  /** 如果是声优：关联角色 ID 列表 */
  characterIds?: string[]
}

/** 播放状态 */
export interface PlayerState {
  /** 当前播放曲目 */
  currentTrack: Track | null
  /** 是否正在播放 */
  isPlaying: boolean
  /** 当前进度 (秒) */
  currentTime: number
  /** 音量 0-1 */
  volume: number
  /** 播放队列 */
  queue: Track[]
  /** 队列当前索引 */
  queueIndex: number
  /** 播放器视图状态 */
  view: 'HIDDEN' | 'MINI' | 'EXPANDED'
}

/** 导航路由项 */
export interface NavItem {
  label: string
  href: string
  icon?: string
  active?: boolean
}

/** 企划配置 */
export interface SeriesConfig {
  id: SeriesBrand
  nameJa: string
  nameZh: string
  nameEn: string
  brandColor: string
  icon: string
}
