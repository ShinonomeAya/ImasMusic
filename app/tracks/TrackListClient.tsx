'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { SERIES_CONFIG } from '@/lib/series'
import type { Track, Release, SeriesBrand } from '@/types'
import { Grid3X3, List, Table2, Search, Music, Clock } from 'lucide-react'

type ViewMode = 'grid' | 'list' | 'table'
type SortMode = 'newest' | 'oldest' | 'name' | 'bpm'
type PlayableFilter = 'ALL' | 'PLAYABLE'

interface TrackListClientProps {
  tracks: Track[]
  releases: Release[]
}

export default function TrackListClient({ tracks, releases }: TrackListClientProps) {
  const searchParams = useSearchParams()
  const seriesFilter = searchParams.get('series') as SeriesBrand | undefined

  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortMode>('newest')
  const [playableFilter, setPlayableFilter] = useState<PlayableFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const releaseMap = useMemo(() => {
    const map = new Map<string, Release>()
    for (const r of releases) map.set(r.id, r)
    return map
  }, [releases])

  const seriesMap = useMemo(() => {
    const map = new Map<string, (typeof SERIES_CONFIG)[0]>()
    for (const s of SERIES_CONFIG) map.set(s.id, s)
    return map
  }, [])

  const filtered = useMemo(() => {
    let result = [...tracks]

    // 系列筛选
    if (seriesFilter) {
      result = result.filter((t) => releaseMap.get(t.releaseId)?.series === seriesFilter)
    }

    // 可试听筛选
    if (playableFilter === 'PLAYABLE') {
      result = result.filter((t) => t.previewUrl)
    }

    // 关键词筛选
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.titleJa.toLowerCase().includes(q) ||
          t.titleRomaji?.toLowerCase().includes(q) ||
          t.titleZh?.toLowerCase().includes(q) ||
          t.artistIds.some((a) => a.toLowerCase().includes(q))
      )
    }

    // 排序
    result.sort((a, b) => {
      if (sort === 'name') {
        return a.titleJa.localeCompare(b.titleJa, 'ja')
      }
      if (sort === 'bpm') {
        return (b.bpm || 0) - (a.bpm || 0)
      }
      const ra = releaseMap.get(a.releaseId)
      const rb = releaseMap.get(b.releaseId)
      const da = ra?.releaseDate ? new Date(ra.releaseDate).getTime() : 0
      const db = rb?.releaseDate ? new Date(rb.releaseDate).getTime() : 0
      if (sort === 'newest') return db - da
      return da - db
    })

    return result
  }, [tracks, seriesFilter, playableFilter, searchQuery, sort, releaseMap])

  const seriesColor = seriesFilter
    ? SERIES_CONFIG.find((s) => s.id === seriesFilter)?.brandColor
    : undefined

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {seriesFilter
            ? SERIES_CONFIG.find((s) => s.id === seriesFilter)?.nameJa
            : '全部单曲'}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} 首收录曲目
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="搜索曲名、艺人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-generous text-sm transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Playable Filter */}
        <div className="flex gap-1">
          {(['ALL', 'PLAYABLE'] as PlayableFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setPlayableFilter(t)}
              className="px-3 py-2 rounded-comfortable text-sm font-medium transition-all"
              style={{
                backgroundColor: playableFilter === t ? (seriesColor || 'var(--color-terracotta)') : 'var(--bg-surface)',
                color: playableFilter === t ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              {t === 'ALL' ? '全部' : '可试听'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="px-3 py-2.5 rounded-comfortable text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="newest">最新发行</option>
          <option value="oldest">最早发行</option>
          <option value="name">名称排序</option>
          <option value="bpm">BPM 排序</option>
        </select>

        {/* View Toggle */}
        <div className="flex gap-1 rounded-comfortable p-1" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <ViewBtn mode="grid" current={view} set={setView} icon={Grid3X3} />
          <ViewBtn mode="list" current={view} set={setView} icon={List} />
          <ViewBtn mode="table" current={view} set={setView} icon={Table2} />
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
            没有找到匹配的曲目
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView tracks={filtered} releaseMap={releaseMap} seriesMap={seriesMap} seriesColor={seriesColor} />
      ) : view === 'list' ? (
        <ListView tracks={filtered} releaseMap={releaseMap} seriesMap={seriesMap} seriesColor={seriesColor} />
      ) : (
        <TableView tracks={filtered} releaseMap={releaseMap} />
      )}
    </div>
  )
}

