#!/usr/bin/env tsx
/**
 * Sprint 8.1d — Merge Engine
 *
 * 将 MusicBrainz 补丁数据合并回主数据库：
 *   - mb_release_patches.json → releases.json (catalogNumber / label)
 *   - mb_track_patches.json   → tracks.json   (credits: lyricist / composer / arranger)
 *
 * 自动为未收录的创作者生成 `role: CREATOR` 的 Artist 记录。
 * 合并前自动备份原始数据文件。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ---------------------------------------------------------------------------
// 路径常量
// ---------------------------------------------------------------------------

const DATA_DIR = path.resolve(process.cwd(), 'data')
const RELEASES_PATH = path.resolve(DATA_DIR, 'releases.json')
const TRACKS_PATH = path.resolve(DATA_DIR, 'tracks.json')
const ARTISTS_PATH = path.resolve(DATA_DIR, 'artists.json')
const RELEASE_PATCHES_PATH = path.resolve(
  DATA_DIR,
  'seed',
  'output',
  'mb_release_patches.json'
)
const TRACK_PATCHES_PATH = path.resolve(
  DATA_DIR,
  'seed',
  'output',
  'mb_track_patches.json'
)

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

interface Release {
  id: string
  type: string
  titleJa: string
  series: string
  catalogNumber?: string
  label?: string
  [key: string]: unknown
}

interface TrackCredit {
  artistId: string
  role: 'VOCALS' | 'COMPOSER' | 'LYRICIST' | 'ARRANGER'
}

interface Track {
  id: string
  titleJa: string
  releaseId: string
  credits: TrackCredit[]
  [key: string]: unknown
}

interface Artist {
  id: string
  nameJa: string
  role: 'IDOL' | 'UNIT' | 'CV' | 'CREATOR'
  [key: string]: unknown
}

interface ReleasePatch {
  mbReleaseId?: string
  catalogNumber?: string
  label?: string
  barcode?: string
  matched: boolean
}

interface TrackPatch {
  mbRecordingId?: string
  lyricists?: string[]
  composers?: string[]
  arrangers?: string[]
  matched: boolean
}

type PatchMap<T> = Record<string, T>

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function backupFile(src: string): void {
  const dest = `${src}.bak.${nowStamp()}`
  fs.copyFileSync(src, dest)
  console.log(`   📋 备份: ${path.basename(src)} → ${path.basename(dest)}`)
}

function loadJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function saveJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function cleanName(name: string): string {
  // 去除两端空格、全角空格、制表符等
  return name.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
}

function creditKey(c: TrackCredit): string {
  return `${c.artistId}|${c.role}`
}

function dedupeCredits(credits: TrackCredit[]): TrackCredit[] {
  const seen = new Set<string>()
  return credits.filter((c) => {
    const key = creditKey(c)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ---------------------------------------------------------------------------
// 创作者解析
// ---------------------------------------------------------------------------

class ArtistResolver {
  private artists: Artist[]
  private nameIndex: Map<string, Artist>
  private idIndex: Set<string>
  private createdCount = 0

  constructor(artists: Artist[]) {
    this.artists = artists
    this.nameIndex = new Map()
    this.idIndex = new Set()
    for (const a of artists) {
      this.nameIndex.set(a.nameJa, a)
      this.idIndex.add(a.id)
    }
  }

  getCreatedCount(): number {
    return this.createdCount
  }

  /**
   * 根据名字查找或自动创建 Creator Artist。
   * 返回稳定的 artistId。
   */
  resolve(name: string): string {
    const cleaned = cleanName(name)
    if (!cleaned) {
      throw new Error(`Empty creator name after cleaning: "${name}"`)
    }

    // 1. 按 nameJa 精确匹配已有 Artist
    const existing = this.nameIndex.get(cleaned)
    if (existing) {
      return existing.id
    }

    // 2. 生成稳定 ID（基于名字 UTF-8 hex，前 8 位）
    let id = `creator-${Buffer.from(cleaned).toString('hex').slice(0, 8)}`

    // 3. 处理哈希冲突：如果 ID 已被占用，改用完整 hex
    if (this.idIndex.has(id)) {
      const fullHex = Buffer.from(cleaned).toString('hex')
      id = `creator-${fullHex}`
      if (this.idIndex.has(id)) {
        // 极端冲突（不同名字产生相同完整 hex 在理论上不可能，但防御性处理）
        id = `creator-${fullHex}-${Date.now()}`
      }
    }

    // 4. 创建新 Artist
    const newArtist: Artist = {
      id,
      nameJa: cleaned,
      role: 'CREATOR',
    }
    this.artists.push(newArtist)
    this.nameIndex.set(cleaned, newArtist)
    this.idIndex.add(id)
    this.createdCount++

    return id
  }
}

