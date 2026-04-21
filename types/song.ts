// 偶像大师系列音乐数据库 - 核心类型定义
// source: project-imas.wiki

export interface Idol {
  id: string;
  nameJa: string;
  nameZh: string;
}

export interface Release {
  album: string;
  year: number;
  type: "single" | "album" | "game" | "dlc";
}

export type Series = "765" | "cinderella" | "million" | "shinycolors" | "sidem";

export type PrimaryGenre =
  | "idol-pop"
  | "mature-pop"
  | "rock-energy"
  | "electronic"
  | "jazz-soul"
  | "classical"
  | "wafuu"
  | "stage-drama"
  | "ambient-ballad";

export type SubGenre =
  | "anisong"
  | "synth-pop"
  | "dance"
  | "ballad"
  | "acoustic"
  | "orchestral"
  | "funk"
  | "rnb"
  | "metal"
  | "techno"
  | "house"
  | "trance"
  | "bossa"
  | "swing"
  | "enka"
  | "shamisen"
  | "taiko"
  | "showa"
  | "symphonic"
  | "chamber"
  | "gothic"
  | "piano"
  | "newage"
  | "ambient";

export type Usage =
  | "character"
  | "unit"
  | "event"
  | "theme"
  | "ingame"
  | "cover";

export type IdolAttribute = "cute" | "cool" | "passion" | null;

export interface ExternalLinks {
  youtube?: string;
  niconico?: string;
  spotify?: string;
}

export interface Song {
  id: string;                    // 格式：{series}-{4位序号}
  titleJa: string;
  titleZh: string;
  titleRomaji: string;
  series: Series;
  idols: Idol[];
  unit: string | null;
  isCover: boolean;              // 是否翻唱曲
  originalArtist: string | null; // 翻唱原唱，原创则为 null
  releases: Release[];
  firstYear: number;             // 从 releases 自动推导
  composer: string;
  lyricist: string;
  arranger: string;
  primaryGenre: PrimaryGenre;
  subGenres: SubGenre[];
  usage: Usage;
  idolAttribute: IdolAttribute;
  energy: number;                // 0–10，歌曲能量强度
  valence: number;               // 0–10，情绪正负（0=忧郁，10=明朗）
  hasLiveVersion: boolean;
  crossSeriesIds: string[];      // 跨系列收录时的关联 id
  externalLinks: ExternalLinks;
  tags: string[];                // 自由标签
}

// 用于列表展示的简化歌曲信息
export interface SongSummary {
  id: string;
  titleJa: string;
  titleZh: string;
  series: Series;
  primaryGenre: PrimaryGenre;
  energy: number;
  valence: number;
  isCover: boolean;
  firstYear: number;
}
