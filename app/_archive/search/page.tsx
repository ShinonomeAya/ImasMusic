'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { getAllSongs } from '@/lib/data'
import { getGenreConfig, getAllGenres } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { Search, X, Grid3X3, List, Filter, Music2 } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks'

const SERIES_OPTIONS = [
  { value: '765', label: '765AS' },
  { value: 'cinderella', label: 'CG' },
  { value: 'million', label: 'ML' },
  { value: 'shinycolors', label: 'SC' },
  { value: 'sidem', label: 'SM' },
]

const USAGE_OPTIONS = [
  { value: 'character', label: '角色曲' },
  { value: 'unit', label: '组合曲' },
  { value: 'event', label: '活动曲' },
  { value: 'theme', label: '主题曲' },
  { value: 'ingame', label: '游戏收录' },
  { value: 'cover', label: '翻唱曲' },
]

const SORT_OPTIONS = [
  { value: 'year', label: '年份' },
  { value: 'alphabet', label: '曲名' },
  { value: 'energy', label: '能量值' },
]

type SortType = 'year' | 'alphabet' | 'energy'

interface FilterChips {
  series: string[]
  genres: string[]
  yearRange: { min: number; max: number } | null
  usage: string[]
  isCover: boolean | null
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialTag = searchParams.get('tag') || ''

  const allSongs = getAllSongs()
  const allGenres = getAllGenres()

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  const [filters, setFilters] = useState<FilterChips>({
    series: [],
    genres: [],
    yearRange: null,
    usage: [],
    isCover: null,
  })

