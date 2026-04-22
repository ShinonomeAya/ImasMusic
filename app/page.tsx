import Link from 'next/link'
import Image from 'next/image'
import { getAllTracks, getAllReleases, getSeriesStats } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import { Play } from 'lucide-react'
import TrackPlayButton from '@/components/TrackPlayButton'
import FavoriteButton from '@/components/FavoriteButton'

export const revalidate = 86400

export default async function HomePage() {
  const [tracks, releases] = await Promise.all([
    getAllTracks(),
    getAllReleases(),
  ])

  // 取最新 6 条发行物展示
  const featuredReleases = releases
    .filter((r) => r.releaseDate)
    .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
    .slice(0, 6)

  // 取有试听链接的曲目
  const playableTracks = tracks.filter((t) => t.previewUrl).slice(0, 8)

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* ── Hero ── */}
      <section className="mb-20 text-center">
        <h1 className="text-display font-serif font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
          THE IDOLM@STER
          <br />
          <span style={{ color: 'var(--color-terracotta)' }}>音乐数据库</span>
        </h1>
        <p className="text-body-lg max-w-2xl mb-8 mx-auto" style={{ color: 'var(--text-secondary)' }}>
          探索偶像大师全系列的歌曲、专辑、艺人与创作者。
          从 765PRO 到学园偶像大师，收录六大企划的完整音乐档案。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/releases"
            className="btn-terracotta gap-2"
          >
            <Play size={18} fill="currentColor" />
            浏览曲库
          </Link>
          <Link href="/explore" className="btn-sand">
            探索数据
          </Link>
        </div>
      </section>

      {/* ── 数据概览 ── */}
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="收录曲目" value={tracks.length} />
          <StatCard label="发行专辑" value={releases.length} />
          <StatCard label="企划数" value={6} />
          <StatCard label="可试听" value={tracks.filter((t) => t.previewUrl).length} />
        </div>
      </section>

      {/* ── 最新发行 ── */}
      {featuredReleases.length > 0 && (
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-section font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
              最新发行
            </h2>
            <Link
              href="/releases"
              className="text-sm font-medium hover:text-terracotta transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {featuredReleases.map((release) => (
              <Link
                key={release.id}
                href={`/release/${release.id}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-square rounded-very overflow-hidden bg-neutral-100 shadow-whisper group-hover:shadow-lg transition-all duration-300">
                  {release.coverUrl ? (
                    <Image
                      src={release.coverUrl}
                      alt={release.titleJa}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                      <span className="text-2xl" style={{ color: 'var(--text-tertiary)' }}>♪</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {release.titleJa}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {release.releaseDate ? new Date(release.releaseDate).getFullYear() : '未知年份'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 热门单曲 ── */}
      {playableTracks.length > 0 && (
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-section font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
              热门单曲
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {playableTracks.length} 首可试听
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {playableTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-very transition-all duration-200 hover:bg-opacity-50 cursor-pointer group"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <TrackPlayButton track={track} coverUrl={releases.find((r) => r.id === track.releaseId)?.coverUrl} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {track.titleJa}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {track.artistIds.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <FavoriteButton
                    item={{
                      id: track.id,
                      type: 'track',
                      title: track.titleJa,
                      subtitle: track.artistIds.join(', '),
                    }}
                    size="sm"
                  />
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {track.durationSec ? formatTime(track.durationSec) : '--:--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 企划卡片 ── */}
      <section className="mb-20">
        <h2 className="text-section font-serif font-medium mb-8" style={{ color: 'var(--text-primary)' }}>
          六大企划
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERIES_CONFIG.map((series) => (
            <Link
              key={series.id}
              href={`/series/${series.id}`}
              className="card-claude-featured p-6 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-10 h-10 rounded-generous mb-4 flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: series.brandColor }}
              >
                {series.nameJa.charAt(0)}
              </div>
              <h3 className="text-subheading-sm font-serif font-medium mb-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {series.nameJa}
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {series.nameZh}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="p-5 rounded-very text-center"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <p className="text-3xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-label uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
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
