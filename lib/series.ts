import type { SeriesConfig } from '@/types'

export const SERIES_CONFIG: SeriesConfig[] = [
  {
    id: '765',
    nameJa: '765PRO ALLSTARS',
    nameZh: '765 艺能事务所',
    nameEn: '765PRO ALLSTARS',
    brandColor: '#F34F6D',
    icon: 'Star',
  },
  {
    id: 'cinderella',
    nameJa: 'Cinderella Girls',
    nameZh: '灰姑娘女孩',
    nameEn: 'THE IDOLM@STER Cinderella Girls',
    brandColor: '#2681C8',
    icon: 'Sparkles',
  },
  {
    id: 'million',
    nameJa: 'Million Live!',
    nameZh: '百万现场',
    nameEn: 'THE IDOLM@STER Million Live!',
    brandColor: '#FFC30B',
    icon: 'Music',
  },
  {
    id: 'sidem',
    nameJa: 'SideM',
    nameZh: '偶像大师 SideM',
    nameEn: 'THE IDOLM@STER SideM',
    brandColor: '#0FBE94',
    icon: 'Users',
  },
  {
    id: 'shinycolors',
    nameJa: 'Shiny Colors',
    nameZh: '闪耀色彩',
    nameEn: 'THE IDOLM@STER Shiny Colors',
    brandColor: '#8DBBFF',
    icon: 'Diamond',
  },
  {
    id: 'gakuen',
    nameJa: '学园偶像大师',
    nameZh: '学园偶像大师',
    nameEn: 'Gakuen iDOLM@STER',
    brandColor: '#FF7F27',
    icon: 'GraduationCap',
  },
]

export const SERIES_MAP = Object.fromEntries(
  SERIES_CONFIG.map((s) => [s.id, s])
) as Record<string, SeriesConfig>
