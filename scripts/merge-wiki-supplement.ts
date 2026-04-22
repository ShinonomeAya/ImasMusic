/**
 * 批量解析 Wiki dump 并合并到 tracks.json + artists.json
 *
 * 用法:
 *   1. 把 Wiki 页面 Ctrl+A 内容保存到 data/seed/wiki-dumps/{曲名}.txt
 *   2. npx tsx scripts/merge-wiki-supplement.ts
 */

import { promises as fs } from 'fs'
import path from 'path'
import { parseWikiDump } from './parse-wiki-dump'

// ── 内联类型（避免 tsconfig paths 问题）──
interface TrackCredit {
  artistId: string
  role: 'VOCALS' | 'COMPOSER' | 'LYRICIST' | 'ARRANGER'
}

interface Track {
  id: string
  titleJa: string
  titleRomaji?: string
  titleZh?: string
  releaseId: string
  artistIds: string[]
  credits: TrackCredit[]
  trackNumber: number
  durationSec?: number
  bpm?: number
  energy?: number
  valence?: number
  key?: number
  mode?: number
  previewUrl?: string
  spotifyId?: string
  lyrics?: string
  description?: string
}

interface Artist {
  id: string
  nameJa: string
  nameEn?: string
  role: 'IDOL' | 'UNIT' | 'CV' | 'CREATOR'
  series?: string[]
  portraitUrl?: string
  bio?: string
  trackIds?: string[]
  releaseIds?: string[]
  cvId?: string
  characterIds?: string[]
}

const DUMP_DIR = path.join(process.cwd(), 'data', 'seed', 'wiki-dumps')
const TRACKS_PATH = path.join(process.cwd(), 'data', 'tracks.json')
const ARTISTS_PATH = path.join(process.cwd(), 'data', 'artists.json')

async function loadJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, 'utf-8')
  return JSON.parse(raw) as T
}

async function saveJson(p: string, data: unknown) {
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

/** 生成创作者 ID（简单 slug） */
function slugify(name: string): string {
  return (
    'creator-' +
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  )
}

/** 查找或创建创作者 Artist */
function findOrCreateCreator(
  name: string,
  artists: Artist[]
): { artist: Artist; created: boolean } {
  const existing = artists.find(
    a => a.role === 'CREATOR' && a.nameJa === name
  )
  if (existing) return { artist: existing, created: false }

  const artist: Artist = {
    id: slugify(name),
    nameJa: name,
    role: 'CREATOR',
  }
  artists.push(artist)
  return { artist, created: true }
}

/** 把创作者名字转为 TrackCredit */
function toCredit(
  name: string | undefined,
  role: TrackCredit['role'],
  artists: Artist[]
): TrackCredit | null {
  if (!name) return null
  const { artist } = findOrCreateCreator(name, artists)
  return { artistId: artist.id, role }
}

/** 在 tracks 中查找最匹配的 track */
function findMatchingTrack(
  parsed: ReturnType<typeof parseWikiDump>,
  tracks: Track[]
): Track | null {
  if (!parsed.titleJa && !parsed.titleRomaji && !parsed.titleEn) return null

  const candidates = [parsed.titleJa, parsed.titleRomaji, parsed.titleEn].filter(
    Boolean
  ) as string[]

  // 1. 精确匹配 titleJa
  for (const candidate of candidates) {
    const match = tracks.find(t => t.titleJa === candidate)
    if (match) return match
  }

  // 2. 模糊匹配：忽略大小写和空格
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase().replace(/\s+/g, '')
    const match = tracks.find(t => {
      const tNorm = t.titleJa.toLowerCase().replace(/\s+/g, '')
      return tNorm === normalized || tNorm.startsWith(normalized)
    })
    if (match) return match
  }

  // 3. 去除副标题后匹配（如 "GO MY WAY!! (M@STER VERSION)" → "GO MY WAY!!"）
  for (const candidate of candidates) {
    const base = candidate.replace(/\s*[\(\（].*?[\)\）]\s*$/, '').trim()
    if (base === candidate) continue
    const match = tracks.find(t => {
      const tBase = t.titleJa.replace(/\s*[\(\（].*?[\)\）]\s*$/, '').trim()
      return tBase.toLowerCase() === base.toLowerCase()
    })
    if (match) return match
  }

  return null
}

