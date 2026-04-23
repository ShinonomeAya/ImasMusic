'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SERIES_CONFIG } from '@/lib/series'
import type { Release, SeriesBrand } from '@/types'
import { Grid3X3, List, Table2, Search, Disc, Music, Layers } from 'lucide-react'

type ViewMode = 'grid' | 'list' | 'table'
type SortMode = 'newest' | 'oldest' | 'name'
type FilterType = 'ALL' | 'SINGLE' | 'ALBUM' | 'COMPILATION'

const TYPE_LABELS: Record<string, string> = {
  SINGLE: '单曲',
  ALBUM: '专辑',
  COMPILATION: '合集',
  EP: 'EP',
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  SINGLE: Music,
  ALBUM: Disc,
  COMPILATION: Layers,
  EP: Disc,
}

export default function ReleaseList({
  releases,
  seriesFilter,
}: {
  releases: Release[]
  seriesFilter?: SeriesBrand
}) {
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortMode>('newest')
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const filtered = useMemo(() => {
    let result = [...releases]

    // 类型筛选
    if (filterType !== 'ALL') {
      result = result.filter((r) => r.type === filterType)
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.titleJa.toLowerCase().includes(q) ||
          r.titleRomaji?.toLowerCase().includes(q) ||
          r.titleZh?.toLowerCase().includes(q)
      )
    }

    // 排序
    result.sort((a, b) => {
      if (sort === 'newest') {
        const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return db - da
      }
      if (sort === 'oldest') {
        const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return da - db
      }
      return a.titleJa.localeCompare(b.titleJa, 'ja')
    })

    return result
  }, [releases, filterType, searchQuery, sort])

  const seriesColor = seriesFilter
    ? SERIES_CONFIG.find((s) => s.id === seriesFilter)?.brandColor
    : undefined

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {seriesFilter
            ? SERIES_CONFIG.find((s) => s.id === seriesFilter)?.nameJa
            : '全部发行'}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} 张发行物
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="搜索发行物..."
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

        {/* Type Filter */}
        <div className="flex gap-1">
          {(['ALL', 'SINGLE', 'ALBUM', 'COMPILATION'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-3 py-2 rounded-comfortable text-sm font-medium transition-all"
              style={{
                backgroundColor: filterType === t ? (seriesColor || 'var(--color-terracotta)') : 'var(--bg-surface)',
                color: filterType === t ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              {t === 'ALL' ? '全部' : TYPE_LABELS[t]}
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
          <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
            没有找到匹配的发行物
          </p>
        </div>
      ) : view === 'grid' ? (
        <GridView releases={filtered} seriesColor={seriesColor} />
      ) : view === 'list' ? (
        <ListView releases={filtered} seriesColor={seriesColor} />
      ) : (
        <TableView releases={filtered} />
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

function GridView({ releases, seriesColor }: { releases: Release[]; seriesColor?: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {releases.map((release) => {
        const TypeIcon = TYPE_ICONS[release.type] || Disc
        const year = release.releaseDate ? new Date(release.releaseDate).getFullYear() : null
        return (
          <Link
            key={release.id}
            href={`/release/${release.id}`}
            className="group flex flex-col gap-3"
          >
            <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper group-hover:shadow-whisper group-hover:-translate-y-0.5 transition-all duration-300">
              {release.coverUrl ? (
                <Image
                  src={release.coverUrl}
                  alt={release.titleJa}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <TypeIcon size={32} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span
                  className="px-2 py-0.5 rounded-subtle text-micro font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: seriesColor || 'var(--color-terracotta)',
                    color: '#fff',
                  }}
                >
                  {TYPE_LABELS[release.type] || release.type}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {release.titleJa}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {year || '未知年份'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ListView({ releases, seriesColor }: { releases: Release[]; seriesColor?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {releases.map((release) => {
        const TypeIcon = TYPE_ICONS[release.type] || Disc
        const year = release.releaseDate ? new Date(release.releaseDate).getFullYear() : null
        return (
          <Link
            key={release.id}
            href={`/release/${release.id}`}
            className="flex items-center gap-4 p-3 rounded-very transition-all duration-200 hover:ring-warm group"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="relative w-16 h-16 rounded-comfortable overflow-hidden shrink-0">
              {release.coverUrl ? (
                <Image src={release.coverUrl} alt={release.titleJa} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <TypeIcon size={20} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {release.titleJa}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {TYPE_LABELS[release.type]} · {year || '未知年份'}
              </p>
            </div>
            <span
              className="px-2 py-1 rounded-subtle text-micro font-medium uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: seriesColor || 'var(--color-terracotta)',
                color: '#fff',
              }}
            >
              {TYPE_LABELS[release.type] || release.type}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function TableView({ releases }: { releases: Release[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-prominent)' }}>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>名称</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>类型</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>发行日</th>
            <th className="py-3 px-4 text-label uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>厂牌</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release) => (
            <tr
              key={release.id}
              className="transition-colors hover:bg-opacity-50 cursor-pointer"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <td className="py-3 px-4">
                <Link href={`/release/${release.id}`} className="text-sm font-medium hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {release.titleJa}
                </Link>
              </td>
              <td className="py-3 px-4">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{TYPE_LABELS[release.type]}</span>
              </td>
              <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {release.releaseDate ? release.releaseDate.slice(0, 10) : '-'}
              </td>
              <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {release.label || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
