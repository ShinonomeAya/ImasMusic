'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Track, Release } from '@/types'
import { Search, Disc, Music, User, X } from 'lucide-react'

interface SearchClientProps {
  tracks: Track[]
  releases: Release[]
}

export default function SearchClient({ tracks, releases }: SearchClientProps) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'releases'>('all')

  // Focus input on mount
  useEffect(() => {
    const input = document.getElementById('global-search') as HTMLInputElement
    input?.focus()
  }, [])

  const normalizedQuery = query.toLowerCase().trim()

  const filteredTracks = useMemo(() => {
    if (!normalizedQuery) return []
    return tracks.filter(
      (t) =>
        t.titleJa.toLowerCase().includes(normalizedQuery) ||
        t.titleRomaji?.toLowerCase().includes(normalizedQuery) ||
        t.titleZh?.toLowerCase().includes(normalizedQuery) ||
        t.artistIds.some((a) => a.toLowerCase().includes(normalizedQuery))
    )
  }, [tracks, normalizedQuery])

  const filteredReleases = useMemo(() => {
    if (!normalizedQuery) return []
    return releases.filter(
      (r) =>
        r.titleJa.toLowerCase().includes(normalizedQuery) ||
        r.titleRomaji?.toLowerCase().includes(normalizedQuery) ||
        r.titleZh?.toLowerCase().includes(normalizedQuery)
    )
  }, [releases, normalizedQuery])

  const hasResults = filteredTracks.length > 0 || filteredReleases.length > 0

  const showTracks = activeTab === 'all' || activeTab === 'tracks'
  const showReleases = activeTab === 'all' || activeTab === 'releases'

  return (
    <div className="px-4 md:px-8 py-10 max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          id="global-search"
          type="text"
          placeholder="搜索曲目、专辑、艺人..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 rounded-generous text-lg transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Tabs */}
      {normalizedQuery && (
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: `全部 (${filteredTracks.length + filteredReleases.length})` },
            { key: 'tracks', label: `曲目 (${filteredTracks.length})` },
            { key: 'releases', label: `专辑 (${filteredReleases.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-4 py-2 rounded-comfortable text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-terracotta)' : 'var(--bg-surface)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {!normalizedQuery ? (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
            输入关键词开始搜索
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
            支持日文、罗马音、中文检索
          </p>
        </div>
      ) : !hasResults ? (
        <div className="text-center py-20">
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
            未找到与 "{query}" 相关的结果
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Tracks */}
          {showTracks && filteredTracks.length > 0 && (
            <section>
              <h2 className="text-feature-title font-serif font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Music size={18} />
                曲目
              </h2>
              <div className="flex flex-col gap-2">
                {filteredTracks.map((track) => (
                  <Link
                    key={track.id}
                    href={`/track/${track.id}`}
                    className="flex items-center gap-4 p-3 rounded-very transition-all hover:ring-warm group"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="w-10 h-10 rounded-subtle flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                      <Music size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {track.titleJa}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {track.artistIds.join(', ')}
                      </p>
                    </div>
                    {track.durationSec && (
                      <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        {Math.floor(track.durationSec / 60)}:{(track.durationSec % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Releases */}
          {showReleases && filteredReleases.length > 0 && (
            <section>
              <h2 className="text-feature-title font-serif font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Disc size={18} />
                专辑
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredReleases.map((release) => (
                  <Link
                    key={release.id}
                    href={`/release/${release.id}`}
                    className="flex items-center gap-4 p-3 rounded-very transition-all hover:ring-warm group"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="relative w-14 h-14 rounded-comfortable overflow-hidden shrink-0">
                      {release.coverUrl ? (
                        <Image src={release.coverUrl} alt={release.titleJa} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                          <Disc size={20} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {release.titleJa}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {release.releaseDate ? release.releaseDate.slice(0, 4) : '未知年份'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
