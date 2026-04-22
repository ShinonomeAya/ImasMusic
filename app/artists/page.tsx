import { getAllArtists } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import Link from 'next/link'
import { Users, Mic2, PenTool, Star, Music } from 'lucide-react'

export const revalidate = 86400

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

export default async function ArtistsPage() {
  const artists = await getAllArtists()

  // 从 tracks 中提取 artist 作为占位（如果没有正式数据）
  // 实际数据应从 artists.json 加载
  const hasData = artists.length > 0

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          艺人目录
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          探索偶像、组合、声优与创作者
        </p>
      </div>

      {/* 角色筛选栏 */}
      <div className="flex gap-2 mb-8">
        {(['IDOL', 'UNIT', 'CV', 'CREATOR'] as const).map((role) => {
          const Icon = ROLE_ICONS[role]
          return (
            <button
              key={role}
              className="flex items-center gap-2 px-4 py-2.5 rounded-comfortable text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              {ROLE_LABELS[role]}
            </button>
          )
        })}
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            艺人数据准备中
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            数据脚手架尚未导入艺人信息。请使用 CLI 工具导入数据，或等待后续更新。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artists.map((artist) => {
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
                <div className="relative w-20 h-20 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  {artist.portraitUrl ? (
                    <img src={artist.portraitUrl} alt={artist.nameJa} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon size={28} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
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
    </div>
  )
}
