'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SERIES_CONFIG } from '@/lib/series'
import type { Track, Release } from '@/types'
import { Search, Music, Clock, Calendar, Disc, ArrowUpDown, ArrowDownWideNarrow } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'
import TrackPlayButton from '@/components/TrackPlayButton'

type SortMode = 'newest' | 'oldest' | 'name' | 'bpm'

interface TrackListClientProps {
  tracks: Track[]
  releases: Release[]
}

export default function TrackListClient({ tracks, releases }: TrackListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [seriesFilter, setSeriesFilter] = useState<string>('ALL')
  const [sort, setSort] = useState<SortMode>('newest')

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

    // 企划筛选
    if (seriesFilter !== 'ALL') {
      result = result.filter((t) => {
        const release = releaseMap.get(t.releaseId)
        return release?.series === seriesFilter
      })
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
  }, [tracks, searchQuery, seriesFilter, sort, releaseMap])

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          全部单曲
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} 首收录曲目
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
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

        {/* Series Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeriesFilter('ALL')}
            className="px-3 py-2 rounded-comfortable text-sm font-medium transition-all"
            style={{
              backgroundColor: seriesFilter === 'ALL' ? 'var(--color-terracotta)' : 'var(--bg-surface)',
              color: seriesFilter === 'ALL' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            全部
          </button>
          {SERIES_CONFIG.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeriesFilter(s.id)}
              className="px-3 py-2 rounded-comfortable text-sm font-medium transition-all"
              style={{
                backgroundColor: seriesFilter === s.id ? s.brandColor : 'var(--bg-surface)',
                color: seriesFilter === s.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              {s.nameJa}
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
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
            没有找到匹配的曲目
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((track) => {
            const release = releaseMap.get(track.releaseId)
            const series = release ? seriesMap.get(release.series) : undefined
            const year = release?.releaseDate ? new Date(release.releaseDate).getFullYear() : null
            return (
              <TrackCard
                key={track.id}
                track={track}
                release={release}
                series={series}
                year={year}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function TrackCard({
  track,
  release,
  series,
  year,
}: {
  track: Track
  release?: Release
  series?: (typeof SERIES_CONFIG)[0]
  year: number | null
}) {
  return (
    <article
      className="group flex flex-col rounded-very overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      {/* Cover Area */}
      <div className="relative h-48 w-full overflow-hidden">
        {release?.coverUrl ? (
          <Image
            src={release.coverUrl}
            alt={track.titleJa}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
            <Music size={48} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-multiply"
          style={{
            background: series
              ? `linear-gradient(to top right, ${series.brandColor}40, transparent)`
              : 'linear-gradient(to top right, var(--color-terracotta)20, transparent)',
          }}
        />
        {/* Floating tags */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
          {series && (
            <span
              className="px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: `${series.brandColor}E6`,
                color: '#fff',
              }}
            >
              {series.nameJa}
            </span>
          )}
          {track.bpm && (
            <span
              className="px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: 'var(--text-primary)',
              }}
            >
              {track.bpm} BPM
            </span>
          )}
          {track.previewUrl && (
            <span
              className="px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(201,100,66,0.9)',
                color: '#fff',
              }}
            >
              可试听
            </span>
          )}
        </div>
        {/* Play button overlay */}
        {track.previewUrl && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <TrackPlayButton track={track} size="sm" coverUrl={release?.coverUrl} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <Link
            href={`/track/${track.id}`}
            className="text-subheading-sm font-serif font-medium leading-tight group-hover:text-terracotta transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {track.titleJa}
          </Link>
          <FavoriteButton
            item={{
              id: track.id,
              type: 'track',
              title: track.titleJa,
              subtitle: track.artistIds.join(', '),
              coverUrl: release?.coverUrl,
            }}
            size="sm"
          />
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {track.artistIds.join(', ')}
        </p>

        {/* Meta footer */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3">
            {year && (
              <span className="flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <Calendar size={12} />
                {year}
              </span>
            )}
            {release && (
              <span className="flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <Disc size={12} />
                <span className="truncate max-w-[120px]">{release.titleJa}</span>
              </span>
            )}
          </div>
          {track.durationSec && (
            <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <Clock size={12} />
              {formatTime(track.durationSec)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