// ---------------------------------------------------------------------------
// 合并逻辑
// ---------------------------------------------------------------------------

function mergeReleases(
  releases: Release[],
  patches: PatchMap<ReleasePatch>
): number {
  let updated = 0
  for (const release of releases) {
    const patch = patches[release.id]
    if (!patch || !patch.matched) continue

    let changed = false
    if (patch.catalogNumber !== undefined) {
      release.catalogNumber = patch.catalogNumber
      changed = true
    }
    if (patch.label !== undefined) {
      release.label = patch.label
      changed = true
    }
    if (changed) updated++
  }
  return updated
}

function mergeTracks(
  tracks: Track[],
  patches: PatchMap<TrackPatch>,
  resolver: ArtistResolver
): number {
  let updated = 0
  for (const track of tracks) {
    const patch = patches[track.id]
    if (!patch || !patch.matched) continue

    const newCredits: TrackCredit[] = [...track.credits]

    for (const name of patch.lyricists || []) {
      newCredits.push({ artistId: resolver.resolve(name), role: 'LYRICIST' })
    }
    for (const name of patch.composers || []) {
      newCredits.push({ artistId: resolver.resolve(name), role: 'COMPOSER' })
    }
    for (const name of patch.arrangers || []) {
      newCredits.push({ artistId: resolver.resolve(name), role: 'ARRANGER' })
    }

    const beforeLen = track.credits.length
    track.credits = dedupeCredits(newCredits)

    if (track.credits.length > beforeLen) {
      updated++
    }
  }
  return updated
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Sprint 8.1d — Merge Engine 启动')
  console.log('─'.repeat(60))

  // 1. 安全备份
  console.log('📦 正在备份原始数据文件...')
  backupFile(RELEASES_PATH)
  backupFile(TRACKS_PATH)
  backupFile(ARTISTS_PATH)
  console.log('')

  // 2. 加载数据
  console.log('📂 加载数据文件...')
  const releases = loadJson<Release[]>(RELEASES_PATH)
  const tracks = loadJson<Track[]>(TRACKS_PATH)
  const artists = loadJson<Artist[]>(ARTISTS_PATH)
  const releasePatches = fs.existsSync(RELEASE_PATCHES_PATH)
    ? loadJson<PatchMap<ReleasePatch>>(RELEASE_PATCHES_PATH)
    : {}
  const trackPatches = fs.existsSync(TRACK_PATCHES_PATH)
    ? loadJson<PatchMap<TrackPatch>>(TRACK_PATCHES_PATH)
    : {}

  console.log(`   Releases:  ${releases.length}`)
  console.log(`   Tracks:    ${tracks.length}`)
  console.log(`   Artists:   ${artists.length}`)
  console.log(`   Release patches: ${Object.keys(releasePatches).length}`)
  console.log(`   Track patches:   ${Object.keys(trackPatches).length}`)
  console.log('')

  // 3. 合并
  const resolver = new ArtistResolver(artists)

  console.log('🔧 合并 Release patches...')
  const updatedReleases = mergeReleases(releases, releasePatches)
  console.log(`   → 更新了 ${updatedReleases} 个 Releases`)

  console.log('🔧 合并 Track patches (Credits)...')
  const updatedTracks = mergeTracks(tracks, trackPatches, resolver)
  console.log(`   → 更新了 ${updatedTracks} 个 Tracks`)
  console.log(`   → 自动新增了 ${resolver.getCreatedCount()} 个 CREATOR Artist`)

  // 4. 计算 Credit 统计
  const totalCredits = tracks.reduce((sum, t) => sum + t.credits.length, 0)
  console.log(`   → Tracks 中 Credits 总数: ${totalCredits}`)
  console.log('')

  // 5. 落盘保存
  console.log('💾 保存更新后的数据文件...')
  saveJson(RELEASES_PATH, releases)
  saveJson(TRACKS_PATH, tracks)
  saveJson(ARTISTS_PATH, artists)

  console.log('─'.repeat(60))
  console.log('🎉 合并完成！')
  console.log(`   备份文件位于原文件同目录（*.bak.*）`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