  const [viewMode, setViewMode] = useLocalStorage<'list' | 'grid'>('imas-db-search-view', 'list')
  const [sortBy, setSortBy] = useLocalStorage<SortType>('imas-db-search-sort', 'year')
  const [showFilters, setShowFilters] = useState(false)

  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (initialTag) {
      setQuery(`tag:${initialTag}`)
      setDebouncedQuery(`tag:${initialTag}`)
      if (typeof window !== 'undefined') {
        router.replace('/search', { scroll: false })
      }
    }
  }, [initialTag, router])

  const fuse = useMemo(() => new Fuse(allSongs, {
    keys: [
      { name: 'titleJa', weight: 2 },
      { name: 'titleZh', weight: 1.5 },
      { name: 'titleRomaji', weight: 1 },
      { name: 'idols.nameJa', weight: 1 },
      { name: 'idols.nameZh', weight: 0.5 },
      { name: 'tags', weight: 0.5 },
    ],
    threshold: 0.4,
  }), [allSongs])

  const searchResults = useMemo(() => {
    let results = allSongs

    if (debouncedQuery.trim()) {
      if (debouncedQuery.startsWith('tag:')) {
        const tag = debouncedQuery.slice(4)
        results = allSongs.filter(s => s.tags.includes(tag))
      } else {
        const fuseResults = fuse.search(debouncedQuery)
        results = fuseResults.map(r => r.item)
      }
    }

    if (filters.series.length) {
      results = results.filter(s => filters.series.includes(s.series))
    }
    if (filters.genres.length) {
      results = results.filter(s => filters.genres.includes(s.primaryGenre))
    }
    if (filters.yearRange) {
      results = results.filter(s => s.firstYear >= filters.yearRange!.min && s.firstYear <= filters.yearRange!.max)
    }
    if (filters.usage.length) {
      results = results.filter(s => filters.usage.includes(s.usage))
    }
    if (filters.isCover !== null) {
      results = results.filter(s => s.isCover === filters.isCover)
    }

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'year': return b.firstYear - a.firstYear
        case 'alphabet': return a.titleJa.localeCompare(b.titleJa)
        case 'energy': return b.energy - a.energy
        default: return 0
      }
    })

    return results
  }, [allSongs, debouncedQuery, fuse, filters, sortBy])

  const toggleFilter = (category: keyof FilterChips, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[]
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      return { ...prev, [category]: updated }
    })
  }

  const applyYearRange = () => {
    const min = parseInt(minYear) || 2005
    const max = parseInt(maxYear) || 2030
    if (min <= max) setFilters(prev => ({ ...prev, yearRange: { min, max } }))
  }

  const removeFilter = (category: keyof FilterChips, value?: string) => {
    setFilters(prev => {
      if (value && Array.isArray(prev[category])) {
        return { ...prev, [category]: (prev[category] as string[]).filter(v => v !== value) }
      }
      return { ...prev, [category]: Array.isArray(prev[category]) ? [] : null }
    })
  }

  const activeFilters = useMemo(() => {
    const chips: { category: keyof FilterChips; value: string; label: string }[] = []
    filters.series.forEach(s => {
      const config = getSeriesConfig(s as any)
      chips.push({ category: 'series', value: s, label: config?.shortName || s })
    })
    filters.genres.forEach(g => {
      const config = getGenreConfig(g as any)
      chips.push({ category: 'genres', value: g, label: config?.nameZh || g })
    })
    if (filters.yearRange) {
      chips.push({ category: 'yearRange', value: 'range', label: `${filters.yearRange.min}-${filters.yearRange.max}` })
    }
    filters.usage.forEach(u => {
      const option = USAGE_OPTIONS.find(o => o.value === u)
      chips.push({ category: 'usage', value: u, label: option?.label || u })
    })
    if (filters.isCover !== null) {
      chips.push({ category: 'isCover', value: String(filters.isCover), label: filters.isCover ? '翻唱' : '原创' })
    }
    return chips
  }, [filters])

  return (
    <main className="min-h-screen bg-parchment">
      <div className="container-claude px-4 py-8">
        <div className="mb-8">
          <h1
            className="text-2xl text-near-black mb-6 flex items-center gap-2 text-serif"
          >
            <Search className="w-6 h-6 text-terracotta" />
            搜索歌曲
          </h1>

          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-gray" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索曲名、偶像、标签..."
              className="w-full pl-12 pr-12 py-4 bg-ivory border border-border-cream rounded-xl text-near-black placeholder:text-stone-gray focus:outline-none focus:border-terracotta transition-colors shadow-ring"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-gray hover:text-near-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 控制栏 */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-ivory border-terracotta text-terracotta'
                  : 'bg-ivory border-border-cream text-olive-gray hover:border-border-warm'
              }`}
            >
              <Filter className="w-4 h-4" />
              筛选
              {activeFilters.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-terracotta text-white text-xs rounded-full">{activeFilters.length}</span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortType)}
              className="px-4 py-2 bg-ivory border border-border-cream rounded-lg text-olive-gray text-sm focus:outline-none focus:border-terracotta transition-colors"
            >
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>排序：{opt.label}</option>)}
            </select>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-ivory text-terracotta border border-border-cream'
                    : 'text-stone-gray hover:bg-ivory/60'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-ivory text-terracotta border border-border-cream'
                    : 'text-stone-gray hover:bg-ivory/60'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 筛选面板 */}
          {showFilters && (
            <div className="bg-ivory rounded-2xl p-6 border border-border-cream mb-4 space-y-6">
              <div>
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">系列</h3>
                <div className="flex flex-wrap gap-2">
                  {SERIES_OPTIONS.map(opt => {
                    const config = getSeriesConfig(opt.value as any)
                    const active = filters.series.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter('series', opt.value)}
                        className="px-3 py-1.5 rounded-full text-sm transition-colors border"
                        style={active
                          ? { backgroundColor: config?.color.light, color: 'white', borderColor: config?.color.light }
                          : { backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)', borderColor: 'var(--border-light)' }
                        }
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">曲风</h3>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map(genre => (
                    <button
                      key={genre.key}
                      onClick={() => toggleFilter('genres', genre.key)}
                      className="px-3 py-1.5 rounded-full text-sm transition-colors border"
                      style={filters.genres.includes(genre.key)
                        ? { backgroundColor: genre.color.light, color: 'white', borderColor: genre.color.light }
                        : { backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)', borderColor: 'var(--border-light)' }
                      }
                    >
                      {genre.nameZh}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">年份范围</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={minYear}
                    onChange={e => setMinYear(e.target.value)}
                    placeholder="2005"
                    className="w-24 px-3 py-2 bg-parchment border border-border-cream rounded-lg text-near-black text-sm focus:outline-none focus:border-terracotta"
                  />
                  <span className="text-stone-gray">-</span>
                  <input
                    type="number"
                    value={maxYear}
                    onChange={e => setMaxYear(e.target.value)}
                    placeholder="2030"
                    className="w-24 px-3 py-2 bg-parchment border border-border-cream rounded-lg text-near-black text-sm focus:outline-none focus:border-terracotta"
                  />
                  <button
                    onClick={applyYearRange}
                    className="btn-terracotta px-4 py-2 rounded-lg text-sm"
                  >
                    应用
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">用途</h3>
                <div className="flex flex-wrap gap-2">
                  {USAGE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilter('usage', opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                        filters.usage.includes(opt.value)
                          ? 'btn-terracotta'
                          : 'bg-parchment text-olive-gray border-border-cream'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">类型</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isCover: true }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.isCover === true ? 'btn-terracotta' : 'bg-parchment text-olive-gray border-border-cream'
                    }`}
                  >
                    仅翻唱
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isCover: false }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.isCover === false ? 'btn-terracotta' : 'bg-parchment text-olive-gray border-border-cream'
                    }`}
                  >
                    仅原创
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isCover: null }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      filters.isCover === null ? 'bg-near-black text-white border-near-black' : 'bg-parchment text-olive-gray border-border-cream'
                    }`}
                  >
                    全部
                  </button>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setFilters({ series: [], genres: [], yearRange: null, usage: [], isCover: null }); setMinYear(''); setMaxYear('') }}
                  className="text-sm text-terracotta hover:underline"
                >
                  清除所有筛选
                </button>
              )}
            </div>
          )}

          {/* 已选条件 */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-gray">已选条件：</span>
              {activeFilters.map((chip, idx) => (
                <span
                  key={`${chip.category}-${chip.value}-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-ivory text-near-black rounded-full text-sm border border-border-cream"
                >
                  {chip.label}
                  <button
                    onClick={() => removeFilter(chip.category, chip.value)}
                    className="text-stone-gray hover:text-terracotta transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-olive-gray">
            找到 <span className="font-medium text-near-black">{searchResults.length}</span> 首曲目
          </p>
        </div>

        {/* 结果列表 */}
        {searchResults.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {searchResults.map(song => {
              const genre = getGenreConfig(song.primaryGenre)
              const series = getSeriesConfig(song.series)
              return (
                <Link key={song.id} href={`/song/${song.id}`}>
                  <div
                    className={`p-4 bg-ivory rounded-2xl border border-border-cream hover:border-border-warm transition-all hover:shadow-whisper ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm shrink-0 mb-3"
                      style={{ backgroundColor: series?.color.light }}
                    >
                      {series?.shortName.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-near-black truncate">{song.titleJa}</h3>
                      <p className="text-sm text-stone-gray truncate">{song.titleZh}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-stone-gray">
                        <span
                          className="px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: `${genre?.color.light}` }}
                        >
                          {genre?.nameZh}
                        </span>
                        <span>·</span>
                        <span>{song.firstYear}</span>
                        {song.isCover && <><span>·</span><span className="text-terracotta">翻唱</span></>}
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'mt-3 pt-3 border-t border-border-cream' : ''}`}>
                      <div className="text-center">
                        <div className="w-8 h-1.5 rounded-full bg-border-warm mb-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${song.energy * 10}%`, backgroundColor: series?.color.light }}
                          />
                        </div>
                        <span className="text-xs text-stone-gray">能量 {song.energy}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Music2 className="w-16 h-16 text-border-warm mx-auto mb-4" />
            <p className="text-stone-gray">没有找到符合条件的曲目</p>
          </div>
        )}
      </div>
    </main>
  )
}
