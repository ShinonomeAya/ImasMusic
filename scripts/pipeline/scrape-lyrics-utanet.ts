#!/usr/bin/env tsx
/**
 * Sprint 8.1e-alt — Uta-Net 歌词批量抓取
 *
 * 使用 Node.js 原生 fetch + cheerio 遍历 tracks.json，
 * 抓取日文歌词，输出增量补丁到 data/seed/output/lyrics_patches.json。
 *
 * 支持断点续传：已处理的 track 会跳过，中途 Ctrl+C 后重新运行即可从断点继续。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as cheerio from 'cheerio'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const TRACKS_PATH = path.resolve(process.cwd(), 'data', 'tracks.json')
const OUTPUT_DIR = path.resolve(process.cwd(), 'data', 'seed', 'output')
const PATCH_PATH = path.resolve(OUTPUT_DIR, 'lyrics_patches.json')

const USER_AGENT =
  'iMASArchiveBot/0.4.0 (Contact: https://github.com/yourusername/imas-archive)'

const IMAS_KEYWORDS = [
  '765',
  'アイドルマスター',
  'THE IDOLM@STER',
  'ミリオン',
  'シンデレラ',
  'SideM',
  'シャイニーカラーズ',
  '学園',
  'Gakuen',
  'Cinderella',
  'Million',
]

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

interface TrackInput {
  id: string
  titleJa: string
  [key: string]: unknown
}

interface LyricsPatch {
  lyrics?: string
  source?: string
  matched: boolean
}

type PatchMap = Record<string, LyricsPatch>

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadTracks(): TrackInput[] {
  const raw = fs.readFileSync(TRACKS_PATH, 'utf-8')
  return JSON.parse(raw) as TrackInput[]
}

function loadExistingPatches(): PatchMap {
  if (!fs.existsSync(PATCH_PATH)) {
    return {}
  }
  const raw = fs.readFileSync(PATCH_PATH, 'utf-8')
  try {
    return JSON.parse(raw) as PatchMap
  } catch {
    console.error('⚠️  歌词补丁文件 JSON 损坏，将重新开始。')
    return {}
  }
}

function savePatches(patches: PatchMap): void {
  fs.writeFileSync(PATCH_PATH, JSON.stringify(patches, null, 2), 'utf-8')
}

function isImasRelated(rowText: string): boolean {
  return IMAS_KEYWORDS.some((kw) => rowText.includes(kw))
}

// ---------------------------------------------------------------------------
// Uta-Net 抓取逻辑
// ---------------------------------------------------------------------------

/**
 * Step 1: 搜索歌曲，返回歌曲详情页路径（如 /song/158899/）。
 */
async function searchSong(title: string): Promise<string | null> {
  const url = `https://www.uta-net.com/search/?keyword=${encodeURIComponent(title)}&target=title`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) {
    throw new Error(`Uta-Net search HTTP ${res.status}: ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  // 获取所有歌曲链接
  const links = $('a[href^="/song/"]')
  if (links.length === 0) {
    return null
  }

  // 优先找包含 iM@S 关键字的行，否则取第一条
  let bestHref: string | undefined
  links.each((_, el) => {
    if (bestHref) return false // 已找到，停止遍历
    const href = $(el).attr('href')
    if (!href) return
    const rowText = $(el).closest('tr').text()
    if (isImasRelated(rowText)) {
      bestHref = href
    }
  })

  // 如果没有匹配到 iM@S 关键字，fallback 到第一条
  if (!bestHref) {
    bestHref = links.first().attr('href')
  }

  return bestHref || null
}

/**
 * Step 2: 从歌曲详情页提取歌词。
 *
 * 关键技巧：
 *   1. 获取 #kashi_area 的原始 HTML（包含 <br> 换行）。
 *   2. 用正则 `/g` 全局将 `<br>` / `<br/>` 替换为 `\n`。
 *   3. 用 cheerio 重新解析替换后的 HTML，提取纯文本。
 *   这样歌词会保持正确的换行格式，不会黏成一长串。
 */
async function fetchLyrics(songPath: string): Promise<string | null> {
  const url = `https://www.uta-net.com${songPath}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) {
    throw new Error(`Uta-Net song HTTP ${res.status}: ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const kashi = $('#kashi_area')

  if (kashi.length === 0) {
    return null
  }

  const rawHtml = kashi.html() || ''
  const withNewlines = rawHtml.replace(/<br\s*\/?>/gi, '\n')
  const text = cheerio.load(withNewlines).text().trim()

  return text.length > 0 ? text : null
}

/**
 * 单 Track 抓取入口。
 */
async function scrapeTrack(title: string): Promise<LyricsPatch> {
  const songPath = await searchSong(title)
  if (!songPath) {
    return { matched: false }
  }

  await sleep(1500) // 搜索 → 详情页之间礼貌等待

  const lyrics = await fetchLyrics(songPath)
  if (!lyrics) {
    return { matched: false }
  }

  return { lyrics, source: 'utanet', matched: true }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  ensureDir(OUTPUT_DIR)

  const tracks = loadTracks()
  const patches = loadExistingPatches()
  const processedIds = new Set(Object.keys(patches))

  const total = tracks.length
  let processed = processedIds.size
  let matched = 0
  let unmatched = 0

  console.log(
    `🎤 Uta-Net 歌词抓取 | 共 ${total} 个 Track，已处理 ${processed} 个，待处理 ${total - processed} 个`
  )
  console.log('─'.repeat(60))

  for (const track of tracks) {
    if (processedIds.has(track.id)) continue

    processed++
    const label = `[${String(processed).padStart(4)}/${total}]`

    let patch: LyricsPatch
    try {
      patch = await scrapeTrack(track.titleJa)

      if (patch.matched) {
        matched++
        const lines = patch.lyrics?.split('\n').length || 0
        console.log(`${label} ✅ ${track.titleJa} (${lines} lines)`)
      } else {
        unmatched++
        console.log(`${label} ❌ ${track.titleJa}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      patch = { matched: false }
      unmatched++
      console.log(`${label} ⚠️  Error (${msg}), skipped: ${track.titleJa}`)
    }

    // 实时增量写入
    patches[track.id] = patch
    savePatches(patches)
    processedIds.add(track.id)

    // 每首歌之间礼貌等待 1.5 秒
    await sleep(1500)
  }

  console.log('─'.repeat(60))
  console.log('🎉 Uta-Net 歌词抓取完成')
  console.log(
    `   总计: ${total} | 成功: ${matched} | 未匹配: ${unmatched} | 此前已处理: ${processedIds.size - matched - unmatched}`
  )
  console.log(`   补丁文件: ${PATCH_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
