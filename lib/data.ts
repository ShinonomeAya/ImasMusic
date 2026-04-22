/**
 * 数据聚合层 —— ImasMusic Rebuilt
 * 从 JSON 文件加载 Tracks / Releases / Artists
 * 提供所有查询函数
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { Track, Release, Artist, SeriesBrand, ReleaseType, ArtistRole } from '@/types'

// ============================================================
// 数据加载 (服务端运行，构建时读取)
// ============================================================

let _tracks: Track[] | null = null
let _releases: Release[] | null = null
let _artists: Artist[] | null = null

async function loadTracks(): Promise<Track[]> {
  if (_tracks) return _tracks
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'data', 'tracks.json'), 'utf-8')
    _tracks = JSON.parse(file) as Track[]
  } catch {
    _tracks = []
  }
  return _tracks
}

async function loadReleases(): Promise<Release[]> {
  if (_releases) return _releases
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'data', 'releases.json'), 'utf-8')
    _releases = JSON.parse(file) as Release[]
  } catch {
    _releases = []
  }
  return _releases
}

async function loadArtists(): Promise<Artist[]> {
  if (_artists) return _artists
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'data', 'artists.json'), 'utf-8')
    _artists = JSON.parse(file) as Artist[]
  } catch {
    _artists = []
  }
  return _artists
}

/** 强制刷新缓存（开发时有用） */
export function clearDataCache() {
  _tracks = null
  _releases = null
  _artists = null
}

// ============================================================
// Track 查询
// ============================================================

export async function getAllTracks(): Promise<Track[]> {
  return loadTracks()
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  const tracks = await loadTracks()
  return tracks.find((t) => t.id === id)
}

export async function getTracksByRelease(releaseId: string): Promise<Track[]> {
  const tracks = await loadTracks()
  return tracks.filter((t) => t.releaseId === releaseId)
}

export async function getTracksByArtist(artistId: string): Promise<Track[]> {
  const tracks = await loadTracks()
  return tracks.filter((t) => t.artistIds.includes(artistId))
}

export async function getTracksBySeries(series: SeriesBrand): Promise<Track[]> {
  const releases = await loadReleases()
  const releaseIds = new Set(releases.filter((r) => r.series === series).map((r) => r.id))
  const tracks = await loadTracks()
  return tracks.filter((t) => releaseIds.has(t.releaseId))
}

export async function searchTracks(query: string): Promise<Track[]> {
  const q = query.toLowerCase()
  const tracks = await loadTracks()
  return tracks.filter(
    (t) =>
      t.titleJa.toLowerCase().includes(q) ||
      t.titleRomaji?.toLowerCase().includes(q) ||
      t.titleZh?.toLowerCase().includes(q)
  )
}

// ============================================================
// Release 查询
// ============================================================

export async function getAllReleases(): Promise<Release[]> {
  return loadReleases()
}

export async function getReleaseById(id: string): Promise<Release | undefined> {
  const releases = await loadReleases()
  return releases.find((r) => r.id === id)
}

export async function getReleasesBySeries(series: SeriesBrand): Promise<Release[]> {
  const releases = await loadReleases()
  return releases.filter((r) => r.series === series)
}

export async function getReleasesByType(type: ReleaseType): Promise<Release[]> {
  const releases = await loadReleases()
  return releases.filter((r) => r.type === type)
}

export async function searchReleases(query: string): Promise<Release[]> {
  const q = query.toLowerCase()
  const releases = await loadReleases()
  return releases.filter(
    (r) =>
      r.titleJa.toLowerCase().includes(q) ||
      r.titleRomaji?.toLowerCase().includes(q) ||
      r.titleZh?.toLowerCase().includes(q)
  )
}

// ============================================================
// Artist 查询
// ============================================================

export async function getAllArtists(): Promise<Artist[]> {
  return loadArtists()
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const artists = await loadArtists()
  return artists.find((a) => a.id === id)
}

export async function getArtistsByRole(role: ArtistRole): Promise<Artist[]> {
  const artists = await loadArtists()
  return artists.filter((a) => a.role === role)
}

export async function getArtistsBySeries(series: SeriesBrand): Promise<Artist[]> {
  const artists = await loadArtists()
  return artists.filter((a) => a.series?.includes(series))
}

// ============================================================
// 统计与聚合
// ============================================================

export async function getSeriesStats(series: SeriesBrand) {
  const [releases, tracks] = await Promise.all([loadReleases(), loadTracks()])

  const seriesReleases = releases.filter((r) => r.series === series)
  const releaseIds = new Set(seriesReleases.map((r) => r.id))
  const seriesTracks = tracks.filter((t) => releaseIds.has(t.releaseId))

  // 按类型统计发行物
  const typeCounts = seriesReleases.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 按年份统计
  const yearCounts = seriesReleases.reduce((acc, r) => {
    if (r.releaseDate) {
      const year = new Date(r.releaseDate).getFullYear()
      acc[year] = (acc[year] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  // BPM 范围
  const bpms = seriesTracks.map((t) => t.bpm).filter((b): b is number => b !== undefined)

  return {
    totalReleases: seriesReleases.length,
    totalTracks: seriesTracks.length,
    typeCounts,
    yearCounts,
    bpmRange: bpms.length > 0 ? { min: Math.min(...bpms), max: Math.max(...bpms) } : null,
  }
}

/** 获取带有 audio features 的曲目（用于曲风地图等可视化） */
export async function getTracksWithAudioFeatures(series?: SeriesBrand): Promise<Track[]> {
  const tracks = series ? await getTracksBySeries(series) : await loadTracks()
  return tracks.filter((t) => t.energy !== undefined && t.valence !== undefined)
}
