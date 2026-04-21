// 偶像大师各系列配置

import { Series } from "@/types/song";

export interface SeriesConfig {
  id: Series;
  nameJa: string;
  nameZh: string;
  nameEn: string;
  shortName: string;
  color: {
    light: string;
    dark: string;
    accent: string;
  };
  description: string;
  yearStarted: number;
  totalIdols: number;
  logoUrl?: string;
  aliases: string[];
}

export const seriesConfig: Record<Series, SeriesConfig> = {
  "765": {
    id: "765",
    nameJa: "THE IDOLM@STER",
    nameZh: "偶像大师 765",
    nameEn: "THE IDOLM@STER",
    shortName: "765AS",
    color: {
      light: "#FF6B35",
      dark: "#FF8F6B",
      accent: "#FFE4DC",
    },
    description:
      "2005年诞生的偶像大师原作系列。以765 Production（简称765Pro）的13位偶像为核心，涵盖了游戏、动画、音乐等多个媒体形式的经典偶像企划。",
    yearStarted: 2005,
    totalIdols: 13,
    aliases: ["本家", "765Pro", "AS"],
  },
  cinderella: {
    id: "cinderella",
    nameJa: "アイドルマスター シンデレラガールズ",
    nameZh: "偶像大师 灰姑娘女孩",
    nameEn: "THE IDOLM@STER CINDERELLA GIRLS",
    shortName: "CG",
    color: {
      light: "#00A0E9",
      dark: "#4DC4FF",
      accent: "#DCF4FF",
    },
    description:
      "2011年开始的社交游戏系列，以346 Production为舞台，拥有超过180位个性丰富的偶像角色。以「灰姑娘」为概念，讲述从平凡到闪耀的成长故事。",
    yearStarted: 2011,
    totalIdols: 180,
    aliases: ["CGSS", "灰姑娘", "346"],
  },
  million: {
    id: "million",
    nameJa: "アイドルマスター ミリオンライブ！",
    nameZh: "偶像大师 百万现场！",
    nameEn: "THE IDOLM@STER MILLION LIVE!",
    shortName: "ML",
    color: {
      light: "#FFC30B",
      dark: "#FFD966",
      accent: "#FFF4D6",
    },
    description:
      "2013年开始的游戏系列，以765Pro的剧场（THEATER）为舞台，新增了39位新偶像（统称「百万」），与原作13人共同组成52人的大家庭。",
    yearStarted: 2013,
    totalIdols: 52,
    aliases: ["百万", "MLTD", "Theater Days"],
  },
  shinycolors: {
    id: "shinycolors",
    nameJa: "アイドルマスター シャイニーカラーズ",
    nameZh: "偶像大师 闪耀色彩",
    nameEn: "THE IDOLM@STER SHINY COLORS",
    shortName: "SC",
    color: {
      light: "#8E6BC9",
      dark: "#B8A0E0",
      accent: "#EDE8F7",
    },
    description:
      "2018年开始的网页游戏系列，以283 Production为舞台，采用全新的世界观和偶像阵容。以「培养偶像」为核心玩法，拥有独特的组合系统和故事风格。",
    yearStarted: 2018,
    totalIdols: 28,
    aliases: ["闪耀色彩", "283", "SC"],
  },
  sidem: {
    id: "sidem",
    nameJa: "アイドルマスター SideM",
    nameZh: "偶像大师 SideM",
    nameEn: "THE IDOLM@STER SideM",
    shortName: "SM",
    color: {
      light: "#00B2B2",
      dark: "#4DD9D9",
      accent: "#D6F4F4",
    },
    description:
      "2014年开始的男性偶像系列，以315 Production为舞台，专注于男性偶像的成长故事。涵盖多种职业背景的角色，如医生、律师、前飞行员等。",
    yearStarted: 2014,
    totalIdols: 46,
    aliases: ["SideM", "315", "男性向"],
  },
};

// 获取所有系列
export const getAllSeries = (): SeriesConfig[] => {
  return Object.values(seriesConfig);
};

// 获取单个系列配置
export const getSeriesConfig = (id: Series): SeriesConfig => {
  return seriesConfig[id];
};

// 获取系列颜色
export const getSeriesColor = (id: Series, isDark: boolean): string => {
  return isDark ? seriesConfig[id].color.dark : seriesConfig[id].color.light;
};
