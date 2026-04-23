import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getReleasesBySeries, getTracksBySeries, getSeriesStats } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import type { SeriesBrand } from '@/types'
import { Disc, Music, Calendar, BarChart3 } from 'lucide-react'

export const revalidate = 86400

export async function generateStaticParams() {
  return SERIES_CONFIG.map((s) => ({ id: s.id }))
}

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const series = SERIES_CONFIG.find((s) => s.id === id)
  if (!series) notFound()

  const brandId = id as SeriesBrand
  const [releases, tracks, stats] = await Promise.all([
    getReleasesBySeries(brandId),
    getTracksBySeries(brandId),
    getSeriesStats(brandId),
  ])

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* ── Hero ── */}
      <section className="mb-16">
        <div
          className="w-16 h-16 rounded-generous mb-6 flex items-center justify-center text-white text-2xl font-medium"
          style={{ backgroundColor: series.brandColor }}
        >
          {series.nameJa.charAt(0)}
        </div>
        <h1 className="text-display font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          {series.nameJa}
        </h1>
        <p className="text-body-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          {series.nameZh} · {series.nameEn}
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Disc}
            label="发行专辑"
            value={stats.totalReleases}
            accent={series.brandColor}
          />
          <StatCard
            icon={Music}
            label="收录曲目"
            value={stats.totalTracks}
            accent={series.brandColor}
          />
          <StatCard
            icon={Calendar}
            label="发行年份范围"
            value={Object.keys(stats.yearCounts).length > 0
              ? `${Math.min(...Object.keys(stats.yearCounts).map(Number))}-${Math.max(...Object.keys(stats.yearCounts).map(Number))}`
              : '—'}
            accent={series.brandColor}
          />
          <StatCard
            icon={BarChart3}
            label="可试听"
            value={tracks.filter((t) => t.previewUrl).length}
            accent={series.brandColor}
          />
        </div>
      </section>

      {/* ── Releases ── */}
      {releases.length > 0 && (
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-subheading font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
              发行物
            </h2>
            <Link
              href={`/releases?series=${series.id}`}
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: series.brandColor }}
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {releases.slice(0, 8).map((release) => (
              <Link
                key={release.id}
                href={`/release/${release.id}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper group-hover:shadow-whisper group-hover:-translate-y-0.5 transition-all">
                  {release.coverUrl ? (
                    <Image
                      src={release.coverUrl}
                      alt={release.titleJa}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="25vw"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-interactive)' }}
                    >
                      <Disc size={32} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  )}
                </div>
                <p
                  className="text-sm font-medium line-clamp-2 group-hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {release.titleJa}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {release.releaseDate ? new Date(release.releaseDate).getFullYear() : '未知年份'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Tracks ── */}
      {tracks.length > 0 && (
        <section>
          <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
            曲目
          </h2>
          <div className="flex flex-col gap-1">
            {tracks.slice(0, 12).map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center gap-4 px-4 py-3 rounded-comfortable transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <span
                  className="w-6 text-center text-sm font-mono"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {track.titleJa}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {track.artistIds.join(', ')}
                  </p>
                </div>
                {track.durationSec && (
                  <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {formatTime(track.durationSec)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div
      className="p-5 rounded-very text-center"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <Icon size={20} className="mx-auto mb-2" style={{ color: accent }} />
      <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-micro uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
