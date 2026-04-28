#!/usr/bin/env tsx
/**
 * Sprint 8.1c — Recording-level 精修
 *
 * 读取 data/tracks.json + mb_release_patches.json，
 * 通过 MusicBrainz API 按 track 精确匹配 Credits（作词/作曲/编曲），
 * 输出增量补丁到 data/seed/output/mb_track_patches.json。
 *
 * 支持断点续传：已处理的 track 会跳过，中途 Ctrl+C 后重新运行即可从断点继续。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  searchRecording,
  getRecordingDetails,
  getWorkDetails,
} from './musicbrainz'

// ---------------------------------------------------------------------------
// 路径常量
// ---------------------------------------------------------------------------

const TRACKS_PATH = path.resolve(process.cwd(), 'data', 'tracks.json')
const RELEASE_PATCHES_PATH = path.resolve(
  process.cwd(),
  'data',
  'seed',
  'output',
  'mb_release_patches.json'
)
const OUTPUT_DIR = path.resolve(process.cwd(), 'data', 'seed', 'output')
const PATCH_PATH = path.resolve(OUTPUT_DIR, 'mb_track_patches.json')

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

interface TrackInput {
  id: string
  titleJa: string
  releaseId: string
  artistIds: string[]
  credits: Array<{ artistId: string; role: string }>
  trackNumber: number
  durationSec?: number
  bpm?: number
  previewUrl?: string
  [key: string]: unknown
}

interface ReleasePatch {
  mbReleaseId?: string
  catalogNumber?: string
  label?: string
  barcode?: string
  matched: boolean
}

type ReleasePatchMap = Record<string, ReleasePatch>

interface TrackPatch {
  mbRecordingId?: string
  lyricists?: string[]
  composers?: string[]
  arrangers?: string[]
  matched: boolean
}

type TrackPatchMap = Record<string, TrackPatch>

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

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

function loadTracks(): TrackInput[] {
  const raw = fs.readFileSync(TRACKS_PATH, 'utf-8')
  return JSON.parse(raw) as TrackInput[]
}

function loadReleasePatches(): ReleasePatchMap {
  if (!fs.existsSync(RELEASE_PATCHES_PATH)) {
    return {}
  }
  const raw = fs.readFileSync(RELEASE_PATCHES_PATH, 'utf-8')
  try {
    return JSON.parse(raw) as ReleasePatchMap
  } catch {
    console.error('⚠️  Release 补丁文件 JSON 损坏，将视为空。')
    return {}
  }
}

function loadExistingTrackPatches(): TrackPatchMap {
  if (!fs.existsSync(PATCH_PATH)) {
    return {}
  }
  const raw = fs.readFileSync(PATCH_PATH, 'utf-8')
  try {
    return JSON.parse(raw) as TrackPatchMap
  } catch {
    console.error('⚠️  Track 补丁文件 JSON 损坏，将重新开始。')
    return {}
  }
}

function saveTrackPatches(patches: TrackPatchMap): void {
  fs.writeFileSync(PATCH_PATH, JSON.stringify(patches, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// Credit 解析
// ---------------------------------------------------------------------------

/**
 * 从 Recording Details 中提取 arranger，并返回关联的 Work ID（用于进一步查 lyricist/composer）。
 */
function extractRecordingCredits(
  recording: Awaited<ReturnType<typeof getRecordingDetails>>
): { arrangers: string[]; workId?: string } {
  const arrangers: string[] = []
  let workId: string | undefined

  for (const rel of recording.relations || []) {
    // 1. arranger 直接挂在 Recording 的 artist 关系上
    if (
      rel['target-type'] === 'artist' &&
      rel.type === 'arranger' &&
      rel.artist
    ) {
      arrangers.push(rel.artist.name.trim())
    }

    // 2. 找到关联的 Work（performance 类型）
    if (
      rel['target-type'] === 'work' &&
      rel.type === 'performance' &&
      rel.work
    ) {
      workId = rel.work.id
    }
  }

  return { arrangers: dedupe(arrangers), workId }
}

/**
 * 从 Work Details 中提取 lyricist / composer。
 */
