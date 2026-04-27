'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SERIES_CONFIG } from '@/lib/series'
import type { Artist } from '@/types'
import { Users, Mic2, PenTool, Star } from 'lucide-react'

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

export default function ArtistGrid({ artists }: { artists: Artist[] }) {
  const [activeRole, setActiveRole] = useState<string>('ALL')

  const filteredArtists = useMemo(() => {
    if (activeRole === 'ALL') return artists
    return artists.filter((a) => a.role === activeRole)
  }, [activeRole, artists])

  return (
    <>
      {/* 角色筛选栏 */}
      <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide mb-8">
        <FilterButton
          label="全部"
          isActive={activeRole === 'ALL'}
          onClick={() => setActiveRole('ALL')}
        />
        {(['IDOL', 'UNIT', 'CV', 'CREATOR'] as const).map((role) => {
          const Icon = ROLE_ICONS[role]
          return (
            <FilterButton
              key={role}
              label={ROLE_LABELS[role]}
              icon={<Icon size={14} />}
              isActive={activeRole === role}
              onClick={() => setActiveRole(role)}
            />
          )
        })}
      </div>

      {/* 统计 */}
      <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
        共 {filteredArtists.length} 位艺人
        {activeRole !== 'ALL' && `（${ROLE_LABELS[activeRole]}）`}
      </p>

      {filteredArtists.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            该分类下暂无艺人
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredArtists.map((artist) => {
            const Icon = ROLE_ICONS[artist.role] || Star
            const seriesColors = artist.series
              ?.map((sid) => SERIES_CONFIG.find((s) => s.id === sid)?.brandColor)
              .filter(Boolean) || []

            return (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="card-claude-featured p-5 flex flex-col items-center text-center gap-3 group transition-all hover:-translate-y-1"
              >
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-interactive)' }}
                >
                  {artist.portraitUrl ? (
                    <img src={artist.portraitUrl} alt={artist.nameJa} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={28} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {artist.nameJa}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {ROLE_LABELS[artist.role]}
                  </p>
                </div>
                {seriesColors.length > 0 && (
                  <div className="flex gap-1">
                    {seriesColors.map((c, i) => (
                      <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function FilterButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-comfortable text-sm font-medium transition-all"
      style={{
        backgroundColor: isActive ? 'var(--color-terracotta)' : 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        color: isActive ? 'var(--color-ivory)' : 'var(--text-secondary)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
