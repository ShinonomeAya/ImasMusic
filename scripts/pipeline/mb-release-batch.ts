#!/usr/bin/env tsx
/**
 * Sprint 8.1b — Release-level 批量打底
 *
 * 读取 data/releases.json，通过 MusicBrainz API 匹配 734 张发行物，
 * 提取 mbReleaseId / catalogNumber / label / barcode，
 * 输出增量补丁到 data/seed/output/mb_release_patches.json。
 *
 * 支持断点续传：已处理的 release 会跳过，中途 Ctrl+C 后重新运行即可从断点继续。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { searchRelease, getReleaseDetails } from './musicbrainz'

// ---------------------------------------------------------------------------
// 路径常量
// ---------------------------------------------------------------------------

const RELEASES_PATH = path.resolve(process.cwd(), 'data', 'releases.json')
const OUTPUT_DIR = path.resolve(process.cwd(), 'data', 'seed', 'output')
const PATCH_PATH = path.resolve(OUTPUT_DIR, 'mb_release_patches.json')

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

interface ReleaseInput {
  id: string
  type: string
  titleJa: string
  series: string
  catalogNumber?: string
  label?: string
  format?: string
  barcode?: string // 原数据中可能已存在
  [key: string]: unknown
}

interface ReleasePatch {
  mbReleaseId?: string
  catalogNumber?: string
  label?: string
  barcode?: string
  matched: boolean
}

type PatchFile = Record<string, ReleasePatch>

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * 转义 Lucene 查询语法中的特殊字符，防止 title 中的 `!`、`(` 等破坏查询。
 * 特殊字符集: + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /
 */
function escapeLucene(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/([+\-!(){}[\]^"~*?:/])/g, '\\$1')
    .replace(/&&/g, '\\&&')
    .replace(/\|\|/g, '\\||')
}

/**
 * 清理 iTunes / Apple Music 附加的格式后缀，使其更接近 MusicBrainz 的原始标题。
 * 例如：
 *   "... - EP"            → "..."
 *   "... - Single"        → "..."
 *   "... (2023 Ver.)"     → "..."
 */
function cleanTitleForSearch(title: string): string {
  return title
    .replace(/\s+-\s+EP$/i, '')
    .replace(/\s+-\s+Single$/i, '')
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .trim()
}

function loadReleases(): ReleaseInput[] {
  const raw = fs.readFileSync(RELEASES_PATH, 'utf-8')
  return JSON.parse(raw) as ReleaseInput[]
}

function loadExistingPatches(): PatchFile {
  if (!fs.existsSync(PATCH_PATH)) {
    return {}
  }
  const raw = fs.readFileSync(PATCH_PATH, 'utf-8')
  try {
    return JSON.parse(raw) as PatchFile
  } catch {
    console.error('⚠️  补丁文件 JSON 损坏，将重新开始。')
    return {}
  }
}

function savePatches(patches: PatchFile): void {
  fs.writeFileSync(PATCH_PATH, JSON.stringify(patches, null, 2), 'utf-8')
}

function extractLabelInfo(release: Awaited<ReturnType<typeof getReleaseDetails>>): {
  catalogNumber?: string
  label?: string
} {
  const labelInfos = release['label-info']
  if (!labelInfos || labelInfos.length === 0) {
    return {}
  }

  // 取第一条 label-info（主厂牌）
  const first = labelInfos[0]
  return {
    catalogNumber: first['catalog-number'] || undefined,
    label: first.label?.name || undefined,
  }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  ensureDir(OUTPUT_DIR)

  const releases = loadReleases()
  const patches = loadExistingPatches()
  const processedIds = new Set(Object.keys(patches))

  const total = releases.length
  let processed = processedIds.size
  let matched = 0
  let unmatched = 0

  console.log(`📦 共 ${total} 个 Release，已处理 ${processed} 个，待处理 ${total - processed} 个`)
  console.log('─'.repeat(60))

  for (const release of releases) {
    if (processedIds.has(release.id)) {
      continue
    }

    processed++
    const currentLabel = `[${processed}/${total}]`

    // 1. 构造查询
    let query: string
    if (release.catalogNumber) {
      query = `catno:"${escapeLucene(release.catalogNumber)}"`
    } else {
      const title = escapeLucene(cleanTitleForSearch(release.titleJa))
      query = `release:"${title}"`
    }

    // 2. 搜索 Release
    let patch: ReleasePatch
    try {
      const searchResult = await searchRelease(query, 3)

      if (!searchResult.releases || searchResult.releases.length === 0) {
        patch = { matched: false }
        unmatched++
        console.log(`${currentLabel} ❌ Unmatched: ${release.titleJa}`)
      } else {
        const first = searchResult.releases[0]
        const mbid = first.id

        // 3. 获取详情
        const details = await getReleaseDetails(mbid)
        const { catalogNumber, label } = extractLabelInfo(details)

        patch = {
          mbReleaseId: mbid,
          catalogNumber,
          label,
          barcode: details.barcode || undefined,
          matched: true,
        }
        matched++
        console.log(
          `${currentLabel} ✅ Matched: ${release.titleJa} → ${label ?? 'N/A'} (${catalogNumber ?? 'no catno'})`
        )
      }
    } catch (err) {
      // 网络/Rate Limit 等异常已由 musicbrainz.ts 内部重试，
      // 若仍然失败，记录为未匹配，避免阻塞整个批次。
      const msg = err instanceof Error ? err.message : String(err)
      patch = { matched: false }
      unmatched++
      console.log(`${currentLabel} ⚠️  Error (${msg}), skipped: ${release.titleJa}`)
    }

    // 4. 实时增量写入
    patches[release.id] = patch
    savePatches(patches)

    // 将当前 ID 加入已处理集合，防止同一轮意外重复（虽然循环里是顺序的，防御性编程）
    processedIds.add(release.id)
  }

  console.log('─'.repeat(60))
  console.log('🎉 Release-level 批量打底完成')
  console.log(`   总计: ${total} | 成功匹配: ${matched} | 未匹配: ${unmatched} | 此前已处理: ${processedIds.size - matched - unmatched}`)
  console.log(`   补丁文件: ${PATCH_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
