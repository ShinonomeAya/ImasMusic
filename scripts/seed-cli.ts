#!/usr/bin/env tsx
/**
 * iM@S Archive — 数据导入脚手架 CLI
 *
 * 用法:
 *   npx tsx scripts/seed-cli.ts --input data/seed/input/765-tracks.txt --series 765 --type track
 *   npx tsx scripts/seed-cli.ts --input data/seed/input/sc-albums.txt --series shinycolors --type album
 *
 * 参数:
 *   --input    输入文件路径 (每行一个查询词)
 *   --series   企划 ID (765|cinderella|million|sidem|shinycolors|gakuen)
 *   --type     搜索类型 (track|album) 默认: track
 *   --output   输出目录 默认: data/seed/output/
 *   --delay    请求间隔(ms) 默认: 1500 (避免触发 iTunes rate limit)
 *   --limit    每词返回结果数 默认: 5
 */

import fs from 'fs/promises'
import path from 'path'
import { searchItunes, pickBestMatch, itunesResultToPartialTrack, itunesResultToPartialRelease, getHighResArtwork } from '../lib/api/itunes'
import type { Track, Release } from '../types'

interface CliOptions {
  input: string
  series: string
  type: 'track' | 'album'
  output: string
  delay: number
  limit: number
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const get = (flag: string, def?: string): string => {
    const idx = args.indexOf(flag)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : (def ?? '')
  }

  const input = get('--input')
  if (!input) {
    console.error('❌ 错误: 必须提供 --input 参数')
    printUsage()
    process.exit(1)
  }

  const series = get('--series')
  if (!series) {
    console.error('❌ 错误: 必须提供 --series 参数')
    printUsage()
    process.exit(1)
  }

  const validSeries = ['765', 'cinderella', 'million', 'sidem', 'shinycolors', 'gakuen']
  if (!validSeries.includes(series)) {
    console.error(`❌ 错误: 不支持的企划 "${series}"。可选: ${validSeries.join(', ')}`)
    process.exit(1)
  }

  const type = (get('--type', 'track') as 'track' | 'album')
  if (!['track', 'album'].includes(type)) {
    console.error('❌ 错误: --type 必须是 track 或 album')
    process.exit(1)
  }

  return {
    input,
    series,
    type,
    output: get('--output', 'data/seed/output/'),
    delay: parseInt(get('--delay', '1500'), 10),
    limit: parseInt(get('--limit', '5'), 10),
  }
}

function printUsage() {
  console.log(`
用法:
  npx tsx scripts/seed-cli.ts --input <file> --series <id> [选项]

选项:
  --input    输入文件路径 (每行一个查询词) [必填]
  --series   企划 ID: 765|cinderella|million|sidem|shinycolors|gakuen [必填]
  --type     搜索类型: track|album  [默认: track]
  --output   输出目录  [默认: data/seed/output/]
  --delay    请求间隔(ms)  [默认: 1500]
  --limit    每词返回结果数  [默认: 5]

示例:
  npx tsx scripts/seed-cli.ts --input data/seed/input/765.txt --series 765 --type track
  npx tsx scripts/seed-cli.ts --input data/seed/input/sc.txt --series shinycolors --type album
`)
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const opts = parseArgs()

  // 读取输入
  const raw = await fs.readFile(opts.input, 'utf-8')
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  console.log(`📦 iM@S Archive 数据脚手架`)
  console.log(`   输入: ${opts.input}`)
  console.log(`   企划: ${opts.series}`)
  console.log(`   类型: ${opts.type}`)
  console.log(`   条目: ${lines.length}`)
  console.log(`   延迟: ${opts.delay}ms\n`)

  const tracks: Partial<Track>[] = []
  const releases: Partial<Release>[] = []
  const errors: { query: string; reason: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const query = lines[i]
    const progress = `[${i + 1}/${lines.length}]`

    try {
      console.log(`${progress} 🔍 搜索: "${query}"`)

      // 为查询词追加企划前缀以提高匹配精度
      const searchTerm = opts.series === '765'
        ? `THE IDOLM@STER ${query}`
        : opts.series === 'cinderella'
        ? `アイドルマスター シンデレラガールズ ${query}`
        : opts.series === 'million'
        ? `アイドルマスター ミリオンライブ ${query}`
        : opts.series === 'sidem'
        ? `アイドルマスター SideM ${query}`
        : opts.series === 'shinycolors'
        ? `アイドルマスター シャイニーカラーズ ${query}`
        : opts.series === 'gakuen'
        ? `学園アイドルマスター ${query}`
        : query

      const res = await searchItunes({
        term: searchTerm,
        entity: opts.type === 'track' ? 'song' : 'album',
        country: 'jp',
        limit: opts.limit,
        lang: 'ja_jp',
      })

      if (res.resultCount === 0) {
        console.log(`   ⚠️  未找到结果`)
        errors.push({ query, reason: 'No results' })
        continue
      }

      const best = pickBestMatch(res.results, query)
      if (!best) {
        console.log(`   ⚠️  无法匹配最佳结果`)
        errors.push({ query, reason: 'No best match' })
        continue
      }

      if (opts.type === 'track') {
        const track = itunesResultToPartialTrack(best, opts.series, i + 1)
        // @ts-ignore — key type mismatch during seeding, will be fixed when Spotify API is activated
        tracks.push(track)

        // 如果对应的专辑还没被记录，也创建 Release
        if (best.collectionId && !releases.find((r) => r.id === `release-${best.collectionId}`)) {
          const release = itunesResultToPartialRelease(best, opts.series)
          releases.push(release)
        }

        console.log(`   ✅ ${best.trackName} — ${best.artistName}`)
        if (best.previewUrl) {
          console.log(`   🎵 试听: ${best.previewUrl.slice(0, 60)}...`)
        }
      } else {
        // album mode
        const release = itunesResultToPartialRelease(best, opts.series)
        releases.push(release)
        console.log(`   ✅ ${best.collectionName} — ${best.artistName}`)
      }

      if (best.artworkUrl100) {
        console.log(`   🖼️  封面: ${getHighResArtwork(best.artworkUrl100, 600)}`)
      }
    } catch (err: any) {
      console.error(`   ❌ 错误: ${err.message}`)
      errors.push({ query, reason: err.message })
    }

    // Rate limit 保护
    if (i < lines.length - 1) {
      await sleep(opts.delay)
    }
  }

  // 确保输出目录存在
  await fs.mkdir(opts.output, { recursive: true })

  // 写入结果
  const timestamp = new Date().toISOString().slice(0, 10)
  const baseName = `${opts.series}_${opts.type}s_${timestamp}`

  if (tracks.length > 0) {
    const trackPath = path.join(opts.output, `${baseName}_tracks.json`)
    await fs.writeFile(trackPath, JSON.stringify(tracks, null, 2), 'utf-8')
    console.log(`\n📝 已写入 ${tracks.length} 条曲目: ${trackPath}`)
  }

  if (releases.length > 0) {
    const releasePath = path.join(opts.output, `${baseName}_releases.json`)
    await fs.writeFile(releasePath, JSON.stringify(releases, null, 2), 'utf-8')
    console.log(`📝 已写入 ${releases.length} 条发行物: ${releasePath}`)
  }

  if (errors.length > 0) {
    const errorPath = path.join(opts.output, `${baseName}_errors.json`)
    await fs.writeFile(errorPath, JSON.stringify(errors, null, 2), 'utf-8')
    console.log(`⚠️  ${errors.length} 条失败记录: ${errorPath}`)
  }

  console.log(`\n✅ 脚手架运行完成`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
