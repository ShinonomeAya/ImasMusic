/**
 * iTunes Search API 封装
 * 用于获取专辑封面、30秒试听、基础元数据
 * Rate Limit: 约 20 req/min (建议实际使用时加延迟)
 *
 * @see https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
 */

const ITUNES_BASE = 'https://itunes.apple.com/search'

export interface ItunesResult {
  trackId?: number
  collectionId?: number
  trackName?: string
  collectionName?: string
  artistName?: string
  artworkUrl30?: string
  artworkUrl60?: string
  artworkUrl100?: string
  artworkUrl600?: string // 最大尺寸
  previewUrl?: string
  trackTimeMillis?: number
  releaseDate?: string // ISO 8601
  primaryGenreName?: string
  trackNumber?: number
  trackCount?: number
  country?: string
}

export interface ItunesSearchResponse {
  resultCount: number
  results: ItunesResult[]
}

export interface ItunesSearchOptions {
  term: string
  entity?: 'song' | 'album' | 'musicArtist'
  country?: string // default: jp
  limit?: number // default: 10
  lang?: string // default: ja_jp
}

/**
 * 搜索 iTunes Store
 */
export async function searchItunes(
  options: ItunesSearchOptions
): Promise<ItunesSearchResponse> {
  const params = new URLSearchParams({
    term: options.term,
    media: 'music',
    entity: options.entity || 'song',
    country: options.country || 'jp',
    limit: String(options.limit || 10),
    lang: options.lang || 'ja_jp',
  })

  const url = `${ITUNES_BASE}?${params.toString()}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // 缓存 24h
  })

  if (!res.ok) {
    throw new Error(`iTunes API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/**
 * 获取高清封面 URL
 * iTunes artwork URL 可以通过替换尺寸参数获取任意大小
 */
export function getHighResArtwork(
  url: string | undefined,
  size: number = 600
): string | undefined {
  if (!url) return undefined
  // iTunes URL pattern: .../image.jpg 或 .../image.{w}x{h}bb.jpg
  return url
    .replace(/\.\d+x\d+bb\.jpg$/, `.${size}x${size}bb.jpg`)
    .replace(/\/\d+x\d+bb\//, `/${size}x${size}bb/`)
}

/**
 * 获取最佳匹配结果
 * 当有多条结果时，优先选择 trackName 与查询词最接近的
 */
export function pickBestMatch(
  results: ItunesResult[],
  query: string
): ItunesResult | undefined {
  if (results.length === 0) return undefined
  if (results.length === 1) return results[0]

  const normalizedQuery = normalize(query)

  // 按相似度排序：trackName 与查询词的匹配度
  const scored = results.map((r) => {
    const name = normalize(r.trackName || r.collectionName || '')
    let score = 0
    if (name === normalizedQuery) score += 100
    if (name.includes(normalizedQuery)) score += 50
    if (normalizedQuery.includes(name)) score += 30
    // Jaccard 简单近似
    const common = [...name].filter((c) => normalizedQuery.includes(c)).length
    score += common * 2
    return { result: r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].result
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s\-–—]+/g, '')
    .replace(/[!?！？.．。,、]/g, '')
}

/**
 * 将 iTunes 结果转换为我们的 Track 数据（部分字段）
 */
export function itunesResultToPartialTrack(
  result: ItunesResult,
  series: string,
  trackNumber: number = 1
) {
  return {
    id: `track-${result.trackId || result.collectionId}`,
    titleJa: result.trackName || result.collectionName || 'Unknown',
    releaseId: `release-${result.collectionId}`,
    artistIds: result.artistName ? [result.artistName] : [],
    credits: [] as { artistId: string; role: 'VOCALS' | 'COMPOSER' | 'LYRICIST' | 'ARRANGER' }[],
    trackNumber,
    durationSec: result.trackTimeMillis ? Math.round(result.trackTimeMillis / 1000) : undefined,
    previewUrl: result.previewUrl,
    bpm: undefined as number | undefined,
    energy: undefined as number | undefined,
    valence: undefined as number | undefined,
    key: undefined as number | undefined,
    mode: undefined as number | undefined,
  }
}

/**
 * 将 iTunes 结果转换为我们的 Release 数据（部分字段）
 */
export function itunesResultToPartialRelease(
  result: ItunesResult,
  series: string
) {
  const year = result.releaseDate
    ? new Date(result.releaseDate).getFullYear()
    : undefined

  return {
    id: `release-${result.collectionId}`,
    type: 'ALBUM' as const,
    titleJa: result.collectionName || 'Unknown',
    series: series as any,
    releaseDate: result.releaseDate,
    coverUrl: getHighResArtwork(result.artworkUrl100 || result.artworkUrl60),
    trackIds: [] as string[],
    catalogNumber: undefined as string | undefined,
    label: undefined as string | undefined,
    format: 'CD' as string | undefined,
    appleMusicUrl: result.collectionId
      ? `https://music.apple.com/jp/album/${result.collectionId}`
      : undefined,
  }
}
