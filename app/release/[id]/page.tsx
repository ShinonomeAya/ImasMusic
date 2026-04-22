import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getReleaseById, getTracksByRelease, getReleasesBySeries } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import TrackPlayButton from '@/components/TrackPlayButton'
import FavoriteButton from '@/components/FavoriteButton'
import { Disc, Calendar, Barcode, Building2, Music, Clock } from 'lucide-react'

export const revalidate = 86400

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const release = await getReleaseById(id)
  if (!release) notFound()

  const tracks = await getTracksByRelease(id)
  const series = SERIES_CONFIG.find((s) => s.id === release.series)
  const year = release.releaseDate ? new Date(release.releaseDate).getFullYear() : null

  // 相似推荐：同企划的其他发行
  const related = (await getReleasesBySeries(release.series))
    .filter((r) => r.id !== release.id)
    .slice(0, 4)

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row gap-10 mb-16">
        {/* Cover */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper">
            {release.coverUrl ? (
              <Image
                src={release.coverUrl}
                alt={release.titleJa}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                <Disc size={64} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center">
          {series && (
            <Link
              href={`/releases?series=${series.id}`}
              className="inline-flex items-center gap-2 mb-4 w-fit"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: series.brandColor }}
              />
              <span className="text-sm font-medium" style={{ color: series.brandColor }}>
                {series.nameJa}
              </span>
            </Link>
          )}

          <h1 className="text-subheading-lg font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            {release.titleJa}
          </h1>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
            {release.releaseDate && (
              <MetaItem icon={Calendar} label="发行日期" value={release.releaseDate.slice(0, 10)} />
            )}
            {year && (
              <MetaItem icon={Calendar} label="年份" value={String(year)} />
            )}
            {release.label && (
              <MetaItem icon={Building2} label="厂牌" value={release.label} />
            )}
            {release.catalogNumber && (
              <MetaItem icon={Barcode} label="Catalog" value={release.catalogNumber} />
            )}
            {release.format && (
              <MetaItem icon={Disc} label="格式" value={release.format} />
            )}
            <MetaItem icon={Music} label="收录曲数" value={`${tracks.length} 首`} />
          </div>

          {/* Apple Music Link */}
          {release.appleMusicUrl && (
            <a
              href={release.appleMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terracotta w-fit gap-2"
            >
              <Music size={16} />
              在 Apple Music 查看
            </a>
          )}
        </div>
      </section>

      {/* ── Tracklist ── */}
      {tracks.length > 0 && (
        <section className="mb-16">
          <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
            收录曲目
          </h2>
          <div className="flex flex-col gap-1">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center gap-3 px-4 py-3 rounded-comfortable transition-colors hover:bg-opacity-50 group"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <span className="w-6 text-center text-sm font-mono shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                  {idx + 1}
                </span>
                {track.previewUrl && (
                  <TrackPlayButton track={track} size="sm" coverUrl={release.coverUrl} />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/track/${track.id}`}
                    className="text-sm font-medium truncate hover:text-terracotta transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {track.titleJa}
                  </Link>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {track.artistIds.join(', ')}
                  </p>
                </div>
                <FavoriteButton
                  item={{
                    id: track.id,
                    type: 'track',
                    title: track.titleJa,
                    subtitle: track.artistIds.join(', '),
                  }}
                  size="sm"
                />
                {track.bpm && (
                  <span className="text-xs font-mono px-2 py-1 rounded-sharp shrink-0" style={{ backgroundColor: 'var(--bg-interactive)', color: 'var(--text-secondary)' }}>
                    {track.bpm} BPM
                  </span>
                )}
                {track.durationSec && (
                  <span className="text-xs font-mono flex items-center gap-1 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    <Clock size={12} />
                    {formatTime(track.durationSec)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Related ── */}
      {related.length > 0 && (
        <section>
          <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
            同企划推荐
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((r) => (
              <Link key={r.id} href={`/release/${r.id}`} className="group flex flex-col gap-3">
                <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper group-hover:shadow-lg transition-all">
                  {r.coverUrl ? (
                    <Image
                      src={r.coverUrl}
                      alt={r.titleJa}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                      <Disc size={32} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {r.titleJa}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
      <div>
        <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
