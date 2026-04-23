#!/usr/bin/env tsx
/**
 * 批量抓取 iTunes 偶像大师专辑数据
 * 1. 对每个企划搜索 iTunes album（limit=200）
 * 2. 根据专辑名称 + artistName 自动识别所属企划
 * 3. 严格过滤：Gakuen 要求 artistName 含「初星学園」
 * 4. 与现有 data/releases.json 合并（去重 + 修复 series 标注）
 */

import fs from 'fs/promises'
import { searchItunes, getHighResArtwork } from '../lib/api/itunes'
import type { Release, SeriesBrand } from '../types'

const SERIES_QUERIES: { series: SeriesBrand; terms: string[] }[] = [
  { series: '765', terms: ['THE IDOLM@STER'] },
  { series: 'cinderella', terms: ['アイドルマスター シンデレラガールズ', 'THE IDOLM@STER CINDERELLA'] },
  { series: 'million', terms: ['アイドルマスター ミリオンライブ', 'THE IDOLM@STER MILLION'] },
  { series: 'sidem', terms: ['アイドルマスター SideM', 'THE IDOLM@STER SideM'] },
  { series: 'shinycolors', terms: ['アイドルマスター シャイニーカラーズ', 'THE IDOLM@STER SHINY COLORS'] },
  { series: 'gakuen', terms: ['学園アイドルマスター', 'Gakuen Idolmaster'] },
]

/** 明确不是偶像大师的关键词黑名单 */
const BLACKLIST = [
  'vocaloid', '初音ミク', 'hatsune miku', 'miku symphony',
  'utada hikaru', '宇多田ヒカル', '宇多田光',
  'zard',
  'dolby', 'thx', 'deep note', 'test noise', 'demo pink',
  'atmos master', 'atmos sound fx', 'atmos speaker', 'atmos ep', 'atmos get down',
  'the guerrilla biish', 'the guerrilla bish', 'biish', 'bish',
  'all time best 1998',
  '眠りに落ちる',
]

/** 检测专辑属于哪个企划 */
function detectSeries(name: string, artist: string = ''): SeriesBrand | null {
  const n = name.toLowerCase()
  const a = artist.toLowerCase()
  // 优先匹配特定企划关键词（顺序很重要，越特定的越靠前）
  if (n.includes('cinderella') || n.includes('シンデレラ')) return 'cinderella'
  if (n.includes('million') || n.includes('ミリオン')) return 'million'
  if (n.includes('sidem') || n.includes('side m')) return 'sidem'
  if (n.includes('shiny') || n.includes('シャイニー')) return 'shinycolors'
  if (n.includes('gakuen') || n.includes('学園') || a.includes('初星学園')) return 'gakuen'
  if (n.includes('765')) return '765'
  // 兜底：通用 THE IDOLM@STER / アイドルマスター 归为 765
  if (n.includes('idolm@ster') || n.includes('アイドルマスター')) return '765'
  return null
}

/** 检测专辑类型 */
function detectType(name: string): Release['type'] {
  const n = name.toLowerCase()
  if (n.includes('- single') || n.includes('(single') || /^.+ - single$/.test(n)) return 'SINGLE'
  if (n.includes('- ep') || n.includes('(ep')) return 'EP'
  return 'ALBUM'
}

/** 验证搜索结果是否确实属于目标企划（严格过滤） */
function isValidResult(item: any, targetSeries: SeriesBrand): boolean {
  const name = (item.collectionName || '').toLowerCase()
  const artist = (item.artistName || '').toLowerCase()
  const combined = name + ' ' + artist

  // 黑名单优先剔除
  if (BLACKLIST.some((k) => combined.includes(k))) return false

  // Gakuen 严格：artistName 必须含「初星学園」或学年/组合名
  if (targetSeries === 'gakuen') {
    return (
      artist.includes('初星学園') ||
      artist.includes('1年') ||
      artist.includes('3年') ||
      artist.includes('re;iris') ||
      artist.includes('begrazia')
    )
  }

  // 其他企划：要求名称或 artist 包含明确关键词
  if (targetSeries === '765') {
    return (
      name.includes('765') ||
      name.includes('idolm@ster') ||
      name.includes('アイドルマスター')
    )
  }
  if (targetSeries === 'cinderella') {
    return (
      name.includes('cinderella') ||
      name.includes('シンデレラ') ||
      name.includes('idolm@ster') ||
      name.includes('アイドルマスター')
    )
  }
  if (targetSeries === 'million') {
    return (
      name.includes('million') ||
      name.includes('ミリオン') ||
      name.includes('idolm@ster') ||
      name.includes('アイドルマスター')
    )
  }
  if (targetSeries === 'sidem') {
    return (
      name.includes('sidem') ||
      name.includes('side m') ||
      name.includes('idolm@ster') ||
      name.includes('アイドルマスター')
    )
  }
  if (targetSeries === 'shinycolors') {
    return (
      name.includes('shiny') ||
      name.includes('シャイニー') ||
      name.includes('idolm@ster') ||
      name.includes('アイドルマスター')
    )
  }

  return false
}

