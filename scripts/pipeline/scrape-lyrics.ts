#!/usr/bin/env tsx
/**
 * Sprint 8.1e — 萌娘百科歌词批量抓取
 *
 * 使用 Playwright 遍历 tracks.json，抓取中文歌词，
 * 输出增量补丁到 data/seed/output/lyrics_patches.json。
 *
 * 支持断点续传：已处理的 track 会跳过，中途 Ctrl+C 后重新运行即可从断点继续。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

// ---------------------------------------------------------------------------
// 路径常量
// ---------------------------------------------------------------------------

const TRACKS_PATH = path.resolve(process.cwd(), 'data', 'tracks.json')
const OUTPUT_DIR = path.resolve(process.cwd(), 'data', 'seed', 'output')
const PATCH_PATH = path.resolve(OUTPUT_DIR, 'lyrics_patches.json')

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

function buildUrls(title: string): string[] {
  const base = 'https://zh.moegirl.org.cn/zh-hans'
  const urls = [`${base}/${encodeURIComponent(title)}`]
  if (!title.endsWith('_(歌曲)')) {
    urls.push(`${base}/${encodeURIComponent(title + '_(歌曲)')}`)
  }
  return urls
}

/** 检测萌娘百科的"页面不存在"提示 */
function isNotFoundPage(content: string): boolean {
  const indicators = [
    '萌娘百科尚未收录该页面',
    '目前没有以此为名的页面',
    '不存在的页面',
    '您要找的页面不存在',
    '页面不存在',
  ]
  return indicators.some((ind) => content.includes(ind))
}

// ---------------------------------------------------------------------------
// 歌词提取
// ---------------------------------------------------------------------------

async function extractLyrics(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    // 策略 1: div.poem（萌娘百科最常见的歌词容器）
    const poems = document.querySelectorAll<HTMLDivElement>('div.poem')
    if (poems.length > 0) {
      const text = Array.from(poems)
        .map((p) => p.innerText.trim())
        .join('\n\n')
      if (text.split('\n').length > 5) return text
    }

    // 策略 2: .Lyrics 或 .lyrics-table
    const lyricsEl = document.querySelector<HTMLElement>('.Lyrics, .lyrics-table')
    if (lyricsEl) {
      const text = lyricsEl.innerText.trim()
      if (text.split('\n').length > 5) return text
    }

    // 策略 3: table.wikitable（有时歌词放在表格中）
    const wikitable = document.querySelector<HTMLElement>('table.wikitable')
    if (wikitable) {
      const text = wikitable.innerText.trim()
      if (text.split('\n').length > 5) return text
    }

    // 策略 4: 在正文区域查找包含大量换行符的最长段落（兜底）
    const content = document.querySelector<HTMLElement>(
      '#mw-content-text .mw-parser-output'
    )
    if (content) {
      const children = content.querySelectorAll<HTMLElement>('p, div')
      let best = ''
      Array.from(children).forEach((child) => {
        const text = child.innerText.trim()
        if (text.length > best.length && text.split('\n').length > 10) {
          best = text
        }
      })
      if (best) return best
    }

    return null
  })
}

// ---------------------------------------------------------------------------
// 单 Track 抓取
// ---------------------------------------------------------------------------

async function scrapeTrack(page: Page, track: TrackInput): Promise<LyricsPatch> {
  const urls = buildUrls(track.titleJa)

  for (const url of urls) {
    try {
      const res = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      })

      // HTTP 403/404 直接跳过
      if (res && (res.status() === 403 || res.status() === 404)) {
        continue
      }

      // 检查页面内容中的"不存在"提示（MediaWiki 通常返回 200 + 提示文本）
      const content = await page.content()
      if (isNotFoundPage(content)) {
        continue
      }

      const lyrics = await extractLyrics(page)
      if (lyrics && lyrics.split('\n').length > 10) {
        return { lyrics: lyrics.trim(), matched: true }
      }

      // 当前 URL 无歌词，继续尝试 fallback URL
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`   ⚠️  访问失败 ${url}: ${msg}`)
      // 页面状态可能已损坏，短暂等待后尝试恢复或继续下一个 URL
      try {
        await page.waitForTimeout(1000)
      } catch {
        // page 已关闭，跳出循环让外层决定是否需要重启浏览器
        return { matched: false }
      }
    }
  }

  return { matched: false }
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
  let consecutiveErrors = 0

  console.log(
    `🎤 共 ${total} 个 Track，已处理 ${processed} 个，待处理 ${total - processed} 个`
  )
  console.log('─'.repeat(60))

  // 启动 Playwright
  const browser: Browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  })

  // 注入脚本移除 webdriver 标记
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })
  })

  const page = await context.newPage()

  // 请求拦截：拦截图片 / CSS / 字体 / 媒体，只放行文档和脚本
  await page.route('**/*', (route) => {
    const type = route.request().resourceType()
    if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
      route.abort()
    } else {
      route.continue()
    }
  })

  // 启动前健康检查：验证 IP 是否被萌娘百科封禁
  console.log('🔍 启动前健康检查...')
  try {
    const healthRes = await page.goto('https://zh.moegirl.org.cn/zh-hans/%E5%88%9D%E9%9F%B3%E6%9C%AA%E6%9D%A5', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
    if (healthRes && healthRes.status() === 403) {
      console.error('❌ 健康检查失败：萌娘百科返回 403（IP 被临时封禁）。')
      console.error('   建议：等待 30–60 分钟后重试，或更换 IP / 使用代理。')
      await browser.close()
      process.exit(1)
    }
    console.log('✅ 健康检查通过，开始批量抓取\n')
  } catch (err) {
    console.error('❌ 健康检查失败：无法连接到萌娘百科。')
    console.error('   建议：检查网络连接，或等待一段时间后重试。')
    await browser.close()
    process.exit(1)
  }

  try {
    for (const track of tracks) {
      if (processedIds.has(track.id)) continue

      processed++
      const label = `[${String(processed).padStart(4)}/${total}]`

      const patch = await scrapeTrack(page, track)
      patches[track.id] = patch
      savePatches(patches)
      processedIds.add(track.id)

      if (patch.matched) {
        matched++
        consecutiveErrors = 0
        const lines = patch.lyrics?.split('\n').length || 0
        console.log(`${label} ✅ ${track.titleJa} (${lines} lines)`)
      } else {
        unmatched++
        consecutiveErrors++
        console.log(`${label} ❌ ${track.titleJa}`)
      }

      // 如果连续大量失败，增加冷却时间，避免触发封控
      const cooldown = consecutiveErrors > 5 ? 8000 : consecutiveErrors > 2 ? 5000 : 2000
      try {
        await page.waitForTimeout(cooldown)
      } catch {
        console.error('\n❌ 浏览器已意外关闭，终止运行。')
        console.error('   可能原因：IP 被临时封禁 / Cloudflare 挑战 / 内存不足。')
        console.error('   建议：等待 30–60 分钟后重新运行，或更换 IP 后重试。')
        break
      }
    }
  } finally {
    await browser.close()
  }

  console.log('─'.repeat(60))
  console.log('🎉 萌娘百科歌词抓取完成')
  console.log(
    `   总计: ${total} | 成功: ${matched} | 未匹配: ${unmatched} | 此前已处理: ${processedIds.size - matched - unmatched}`
  )
  console.log(`   补丁文件: ${PATCH_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