function ViewBtn({
  mode,
  current,
  set,
  icon: Icon,
}: {
  mode: ViewMode
  current: ViewMode
  set: (m: ViewMode) => void
  icon: React.ElementType
}) {
  return (
    <button
      onClick={() => set(mode)}
      className="p-2 rounded-subtle transition-all"
      style={{
        backgroundColor: current === mode ? 'var(--bg-interactive)' : 'transparent',
        color: current === mode ? 'var(--text-primary)' : 'var(--text-tertiary)',
      }}
    >
      <Icon size={16} />
    </button>
  )
}

function GridView({
  tracks,
  releaseMap,
  seriesMap,
  seriesColor,
}: {
  tracks: Track[]
  releaseMap: Map<string, Release>
  seriesMap: Map<string, (typeof SERIES_CONFIG)[0]>
  seriesColor?: string
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tracks.map((track) => {
        const release = releaseMap.get(track.releaseId)
        const series = release ? seriesMap.get(release.series) : undefined
        return (
          <Link
            key={track.id}
            href={`/track/${track.id}`}
            className="group flex flex-col gap-3"
          >
            <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper group-hover:shadow-whisper group-hover:-translate-y-0.5 transition-all duration-300">
              {release?.coverUrl ? (
                <Image
                  src={release.coverUrl}
                  alt={track.titleJa}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <Music size={32} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span
                  className="px-2 py-0.5 rounded-subtle text-micro font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: seriesColor || series?.brandColor || 'var(--color-terracotta)',
                    color: '#fff',
                  }}
                >
                  {series?.nameJa || (track.previewUrl ? '可试听' : '单曲')}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {track.titleJa}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {track.artistIds.join(', ')}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ListView({
  tracks,
  releaseMap,
  seriesMap,
  seriesColor,
}: {
  tracks: Track[]
  releaseMap: Map<string, Release>
  seriesMap: Map<string, (typeof SERIES_CONFIG)[0]>
  seriesColor?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {tracks.map((track) => {
        const release = releaseMap.get(track.releaseId)
        const series = release ? seriesMap.get(release.series) : undefined
        return (
          <Link
            key={track.id}
            href={`/track/${track.id}`}
            className="flex items-center gap-4 p-3 rounded-very transition-all duration-200 hover:ring-warm group"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="relative w-16 h-16 rounded-comfortable overflow-hidden shrink-0">
              {release?.coverUrl ? (
                <Image src={release.coverUrl} alt={track.titleJa} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <Music size={20} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {track.titleJa}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {track.artistIds.join(', ')}
              </p>
            </div>
            <span
              className="px-2 py-1 rounded-subtle text-micro font-medium uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: seriesColor || series?.brandColor || 'var(--color-terracotta)',
                color: '#fff',
              }}
            >
              {track.bpm ? `${track.bpm} BPM` : (track.previewUrl ? '可试听' : '单曲')}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function TableView({
  tracks,
  releaseMap,
}: {
  tracks: Track[]
  releaseMap: Map<string, Release>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-prominent)' }}>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>名称</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>艺人</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>BPM</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>时长</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>所属专辑</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => {
            const release = releaseMap.get(track.releaseId)
            return (
              <tr
                key={track.id}
                className="transition-colors hover:bg-opacity-50 cursor-pointer"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/track/${track.id}`}
                    className="text-sm font-medium hover:text-terracotta transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {track.titleJa}
                  </Link>
                </td>
                <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {track.artistIds.join(', ')}
                </td>
                <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {track.bpm || '-'}
                </td>
                <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {track.durationSec ? formatTime(track.durationSec) : '--:--'}
                </td>
                <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {release?.titleJa || '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
