/**
 * MusicBrainz API 客户端 — Sprint 8.1a
 *
 * 职责：底层 JSON API 封装，提供 Release / Recording 两级搜索与详情获取。
 * 约束：全局速率限制 1 req/sec、503/网络错误自动重试、严格 User-Agent。
 *
 * 注意：getReleaseDetails 的 `inc` 参数中使用 `labels`（而非 `label-rels`），
 * 因为 `labels` 才是返回 `label-info`（含 catalog-number）的正确 inc 参数。
 */

const MB_BASE = 'https://musicbrainz.org/ws/2'
const USER_AGENT =
  'iMASArchive/0.4.0 ( https://github.com/yourusername/imas-archive )'
const RATE_LIMIT_MS = 1100
const MAX_RETRIES = 3

// ---------------------------------------------------------------------------
// 内部工具
// ---------------------------------------------------------------------------

let lastRequestTime = 0

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 确保任意两次请求间隔 ≥ 1100 ms，实现全局 1 req/sec */
async function rateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed)
  }
  lastRequestTime = Date.now()
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof TypeError) {
    // Node.js fetch 网络层错误（DNS、ECONNRESET、超时等）
    return true
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('econnreset') ||
      msg.includes('timeout') ||
      msg.includes('etimedout')
    )
  }
  return false
}

/**
 * 带速率限制与重试的底层 fetch 包装器。
 *
 * 速率限制：模块级 `lastRequestTime`，保证顺序调用时全局 1 req/sec。
 * 重试策略：503 或网络异常时最多 3 次，每次等待 2–3 秒（随机抖动避免共振）。
 */
async function mbFetch<T>(url: string, attempt = 1): Promise<T> {
  await rateLimit()

  let response: Response | undefined

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    if (isRetryableError(err) && attempt <= MAX_RETRIES) {
      const delay = 2000 + Math.random() * 1000
      await sleep(delay)
      return mbFetch(url, attempt + 1)
    }
    throw err
  }

  if (response.status === 503 && attempt <= MAX_RETRIES) {
    const delay = 2000 + Math.random() * 1000
    await sleep(delay)
    return mbFetch(url, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(
      `MusicBrainz HTTP ${response.status}: ${response.statusText} → ${url}`
    )
  }

  const data = (await response.json()) as T
  return data
}

// ---------------------------------------------------------------------------
// 类型定义（Partial，仅覆盖本模块使用到的字段）
// ---------------------------------------------------------------------------

export interface MBLabelInfo {
  'catalog-number'?: string
  label?: {
    id: string
    name: string
  }
}

export interface MBArtistCredit {
  name: string
  artist?: {
    id: string
    name: string
  }
  joinphrase?: string
}

/**
 * 用于解析作词 / 作曲 / 编曲等角色。
 * MusicBrainz Recording / Work 返回的是扁平化的 `relations` 数组，
 * 每个元素通过 `target-type` 区分是 artist 还是 work 关系。
 */
export interface MBRelation {
  type: string // e.g. "composer", "lyricist", "arranger", "performance"
  'target-type'?: 'artist' | 'work'
  direction?: string // e.g. "backward"
  artist?: {
    id: string
    name: string
    'sort-name'?: string
  }
  work?: {
    id: string
    title: string
  }
}

export interface MBRecording {
  id: string
  title: string
  length?: number // ms
  disambiguation?: string
  'artist-credit'?: MBArtistCredit[]
  /** Recording 级别的关系（arranger 等）以及关联的 Work */
  relations?: MBRelation[]
}

export interface MBRelease {
  id: string
  title: string
  date?: string // ISO-8601
  country?: string
  barcode?: string
  disambiguation?: string
  'track-count'?: number
  'artist-credit'?: MBArtistCredit[]
  'label-info'?: MBLabelInfo[]
  relations?: MBRelation[]
  'release-events'?: Array<{
    date: string
    area?: { name: string }
  }>
  media?: Array<{
    position: number
    format?: string
    'track-count'?: number
    tracks?: Array<{
      id: string
      title: string
      number: string
      length?: number
      recording?: MBRecording
    }>
  }>
}

export interface MBWork {
  id: string
  title: string
  relations?: MBRelation[]
}

export interface MBReleaseList {
  releases: MBRelease[]
  count: number
  offset: number
}

export interface MBRecordingList {
  recordings: MBRecording[]
  count: number
  offset: number
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 搜索 Release（专辑）。
 * 适用场景：通过专辑名称或 Catalog Number（如 COCC-17981）查找对应发行。
 */
export async function searchRelease(
  query: string,
  limit = 10
): Promise<MBReleaseList> {
  const url = `${MB_BASE}/release?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`
  return mbFetch<MBReleaseList>(url)
}

/**
 * 获取 Release 详情（含 Tracks、Credits、Label、Catalog Number）。
 * inc 说明：
 *   - artist-credits : 发行艺术家信息
 *   - recordings     : 媒体音轨（track → recording）
 *   - labels         : label-info（catalog-number、唱片公司）
 *   - work-rels      : 作品关系
 *   - artist-rels    : 艺术家关系（composer / lyricist / arranger）
 */
export async function getReleaseDetails(mbid: string): Promise<MBRelease> {
  const inc = 'artist-credits+recordings+labels+work-rels+artist-rels'
  const url = `${MB_BASE}/release/${encodeURIComponent(mbid)}?inc=${inc}&fmt=json`
  return mbFetch<MBRelease>(url)
}

/**
 * 搜索 Recording（单曲/音轨）。
 * 适用场景：按单曲名搜索，用于 Recording-level 的精确 Credit 匹配。
 */
export async function searchRecording(
  query: string,
  limit = 10
): Promise<MBRecordingList> {
  const url = `${MB_BASE}/recording?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`
  return mbFetch<MBRecordingList>(url)
}

/**
 * 获取 Recording 详情（精确到单曲轨道的作词、作曲、编曲）。
 */
export async function getRecordingDetails(mbid: string): Promise<MBRecording> {
  const inc = 'artist-credits+work-rels+artist-rels'
  const url = `${MB_BASE}/recording/${encodeURIComponent(mbid)}?inc=${inc}&fmt=json`
  return mbFetch<MBRecording>(url)
}

/**
 * 获取 Work 详情（用于提取 lyricist / composer）。
 * Work 与 Recording 通过 `relations` 中的 performance 类型关联。
 */
export async function getWorkDetails(mbid: string): Promise<MBWork> {
  const inc = 'artist-rels'
  const url = `${MB_BASE}/work/${encodeURIComponent(mbid)}?inc=${inc}&fmt=json`
  return mbFetch<MBWork>(url)
}