function extractWorkCredits(
  work: Awaited<ReturnType<typeof getWorkDetails>>
): { lyricists: string[]; composers: string[] } {
  const lyricists: string[] = []
  const composers: string[] = []

  for (const rel of work.relations || []) {
    if (rel['target-type'] === 'artist' && rel.artist) {
      const name = rel.artist.name.trim()
      if (rel.type === 'lyricist') {
        lyricists.push(name)
      }
      if (rel.type === 'composer') {
        composers.push(name)
      }
    }
  }

  return {
    lyricists: dedupe(lyricists),
    composers: dedupe(composers),
  }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  ensureDir(OUTPUT_DIR)

  const tracks = loadTracks()
  const releasePatches = loadReleasePatches()
  const patches = loadExistingTrackPatches()
  const processedIds = new Set(Object.keys(patches))

  const total = tracks.length
  let processed = processedIds.size
  let matched = 0
  let unmatched = 0

  console.log(`🎵 共 ${total} 个 Track，已处理 ${processed} 个，待处理 ${total - processed} 个`)
  console.log('─'.repeat(70))

  for (const track of tracks) {
    if (processedIds.has(track.id)) {
      continue
    }

    processed++
    const currentLabel = `[${String(processed).padStart(4)}/${total}]`

    // 1. 构造查询（按优先级尝试，最精确的放最前面）
    const releasePatch = releasePatches[track.releaseId]
    const queries: string[] = []

    if (releasePatch?.mbReleaseId) {
      // P1: 用 release MBID 精确限定 recording 所属专辑（最可靠）
      queries.push(
        `recording:"${escapeLucene(track.titleJa)}" AND reid:${releasePatch.mbReleaseId}`
      )
    }
    // P2: 纯 recording 名称搜索（不带 artist 限制，避免误匹配如 READY!! → Ready go!）
    queries.push(`recording:"${escapeLucene(track.titleJa)}"`)
    // P3: 带 artist 限制的 fallback
    queries.push(
      `recording:"${escapeLucene(track.titleJa)}" AND artist:"THE IDOLM@STER"`
    )

    // 2. 搜索 Recording（按优先级依次尝试）
    let mbRecordingId: string | undefined
    let searchError: string | undefined

    for (const query of queries) {
      try {
        const result = await searchRecording(query, 1)
        if (result.recordings && result.recordings.length > 0) {
          mbRecordingId = result.recordings[0].id
          break
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        searchError = msg
        // 继续尝试下一个 fallback query
      }
    }

    // 3. 获取详情并解析 Credits
    let patch: TrackPatch
    if (!mbRecordingId) {
      patch = { matched: false }
      unmatched++
      console.log(
        `${currentLabel} ❌ Unmatched: ${track.titleJa}${searchError ? ` (${searchError})` : ''}`
      )
    } else {
      try {
        const recording = await getRecordingDetails(mbRecordingId)
        const { arrangers, workId } = extractRecordingCredits(recording)

        let lyricists: string[] = []
        let composers: string[] = []

        if (workId) {
          const work = await getWorkDetails(workId)
          const workCredits = extractWorkCredits(work)
          lyricists = workCredits.lyricists
          composers = workCredits.composers
        }

        patch = {
          mbRecordingId,
          lyricists: lyricists.length > 0 ? lyricists : undefined,
          composers: composers.length > 0 ? composers : undefined,
          arrangers: arrangers.length > 0 ? arrangers : undefined,
          matched: true,
        }
        matched++

        const creditsStr = [
          lyricists.length > 0 ? `作词: ${lyricists.join(', ')}` : '',
          composers.length > 0 ? `作曲: ${composers.join(', ')}` : '',
          arrangers.length > 0 ? `编曲: ${arrangers.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' | ')

        console.log(
          `${currentLabel} ✅ ${track.titleJa} → ${creditsStr || '(no credits found)'}`
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        patch = { matched: false }
        unmatched++
        console.log(`${currentLabel} ⚠️  Error (${msg}), skipped: ${track.titleJa}`)
      }
    }

    // 4. 实时增量写入
    patches[track.id] = patch
    saveTrackPatches(patches)
    processedIds.add(track.id)
  }

  console.log('─'.repeat(70))
  console.log('🎉 Recording-level 精修完成')
  console.log(
    `   总计: ${total} | 成功匹配: ${matched} | 未匹配: ${unmatched} | 此前已处理: ${processedIds.size - matched - unmatched}`
  )
  console.log(`   补丁文件: ${PATCH_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
