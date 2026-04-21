// 数据工具库 - 聚合所有数据源
import { Song, SongSummary, Series, PrimaryGenre } from '@/types/song'
import { sampleSongs765 } from '@/data/765/sample'
import { sampleSongsShinycolors, getShinycolorsStats } from '@/data/shinycolors/sample'

// 聚合所有歌曲数据
export const allSongs: Song[] = [
  ...sampleSongs765,
  ...sampleSongsShinycolors,
]

// 获取所有歌曲
export function getAllSongs(): Song[] {
  return allSongs
}

// 根据ID获取歌曲
export function getSongById(id: string): Song | undefined {
  return allSongs.find(song => song.id === id)
}

// 根据系列获取歌曲
export function getSongsBySeries(series: Series): Song[] {
  return allSongs.filter(song => song.series === series)
}

// 根据风格获取歌曲
export function getSongsByGenre(genre: PrimaryGenre): Song[] {
  return allSongs.filter(song => song.primaryGenre === genre)
}

// 获取简化版歌曲列表
export function getAllSongSummaries(): SongSummary[] {
  return allSongs.map(song => ({
    id: song.id,
    titleJa: song.titleJa,
    titleZh: song.titleZh,
    series: song.series,
    primaryGenre: song.primaryGenre,
    energy: song.energy,
    valence: song.valence,
    isCover: song.isCover,
    firstYear: song.firstYear,
  }))
}

// 按系列统计
export function getStatsBySeries(series: Series) {
  const songs = getSongsBySeries(series)
  const genreCounts = songs.reduce((acc, song) => {
    acc[song.primaryGenre] = (acc[song.primaryGenre] || 0) + 1
    return acc
  }, {} as Record<PrimaryGenre, number>)

  const arrangerCounts = songs.reduce((acc, song) => {
    acc[song.arranger] = (acc[song.arranger] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topArrangers = Object.entries(arrangerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return {
    totalSongs: songs.length,
    covers: songs.filter(s => s.isCover).length,
    originals: songs.filter(s => !s.isCover).length,
    genreCounts,
    topArrangers,
    yearRange: {
      min: songs.length > 0 ? Math.min(...songs.map(s => s.firstYear)) : 0,
      max: songs.length > 0 ? Math.max(...songs.map(s => s.firstYear)) : 0,
    },
  }
}

// 按风格统计
export function getStatsByGenre(genre: PrimaryGenre) {
  const songs = getSongsByGenre(genre)

  const seriesCounts = songs.reduce((acc, song) => {
    acc[song.series] = (acc[song.series] || 0) + 1
    return acc
  }, {} as Record<Series, number>)

  const arrangerCounts = songs.reduce((acc, song) => {
    acc[song.arranger] = (acc[song.arranger] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topArrangers = Object.entries(arrangerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return {
    totalSongs: songs.length,
    seriesCounts,
    topArrangers,
    yearRange: {
      min: songs.length > 0 ? Math.min(...songs.map(s => s.firstYear)) : 0,
      max: songs.length > 0 ? Math.max(...songs.map(s => s.firstYear)) : 0,
    },
  }
}

// 获取相似推荐
export function getSimilarSongs(songId: string, limit: number = 6): SongSummary[] {
  const targetSong = getSongById(songId)
  if (!targetSong) return []

  const candidates = allSongs
    .filter(s => s.id !== songId && s.primaryGenre === targetSong.primaryGenre)
    .map(s => ({
      ...s,
      distance: Math.abs(s.energy - targetSong.energy) + Math.abs(s.valence - targetSong.valence),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)

  return candidates.map(({ distance, ...song }) => ({
    id: song.id,
    titleJa: song.titleJa,
    titleZh: song.titleZh,
    series: song.series,
    primaryGenre: song.primaryGenre,
    energy: song.energy,
    valence: song.valence,
    isCover: song.isCover,
    firstYear: song.firstYear,
  }))
}

// 获取所有唯一标签
export function getAllTags(): string[] {
  const tags = new Set<string>()
  allSongs.forEach(song => {
    song.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

// 获取所有唯一年份
export function getAllYears(): number[] {
  const years = new Set<number>()
  allSongs.forEach(song => {
    years.add(song.firstYear)
  })
  return Array.from(years).sort((a, b) => a - b)
}

// 获取所有偶像（去重）
export function getAllIdols() {
  const idolMap = new Map<string, { id: string; nameJa: string; nameZh: string; series: Series[] }>()
  allSongs.forEach(song => {
    song.idols.forEach(idol => {
      if (idolMap.has(idol.id)) {
        const existing = idolMap.get(idol.id)!
        if (!existing.series.includes(song.series)) existing.series.push(song.series)
      } else {
        idolMap.set(idol.id, { ...idol, series: [song.series] })
      }
    })
  })
  return Array.from(idolMap.values())
}

// 根据偶像ID获取其所有歌曲
export function getSongsByIdol(idolId: string): Song[] {
  return allSongs.filter(song => song.idols.some(idol => idol.id === idolId))
}

// 获取偶像信息
export function getIdolById(idolId: string) {
  for (const song of allSongs) {
    const idol = song.idols.find(i => i.id === idolId)
    if (idol) return idol
  }
  return undefined
}

// 获取所有编曲人（去重）
export function getAllArrangers(): string[] {
  const arrangers = new Set<string>()
  allSongs.forEach(song => arrangers.add(song.arranger))
  return Array.from(arrangers).sort()
}

// 根据编曲人名获取其所有歌曲
export function getSongsByArranger(arranger: string): Song[] {
  return allSongs.filter(song => song.arranger === arranger)
}

// 时间线数据：按年份和风格统计曲目数
export function getTimelineData(seriesFilter?: Series) {
  const songs = seriesFilter ? getSongsBySeries(seriesFilter) : allSongs
  const years = Array.from(new Set(songs.map(s => s.firstYear))).sort((a, b) => a - b)
  const genres = Array.from(new Set(songs.map(s => s.primaryGenre)))
  return years.map(year => {
    const yearSongs = songs.filter(s => s.firstYear === year)
    const entry: Record<string, number | string> = { year }
    genres.forEach(genre => {
      entry[genre] = yearSongs.filter(s => s.primaryGenre === genre).length
    })
    return entry
  })
}

// 系列风格比例（用于雷达图）
export function getSeriesGenreRatio(series: Series) {
  const songs = getSongsBySeries(series)
  if (songs.length === 0) return {}
  const counts = songs.reduce((acc, song) => {
    acc[song.primaryGenre] = (acc[song.primaryGenre] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const ratio: Record<string, number> = {}
  Object.entries(counts).forEach(([genre, count]) => {
    ratio[genre] = Math.round((count / songs.length) * 100)
  })
  return ratio
}
