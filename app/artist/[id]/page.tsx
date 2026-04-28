import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getArtistById,
  getTracksByArtist,
  getAllTracks,
  getReleaseById,
  getAllArtists,
} from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import MobileTracklist from '@/components/MobileTracklist'
import ArtistCreditedTracklist from '@/components/ArtistCreditedTracklist'
import AvatarPlaceholder from '@/components/AvatarPlaceholder'
import TrackPlayButton from '@/components/TrackPlayButton'
import FavoriteButton from '@/components/FavoriteButton'
import { Star, Users, Mic2, PenTool, Music, Clock } from 'lucide-react'

export const revalidate = 86400

export async function generateStaticParams() {
  const artists = await getAllArtists()
  return artists.map((a) => ({ id: a.id }))
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  IDOL: Star,
  UNIT: Users,
  CV: Mic2,
  CREATOR: PenTool,
}

const ROLE_LABELS: Record<string, string> = {
  IDOL: '偶像',
  UNIT: '组合',
  CV: '声优',
  CREATOR: '创作者',
  VOCALS: '演唱',
  COMPOSER: '作曲',
  LYRICIST: '作词',
  ARRANGER: '编曲',
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await getArtistById(id)
  if (!artist) notFound()

  const Icon = ROLE_ICONS[artist.role] || Star
  const seriesList = artist.series
    ?.map((sid) => SERIES_CONFIG.find((s) => s.id === sid))
    .filter(Boolean) || []

  // ── 演唱曲目 ──
  const vocalTracks = await getTracksByArtist(artist.id)

  // ── 创作曲目 ──
  const allTracks = await getAllTracks()
  const creditedEntries = allTracks
    .filter((t) => t.credits.some((c) => c.artistId === artist.id))
    .map((t) => {
      const roles = [
        ...new Set(
          t.credits
            .filter((c) => c.artistId === artist.id)
            .map((c) => ROLE_LABELS[c.role] || c.role)
        ),
      ]
      return { track: t, roles }
    })

  // ── 预加载封面 ──
  const allRelatedTracks = [...vocalTracks, ...creditedEntries.map((e) => e.track)]
  const relatedReleases = await Promise.all(
    allRelatedTracks.map((t) => getReleaseById(t.releaseId))
  )
  const releaseMap = new Map(relatedReleases.filter(Boolean).map((r) => [r!.id, r!]))

  const tracksWithCover = (tracks: typeof vocalTracks) =>
    tracks.map((t) => ({
      ...t,
      coverUrl: releaseMap.get(t.releaseId)?.coverUrl,
    }))

  const vocalTracksWithCover = tracksWithCover(vocalTracks)
  const creditedTracksWithCover = tracksWithCover(creditedEntries.map((e) => e.track))

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row gap-8 mb-16 items-start">
        {/* Portrait */}
        {artist.portraitUrl ? (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-highly overflow-hidden shrink-0">
            <img src={artist.portraitUrl} alt={artist.nameJa} className="w-full h-full object-cover" />
          </div>
        ) : (
          <AvatarPlaceholder name={artist.nameJa} series={artist.series} size="lg" className="rounded-highly" />
        )}

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider"
              style={{ backgroundColor: 'var(--bg-interactive)', color: 'var(--text-secondary)' }}
            >
              {ROLE_LABELS[artist.role]}
            </span>
            {seriesList.map((s) => (
              <span
                key={s!.id}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${s!.brandColor}20`, color: s!.brandColor }}
              >
                {s!.nameJa}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-subheading-lg font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            {artist.nameJa}
          </h1>

          {artist.nameEn && (
            <p className="text-body-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              {artist.nameEn}
            </p>
          )}

          {artist.bio && (
            <p className="text-body-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {artist.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6">
            <div className="text-center md:text-left">
              <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {vocalTracks.length}
              </p>
              <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>演唱曲目</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {creditedEntries.length}
              </p>
              <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>创作曲目</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {artist.releaseIds?.length || 0}
              </p>
              <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>专辑</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vocal Tracks ── */}
      {vocalTracks.length > 0 && (
        <section className="mb-16">
          <h2
            className="text-subheading font-serif font-medium mb-6 pb-3"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}
          >
            演唱曲目
          </h2>

          {/* Mobile */}
          <div className="md:hidden">
            <MobileTracklist tracks={vocalTracksWithCover as any} />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex flex-col gap-1">
            {vocalTracks.map((track) => (
              <DesktopTrackRow
                key={track.id}
                track={track}
                release={releaseMap.get(track.releaseId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Credited Tracks ── */}
      {creditedEntries.length > 0 && (
        <section className="mb-16">
          <h2
            className="text-subheading font-serif font-medium mb-6 pb-3"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}
          >
            创作曲目
          </h2>

          {/* Mobile */}
          <div className="md:hidden">
            <ArtistCreditedTracklist
              tracks={creditedTracksWithCover}
              roleMap={Object.fromEntries(creditedEntries.map((e) => [e.track.id, e.roles.join(' / ')]))}
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex flex-col gap-1">
            {creditedEntries.map(({ track, roles }) => (
              <DesktopTrackRow
                key={track.id}
                track={track}
                release={releaseMap.get(track.releaseId)}
                badge={roles.join(' / ')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {vocalTracks.length === 0 && creditedEntries.length === 0 && (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            暂无作品数据
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            该艺人尚未收录曲目或创作记录
          </p>
        </div>
      )}
    </div>
  )
}

// ── Desktop Track Row ──
function DesktopTrackRow({
  track,
  release,
  badge,
}: {
  track: Awaited<ReturnType<typeof getAllTracks>>[number]
  release?: Awaited<ReturnType<typeof getReleaseById>>
  badge?: string
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-comfortable transition-colors hover:bg-opacity-50 group"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      {track.previewUrl && (
        <TrackPlayButton track={track} size="sm" coverUrl={release?.coverUrl} />
      )}

      {release?.coverUrl && (
        <Link href={`/release/${release.id}`} className="shrink-0">
          <div className="relative w-10 h-10 rounded-subtle overflow-hidden">
            <Image src={release.coverUrl} alt={release.titleJa} fill className="object-cover" sizes="40px" />
          </div>
        </Link>
      )}

      <div className="flex-1 min-w-0">
        <Link
          href={`/track/${track.id}`}
          className="text-sm font-medium truncate block hover:text-terracotta transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {track.titleJa}
        </Link>
        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
          {badge ? `${badge} · ` : ''}
          {track.artistIds.slice(0, 3).join(', ')}
          {track.artistIds.length > 3 && '...'}
        </p>
      </div>

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

      {track.durationSec && (
        <span className="hidden sm:flex text-xs font-mono items-center gap-1 shrink-0" style={{ color: 'var(--text-tertiary)' }}>
          <Clock size={12} />
          {formatTime(track.durationSec)}
        </span>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
