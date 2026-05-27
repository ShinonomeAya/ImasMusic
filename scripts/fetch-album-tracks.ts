#!/usr/bin/env tsx
/**
 * 批量抓取 iTunes 专辑中的曲目
 * 遍历缺少 trackIds 的 release，用 lookup API 获取歌曲列表
 */

import fs from 'fs/promises'
import type { Track, Release } from '../types'

const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAlbumTracks(collectionId: number): Promise<any[]> {
  const url = `${ITUNES_LOOKUP}?id=${collectionId}&entity=song&country=jp&lang=ja_jp`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.results || []).filter((r: any) => r.wrapperType === 'track' || r.kind === 'song')
}

async function main() {
  console.log('📦 批量抓取专辑曲目')
  console.log('─────────────────────')

  const tracksRaw = await fs.readFile('data/tracks.json', 'utf-8')
  const releasesRaw = await fs.readFile('data/releases.json', 'utf-8')

  let tracks: Track[] = JSON.parse(tracksRaw)
  let releases: Release[] = JSON.parse(releasesRaw)

  const trackMap = new Map<string, Track>()
  for (const t of tracks) trackMap.set(t.id, t)

  const emptyReleases = releases.filter((r) => !r.trackIds || r.trackIds.length === 0)
  console.log(`📁 现有曲目: ${tracks.length}`)
  console.log(`📁 待处理专辑: ${emptyReleases.length}\n`)

  let added = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < emptyReleases.length; i++) {
    const release = emptyReleases[i]
    const collectionId = parseInt(release.id.replace('release-', ''), 10)
    const progress = `[${i + 1}/${emptyReleases.length}]`

    try {
      const songs = await fetchAlbumTracks(collectionId)

      if (songs.length === 0) {
        console.log(`${progress} ⚠️  无曲目: ${release.titleJa.slice(0, 50)}`)
        skipped++
        continue
      }

      const releaseTrackIds: string[] = []

      for (const song of songs) {
        const trackId = `track-${song.trackId}`
        releaseTrackIds.push(trackId)

        if (!trackMap.has(trackId)) {
          const track: Track = {
            id: trackId,
            titleJa: song.trackName || 'Unknown',
            releaseId: release.id,
            artistIds: song.artistName ? [song.artistName] : [],
            credits: [],
            trackNumber: song.trackNumber || 1,
            durationSec: song.trackTimeMillis ? Math.round(song.trackTimeMillis / 1000) : undefined,
            previewUrl: song.previewUrl || undefined,
          }
          trackMap.set(trackId, track)
          added++
        }
      }

      const relIndex = releases.findIndex((r) => r.id === release.id)
      if (relIndex !== -1) {
        releases[relIndex] = { ...releases[relIndex], trackIds: releaseTrackIds }
      }

      console.log(
        `${progress} ✅ ${release.titleJa.slice(0, 45)}${release.titleJa.length > 45 ? '...' : ''} | ${songs.length} 首`
      )
    } catch (err: any) {
      console.log(`${progress} ❌ ${release.titleJa.slice(0, 45)} | ${err.message}`)
      errors++
    }

    if (i < emptyReleases.length - 1) await sleep(1100)
  }

  const finalTracks = Array.from(trackMap.values())
  await fs.writeFile('data/tracks.json', JSON.stringify(finalTracks, null, 2), 'utf-8')
  await fs.writeFile('data/releases.json', JSON.stringify(releases, null, 2), 'utf-8')

  console.log(`\n─────────────────────`)
  console.log(`✅ 完成！`)
  console.log(`   曲目总数: ${finalTracks.length} (新增 ${added})`)
  console.log(`   跳过: ${skipped}`)
  console.log(`   错误: ${errors}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
