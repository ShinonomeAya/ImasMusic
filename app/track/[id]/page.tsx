import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTrackById, getReleaseById, getTracksBySeries } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import TrackPlayButton from '@/components/TrackPlayButton'
import FavoriteButton from '@/components/FavoriteButton'
import { Clock, Music, Disc, ArrowLeft } from 'lucide-react'

export const revalidate = 86400

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const track = await getTrackById(id)
  if (!track) notFound()

  const release = await getReleaseById(track.releaseId)
  const series = release ? SERIES_CONFIG.find((s) => s.id === release.series) : undefined

  // 相似推荐：同企划的其他曲目
  const relatedTracks = release
    ? (await getTracksBySeries(release.series))
        .filter((t) => t.id !== track.id)
        .slice(0, 6)
    : []

  // 相似曲目的封面
  const relatedReleases = await Promise.all(
    relatedTracks.map((t) => getReleaseById(t.releaseId))
  )
  const relatedCoverMap = new Map(
    relatedReleases.filter(Boolean).map((r) => [r!.id, r!.coverUrl])
  )

  // Credits 格式化
  const creditMap: Record<string, string[]> = {}
  for (const credit of track.credits || []) {
    if (!creditMap[credit.role]) creditMap[credit.role] = []
    creditMap[credit.role].push(credit.artistId)
  }

  const ROLE_LABELS: Record<string, string> = {
    VOCALS: '演唱',
    COMPOSER: '作曲',
    LYRICIST: '作词',
    ARRANGER: '编曲',
  }

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {/* ── Back Link ── */}
      <div className="mb-6">
        <Link
          href={release ? `/release/${release.id}` : '/releases'}
          className="inline-flex items-center gap-2 text-sm transition-colors hover:text-terracotta"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ArrowLeft size={16} />
          {release ? '返回专辑' : '浏览曲库'}
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row gap-10 items-start mb-20">
        {/* Cover */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="relative aspect-square rounded-very overflow-hidden shadow-whisper">
            {release?.coverUrl ? (
              <Image
                src={release.coverUrl}
                alt={track.titleJa}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                <Music size={64} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center pt-4">
          {/* Tags */}
          <div className="flex items-center gap-3 mb-4">
            {series && (
              <Link
                href={`/series/${series.id}`}
                className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
                style={{ backgroundColor: `${series.brandColor}15`, color: series.brandColor }}
              >
                {series.nameJa}
              </Link>
            )}
            {release && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
                style={{ backgroundColor: 'var(--bg-interactive)', color: 'var(--text-secondary)' }}
              >
                {release.type === 'SINGLE' ? '单曲' : release.type === 'ALBUM' ? '专辑' : release.type === 'EP' ? 'EP' : '合集'} 收录
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-subheading-lg font-serif font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            {track.titleJa}
          </h1>

          {/* Artists */}
          <p className="text-body-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {track.artistIds.join(', ')}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {track.previewUrl && (
              <TrackPlayButton track={track} coverUrl={release?.coverUrl} />
            )}
            <FavoriteButton
              item={{
                id: track.id,
                type: 'track',
                title: track.titleJa,
                subtitle: track.artistIds.join(', '),
                coverUrl: release?.coverUrl,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
        {/* Credits Panel */}
        <aside className="col-span-1 flex flex-col gap-8">
          <div
            className="rounded-very p-6"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <h3 className="text-subheading-sm font-serif font-medium mb-5" style={{ color: 'var(--text-primary)' }}>
              Credits
            </h3>
            {Object.keys(creditMap).length > 0 ? (
              <div className="flex flex-col gap-4">
                {Object.entries(creditMap).map(([role, names]) => (
                  <div key={role} className="flex justify-between items-baseline border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {ROLE_LABELS[role] || role}
                    </span>
                    <span className="text-sm font-medium text-right" style={{ color: 'var(--text-primary)' }}>
                      {names.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                暂无 Credits 数据
              </p>
            )}
          </div>

          {/* Technical Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-very p-5 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <Clock size={20} className="mb-2" style={{ color: 'var(--color-terracotta)' }} />
              <span className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {track.durationSec ? formatTime(track.durationSec) : '—'}
              </span>
              <span className="text-micro uppercase tracking-widest mt-1" style={{ color: 'var(--text-tertiary)' }}>
                时长
              </span>
            </div>
            <div
              className="rounded-very p-5 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <Music size={20} className="mb-2" style={{ color: 'var(--color-terracotta)' }} />
              <span className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {track.bpm || '—'}
              </span>
              <span className="text-micro uppercase tracking-widest mt-1" style={{ color: 'var(--text-tertiary)' }}>
                BPM
              </span>
            </div>
            {track.key !== undefined && (
              <div
                className="rounded-very p-5 flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <Disc size={20} className="mb-2" style={{ color: 'var(--color-terracotta)' }} />
                <span className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                  {musicalKeyToString(track.key)}{track.mode === 0 ? 'm' : ''}
                </span>
                <span className="text-micro uppercase tracking-widest mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  调性
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Analysis / Description */}
        <div className="col-span-1 lg:col-span-2">
          {track.description ? (
            <article>
              <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
                Musical Analysis
              </h2>
              <div className="prose prose-lg max-w-none" style={{ color: 'var(--text-secondary)' }}>
                {track.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ) : (
            <div
              className="rounded-very p-8 text-center"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <Music size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                乐评与分析内容待补充
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Related Tracks ── */}
      {relatedTracks.length > 0 && (
        <section>
          <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
            相似曲目
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 p-3 rounded-very transition-all hover:bg-opacity-50 group"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                {t.previewUrl && <TrackPlayButton track={t} size="sm" coverUrl={relatedCoverMap.get(t.releaseId)} />}
                <Link href={`/track/${t.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {t.titleJa}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {t.artistIds.join(', ')}
                  </p>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <FavoriteButton
                    item={{
                      id: t.id,
                      type: 'track',
                      title: t.titleJa,
                      subtitle: t.artistIds.join(', '),
                    }}
                    size="sm"
                  />
                  {t.durationSec && (
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {formatTime(t.durationSec)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function musicalKeyToString(key: number): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return keys[key] || String(key)
}
