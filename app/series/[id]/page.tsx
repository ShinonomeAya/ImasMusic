'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSeriesConfig } from '@/styles/series.config'
import { getGenreConfig } from '@/styles/genres.config'
import { getSongsBySeries, getStatsBySeries } from '@/lib/data'
import { Music2, Filter, X, ArrowUpDown } from 'lucide-react'

export default function SeriesPage() {
  const params = useParams()
  const seriesId = params.id as string
  const series = getSeriesConfig(seriesId as any)
  const songs = getSongsBySeries(seriesId as any)
  const stats = getStatsBySeries(seriesId as any)

  const [filterAlbum, setFilterAlbum] = useState('全部')
  const [filterYear, setFilterYear] = useState('全部')
  const [filterGenre, setFilterGenre] = useState('全部')
  const [filterComposer, setFilterComposer] = useState('全部')
  const [filterLyricist, setFilterLyricist] = useState('全部')
  const [filterArranger, setFilterArranger] = useState('全部')

  const [sortKey, setSortKey] = useState<'year' | 'title' | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  if (!series) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">
            系列不存在
          </h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  // Extract unique filter options
  const albumOptions = useMemo(() => {
    const set = new Set<string>()
    songs.forEach(s => s.releases.forEach(r => set.add(r.album)))
    return ['全部', ...Array.from(set).sort()]
  }, [songs])

  const yearOptions = useMemo(() => {
    const set = new Set<number>()
    songs.forEach(s => set.add(s.firstYear))
    return ['全部', ...Array.from(set).sort((a, b) => b - a).map(String)]
  }, [songs])

  const genreOptions = useMemo(() => {
    const set = new Set<string>()
    songs.forEach(s => set.add(s.primaryGenre))
    return ['全部', ...Array.from(set).sort()]
  }, [songs])

  const composerOptions = useMemo(() => {
    const set = new Set<string>()
    songs.forEach(s => set.add(s.composer))
    return ['全部', ...Array.from(set).sort()]
  }, [songs])

  const lyricistOptions = useMemo(() => {
    const set = new Set<string>()
    songs.forEach(s => set.add(s.lyricist))
    return ['全部', ...Array.from(set).sort()]
  }, [songs])

  const arrangerOptions = useMemo(() => {
    const set = new Set<string>()
    songs.forEach(s => set.add(s.arranger))
    return ['全部', ...Array.from(set).sort()]
  }, [songs])

  const hasActiveFilters =
    filterAlbum !== '全部' ||
    filterYear !== '全部' ||
    filterGenre !== '全部' ||
    filterComposer !== '全部' ||
    filterLyricist !== '全部' ||
    filterArranger !== '全部'

  const clearFilters = () => {
    setFilterAlbum('全部')
    setFilterYear('全部')
    setFilterGenre('全部')
    setFilterComposer('全部')
    setFilterLyricist('全部')
    setFilterArranger('全部')
  }

  const filteredSongs = useMemo(() => {
    let result = songs.filter(song => {
      const albumMatch = filterAlbum === '全部' || song.releases.some(r => r.album === filterAlbum)
      const yearMatch = filterYear === '全部' || song.firstYear.toString() === filterYear
      const genreMatch = filterGenre === '全部' || song.primaryGenre === filterGenre
      const composerMatch = filterComposer === '全部' || song.composer === filterComposer
      const lyricistMatch = filterLyricist === '全部' || song.lyricist === filterLyricist
      const arrangerMatch = filterArranger === '全部' || song.arranger === filterArranger
      return albumMatch && yearMatch && genreMatch && composerMatch && lyricistMatch && arrangerMatch
    })

    if (sortKey === 'year') {
      result = result.sort((a, b) => sortDir === 'asc' ? a.firstYear - b.firstYear : b.firstYear - a.firstYear)
    } else if (sortKey === 'title') {
      result = result.sort((a, b) => sortDir === 'asc' ? a.titleJa.localeCompare(b.titleJa) : b.titleJa.localeCompare(a.titleJa))
    }

    return result
  }, [songs, filterAlbum, filterYear, filterGenre, filterComposer, filterLyricist, filterArranger, sortKey, sortDir])

  const toggleSort = (key: 'year' | 'title') => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const FilterSelect = ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string
    value: string
    options: string[]
    onChange: (v: string) => void
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-stone-gray tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-ivory border border-border-cream text-sm text-near-black focus:outline-none focus:ring-1 focus:ring-ring-warm cursor-pointer"
      >
        {options.map(opt => {
          const labelText = opt === '全部' ? '全部' : getGenreConfig(opt as any)?.nameZh || opt
          return <option key={opt} value={opt}>{labelText}</option>
        })}
      </select>
    </div>
  )

  return (
    <main className="min-h-screen bg-parchment">
      {/* 头部 */}
      <div className="py-12 px-4 border-b border-border-warm" style={{ backgroundColor: `${series.color.light}12` }}>
        <div className="container-claude">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
            style={{ backgroundColor: series.color.light }}
          >
            {series.shortName}
          </span>
          <h1
            className="text-4xl text-near-black mb-2 text-serif"
            style={{ lineHeight: 1.2 }}
          >
            {series.nameZh}
          </h1>
          <p className="text-lg text-olive-gray mb-4">{series.nameJa}</p>
          <p className="text-olive-gray max-w-2xl leading-relaxed">{series.description}</p>
          <div className="flex gap-6 mt-6 text-sm">
            <div>
              <span className="text-stone-gray">始于</span>
              <span className="ml-2 font-medium text-near-black">{series.yearStarted}</span>
            </div>
            <div>
              <span className="text-stone-gray">偶像数</span>
              <span className="ml-2 font-medium text-near-black">{series.totalIdols}人</span>
            </div>
            <div>
              <span className="text-stone-gray">曲目数</span>
              <span className="ml-2 font-medium text-near-black">{stats.totalSongs}首</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-claude py-8">
        {/* 筛选器 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-terracotta" />
            <h2 className="text-lg font-medium text-near-black text-serif">筛选曲目</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs text-stone-gray hover:text-terracotta transition-colors"
              >
                <X className="w-3 h-3" />
                清除筛选
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <FilterSelect label="专辑" value={filterAlbum} options={albumOptions} onChange={setFilterAlbum} />
            <FilterSelect label="发行年代" value={filterYear} options={yearOptions} onChange={setFilterYear} />
            <FilterSelect label="主要风格" value={filterGenre} options={genreOptions} onChange={setFilterGenre} />
            <FilterSelect label="作曲" value={filterComposer} options={composerOptions} onChange={setFilterComposer} />
            <FilterSelect label="作词" value={filterLyricist} options={lyricistOptions} onChange={setFilterLyricist} />
            <FilterSelect label="编曲" value={filterArranger} options={arrangerOptions} onChange={setFilterArranger} />
          </div>

          {hasActiveFilters && (
            <p className="mt-3 text-xs text-stone-gray">
              共筛选出 <span className="font-medium text-near-black">{filteredSongs.length}</span> 首曲目
            </p>
          )}
        </div>

        {/* 曲目表格 */}
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-terracotta" />
          <h2 className="text-xl text-near-black text-serif">曲目列表</h2>
          <span className="text-sm text-stone-gray ml-2">{filteredSongs.length} 首</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border-cream bg-ivory" style={{ boxShadow: 'rgba(0,0,0,0.03) 0px 2px 12px' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-warm">
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[28%]">曲名</th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[16%]">专辑</th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[10%] cursor-pointer select-none" onClick={() => toggleSort('year')}>
                  <span className="inline-flex items-center gap-1">
                    年代
                    <ArrowUpDown className={`w-3 h-3 ${sortKey === 'year' ? 'text-terracotta' : 'text-stone-gray'}`} />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[14%]">风格</th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[12%]">作曲</th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[12%]">作词</th>
                <th className="text-left px-4 py-3 font-medium text-stone-gray text-xs tracking-wide w-[10%]">编曲</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map(song => {
                const genre = getGenreConfig(song.primaryGenre)
                const primaryAlbum = song.releases[0]?.album || '-'
                return (
                  <tr
                    key={song.id}
                    className="border-b border-border-cream last:border-0 hover:bg-parchment transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/song/${song.id}`} className="block group">
                        <div className="font-medium text-near-black group-hover:text-terracotta transition-colors truncate">
                          {song.titleJa}
                        </div>
                        <div className="text-xs text-stone-gray truncate">{song.titleZh}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-gray truncate">{primaryAlbum}</td>
                    <td className="px-4 py-3 text-stone-gray">{song.firstYear}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs text-olive-gray border border-border-cream bg-parchment">
                        {genre?.nameZh || song.primaryGenre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-gray truncate">{song.composer}</td>
                    <td className="px-4 py-3 text-stone-gray truncate">{song.lyricist}</td>
                    <td className="px-4 py-3 text-stone-gray truncate">{song.arranger}</td>
                  </tr>
                )
              })}
              {filteredSongs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-gray">
                    没有符合筛选条件的曲目
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