async function main() {
  // 确保目录存在
  try {
    await fs.mkdir(DUMP_DIR, { recursive: true })
  } catch {}

  // 读取现有数据
  const tracks = await loadJson<Track[]>(TRACKS_PATH)
  const artists = await loadJson<Artist[]>(ARTISTS_PATH)

  // 读取所有 dump 文件
  let files: string[]
  try {
    files = (await fs.readdir(DUMP_DIR)).filter(f => f.endsWith('.txt'))
  } catch {
    files = []
  }

  if (files.length === 0) {
    console.log(`⚠️  ${DUMP_DIR} 中没有 .txt 文件`)
    console.log('   请把 Wiki 页面 Ctrl+A 内容保存为 .txt 文件放入此目录')
    return
  }

  let updatedTracks = 0
  let unmatched: string[] = []

  for (const file of files) {
    const raw = await fs.readFile(path.join(DUMP_DIR, file), 'utf-8')
    const parsed = parseWikiDump(raw)

    console.log(`\n📄 ${file}`)
    console.log(
      `   解析: ${parsed.titleJa || parsed.titleRomaji || parsed.titleEn || '(未知)'}`
    )

    const track = findMatchingTrack(parsed, tracks)
    if (!track) {
      console.log(`   ❌ 未匹配到 tracks.json 中的曲目`)
      unmatched.push(file)
      continue
    }

    console.log(`   ✅ 匹配: ${track.titleJa} (${track.id})`)

    // ── 更新 track ──
    let trackModified = false

    if (parsed.titleRomaji && !track.titleRomaji) {
      track.titleRomaji = parsed.titleRomaji
      trackModified = true
    }

    if (parsed.bpm && !track.bpm) {
      track.bpm = parsed.bpm
      trackModified = true
    }

    if (parsed.description && !track.description) {
      track.description = parsed.description
      trackModified = true
    }

    // Credits
    const newCredits: TrackCredit[] = []
    const composerCredit = toCredit(parsed.composer, 'COMPOSER', artists)
    if (composerCredit) newCredits.push(composerCredit)
    const lyricistCredit = toCredit(parsed.lyricist, 'LYRICIST', artists)
    if (lyricistCredit) newCredits.push(lyricistCredit)
    const arrangerCredit = toCredit(parsed.arranger, 'ARRANGER', artists)
    if (arrangerCredit) newCredits.push(arrangerCredit)

    if (newCredits.length > 0) {
      // 合并，避免重复
      const existingKeys = new Set(
        track.credits.map(c => `${c.artistId}:${c.role}`)
      )
      for (const nc of newCredits) {
        const key = `${nc.artistId}:${nc.role}`
        if (!existingKeys.has(key)) {
          track.credits.push(nc)
          trackModified = true
        }
      }
    }

    if (trackModified) {
      updatedTracks++
      console.log(`   📝 已更新 track`)
    } else {
      console.log(`   ⏭️ 无需更新`)
    }
  }

  // 统计新增的创作者数量
  const newCreatorsCount = artists.filter(a => a.role === 'CREATOR').length

  // 保存
  await saveJson(TRACKS_PATH, tracks)
  await saveJson(ARTISTS_PATH, artists)

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`处理文件: ${files.length}`)
  console.log(`更新曲目: ${updatedTracks}`)
  console.log(`新增创作者: ${newCreatorsCount}`)
  if (unmatched.length > 0) {
    console.log(`未匹配文件:`)
    unmatched.forEach(f => console.log(`  - ${f}`))
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
