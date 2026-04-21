// 偶像大师 - 9大曲风配置
// 颜色方案与整体 warm editorial 设计系统一致

export type GenreType =
  | "idol-pop"
  | "mature-pop"
  | "rock-energy"
  | "electronic"
  | "jazz-soul"
  | "classical"
  | "wafuu"
  | "stage-drama"
  | "ambient-ballad";

export interface GenreConfig {
  key: GenreType;
  nameZh: string;
  description: string;
  boundary: string;
  color: { light: string; dark: string; secondary: string; bg: string; bgDark: string; surface: string; border: string; textOnPrimary: string; };
  font: { display: string; radius: string; };
  representativeSongs: { title: string; series: string; }[];
}

export const genresConfig: Record<GenreType, GenreConfig> = {
  "idol-pop": {
    key: "idol-pop",
    nameZh: "偶像流行",
    description: "正统偶像歌曲",
    boundary: "与成熟流行的边界",
    color: {
      light: "#c96442",
      dark: "#d97757",
      secondary: "#f5e8e2",
      bg: "#faf6f4",
      bgDark: "#1a1210",
      surface: "#fdfbfa",
      border: "#e8ddd6",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "serif", radius: "20px" },
    representativeSongs: [{ title: "READY!!", series: "765AS" }],
  },
  "mature-pop": {
    key: "mature-pop",
    nameZh: "成熟流行",
    description: "成人流行曲风",
    boundary: "与偶像流行的边界",
    color: {
      light: "#8b7355",
      dark: "#a68b6b",
      secondary: "#ebe5dc",
      bg: "#f8f6f4",
      bgDark: "#161210",
      surface: "#fcfbf9",
      border: "#ddd8ce",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "sans-serif", radius: "12px" },
    representativeSongs: [{ title: "KisS", series: "765AS" }],
  },
  "rock-energy": {
    key: "rock-energy",
    nameZh: "摇滚能量",
    description: "高能量摇滚",
    boundary: "与电子的边界",
    color: {
      light: "#b5544a",
      dark: "#c97066",
      secondary: "#f2e2df",
      bg: "#faf5f4",
      bgDark: "#1a100f",
      surface: "#fdfbfa",
      border: "#e8d8d4",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "sans-serif", radius: "4px" },
    representativeSongs: [{ title: "I Want", series: "765AS" }],
  },
  electronic: {
    key: "electronic",
    nameZh: "电子音乐",
    description: "电子音乐",
    boundary: "与摇滚的边界",
    color: {
      light: "#5e8b7e",
      dark: "#7aa898",
      secondary: "#e0ebe6",
      bg: "#f4f8f6",
      bgDark: "#0f1513",
      surface: "#fafcfb",
      border: "#d6e4de",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "monospace", radius: "8px" },
    representativeSongs: [{ title: "Kyun!", series: "765AS" }],
  },
  "jazz-soul": {
    key: "jazz-soul",
    nameZh: "爵士灵魂",
    description: "融合爵士与灵魂",
    boundary: "与古典的边界",
    color: {
      light: "#b89a6a",
      dark: "#d4b88a",
      secondary: "#f2ece0",
      bg: "#faf8f4",
      bgDark: "#16130d",
      surface: "#fdfcfa",
      border: "#e8e0d2",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "serif", radius: "8px" },
    representativeSongs: [{ title: "MEGARE!", series: "765AS" }],
  },
  classical: {
    key: "classical",
    nameZh: "古典交响",
    description: "古典音乐",
    boundary: "与爵士的边界",
    color: {
      light: "#7a6b5a",
      dark: "#948574",
      secondary: "#e8e4de",
      bg: "#f8f7f4",
      bgDark: "#141310",
      surface: "#fcfcfa",
      border: "#dddad4",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "serif", radius: "4px" },
    representativeSongs: [{ title: "Amaterasu", series: "765AS" }],
  },
  wafuu: {
    key: "wafuu",
    nameZh: "和风日式",
    description: "日本传统音乐",
    boundary: "与古典的边界",
    color: {
      light: "#a65d5d",
      dark: "#c07878",
      secondary: "#f0e0e0",
      bg: "#faf5f5",
      bgDark: "#160f0f",
      surface: "#fdfbfb",
      border: "#e8d8d8",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "sans-serif", radius: "8px" },
    representativeSongs: [{ title: "Jibun", series: "765AS" }],
  },
  "stage-drama": {
    key: "stage-drama",
    nameZh: "舞台戏剧",
    description: "音乐剧风格",
    boundary: "与偶像流行的边界",
    color: {
      light: "#9e7d4a",
      dark: "#b89660",
      secondary: "#f0e8d8",
      bg: "#faf8f4",
      bgDark: "#15120d",
      surface: "#fdfcfa",
      border: "#e8ddd0",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "serif", radius: "12px" },
    representativeSongs: [{ title: "edeN", series: "765AS" }],
  },
  "ambient-ballad": {
    key: "ambient-ballad",
    nameZh: "环境歌谣",
    description: "氛围慢板",
    boundary: "与成熟流行的边界",
    color: {
      light: "#6b7a8f",
      dark: "#8a9aad",
      secondary: "#e2e6ec",
      bg: "#f5f6f8",
      bgDark: "#0d1014",
      surface: "#fafbfc",
      border: "#d6dce4",
      textOnPrimary: "#FFFFFF",
    },
    font: { display: "sans-serif", radius: "16px" },
    representativeSongs: [{ title: "Yakusoku", series: "765AS" }],
  },
};

export const getAllGenres = (): GenreConfig[] => Object.values(genresConfig);
export const getGenreConfig = (key: GenreType): GenreConfig => genresConfig[key];
export const getGenreColor = (key: GenreType, isDark: boolean): string => isDark ? genresConfig[key].color.dark : genresConfig[key].color.light;
export const getGenreBackground = (key: GenreType, isDark: boolean): string => isDark ? genresConfig[key].color.bgDark : genresConfig[key].color.bg;