function itunesToRelease(result: any, series: SeriesBrand): Release {
  return {
    id: `release-${result.collectionId}`,
    type: detectType(result.collectionName || ''),
    titleJa: result.collectionName || 'Unknown',
    series,
    releaseDate: result.releaseDate,
    coverUrl: getHighResArtwork(result.artworkUrl100 || result.artworkUrl60),
    trackIds: [],
    format: 'CD',
    appleMusicUrl: result.collectionId
      ? `https://music.apple.com/jp/album/${result.collectionId}`
      : undefined,
    artistName: result.artistName || undefined,
  } as Release
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const releaseMap = new Map<string, Release>()
  let fixedCount = 0
  let addedCount = 0
  let skippedCount = 0

  // 读取现有数据
  console.log('📦 批量专辑抓取工具 (v2 严格过滤)')
  console.log('─────────────────────')

  try {
    const existingRaw = await fs.readFile('data/releases.json', 'utf-8')
    const existing: Release[] = JSON.parse(existingRaw)
    for (const r of existing) {
      releaseMap.set(r.id, r)
    }
    console.log(`📁 现有数据: ${existing.length} 条发行物\n`)
  } catch {
    console.log('📁 无现有数据，将全新创建\n')
  }

  // 批量搜索
  for (const { series, terms } of SERIES_QUERIES) {
    for (const term of terms) {
      console.log(`🔍 [${series}] 搜索: "${term}"`)
      try {
        const res = await searchItunes({
          term,
          entity: 'album',
          country: 'jp',
          limit: 200,
          lang: 'ja_jp',
        })

        let batchAdded = 0
        let batchFixed = 0
        let batchSkipped = 0

        for (const item of res.results) {
          // 先通过 detectSeries 判断属于哪个企划
          const detected = detectSeries(item.collectionName || '', item.artistName || '')

          // 严格验证：必须确实属于目标企划
          if (!isValidResult(item, series)) {
            skippedCount++
            batchSkipped++
            continue
          }

          const id = `release-${item.collectionId}`

          // 如果已有数据，修复 series 字段 + 补充 artistName
          if (releaseMap.has(id)) {
            const existing = releaseMap.get(id)!
            if (existing.series !== detected) {
              console.log(
                `   🔄 ${existing.titleJa.slice(0, 50)}${existing.titleJa.length > 50 ? '...' : ''} | series: ${existing.series} → ${detected}`
              )
              existing.series = detected
              batchFixed++
              fixedCount++
            }
            // 补充 artistName（如果之前没有）
            if (!(existing as any).artistName && item.artistName) {
              ;(existing as any).artistName = item.artistName
            }
            continue
          }

          // 新增
          const release = itunesToRelease(item, detected || series)
          releaseMap.set(id, release)
          batchAdded++
          addedCount++
        }

        console.log(
          `   ✅ 返回 ${res.resultCount} 条 | 新增 ${batchAdded} | 修复 ${batchFixed} | 跳过 ${batchSkipped}`
        )
      } catch (err: any) {
        console.error(`   ❌ 错误: ${err.message}`)
      }

      await sleep(1000)
    }
  }

  // 写回
  const final = Array.from(releaseMap.values())
  await fs.writeFile('data/releases.json', JSON.stringify(final, null, 2), 'utf-8')

  console.log(`\n─────────────────────`)
  console.log(`✅ 完成！`)
  console.log(`   总计: ${final.length} 条发行物`)
  console.log(`   新增: ${addedCount}`)
  console.log(`   修复: ${fixedCount}`)
  console.log(`   跳过: ${skippedCount}`)

  const stats: Record<string, number> = {}
  for (const r of final) {
    stats[r.series] = (stats[r.series] || 0) + 1
  }
  console.log(`\n📊 各企划分布:`)
  for (const [s, c] of Object.entries(stats).sort()) {
    console.log(`   ${s}: ${c}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
