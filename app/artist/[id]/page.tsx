import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArtistById, getTracksByArtist, getTrackById, getAllArtists } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import { Star, Users, Mic2, PenTool, Music, Disc } from 'lucide-react'

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
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await getArtistById(id)
  if (!artist) notFound()

  const tracks = artist.trackIds?.length
    ? await Promise.all(artist.trackIds.map((tid) => getTrackById(tid)))
    : []

  const Icon = ROLE_ICONS[artist.role] || Star
  const seriesList = artist.series
    ?.map((sid) => SERIES_CONFIG.find((s) => s.id === sid))
    .filter(Boolean) || []

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="flex flex-col md:flex-row gap-8 mb-16 items-start">
        {/* Portrait */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-highly overflow-hidden shrink-0" style={{ backgroundColor: 'var(--bg-interactive)' }}>
          {artist.portraitUrl ? (
            <img src={artist.portraitUrl} alt={artist.nameJa} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon size={48} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          )}
        </div>

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
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {artist.trackIds?.length || 0}
              </p>
              <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>曲目</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                {artist.releaseIds?.length || 0}
              </p>
              <p className="text-micro uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>专辑</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discography */}
      <section>
        <h2 className="text-subheading font-serif font-medium mb-6 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
          作品列表
        </h2>

        {(artist.trackIds?.length || 0) === 0 ? (
          <div className="text-center py-12">
            <Music size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              暂无作品数据
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* 实际实现需要从 trackIds 反查曲目详情 */}
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              数据加载中...
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
