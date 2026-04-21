'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getGenreConfig, GenreType } from '@/styles/genres.config'
import { getSongsByGenre, getStatsByGenre } from '@/lib/data'
import { getSeriesConfig } from '@/styles/series.config'
import { GenrePageWrapper } from '@/components/GenrePageWrapper'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Music2, Users } from 'lucide-react'

export default function GenrePage() {
  const params = useParams()
  const slug = params.slug as GenreType
  const genre = getGenreConfig(slug)
  const songs = getSongsByGenre(slug)
  const stats = getStatsByGenre(slug)

  if (!genre) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">
            风格不存在
          </h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  const seriesData = Object.entries(stats.seriesCounts).map(([series, count]) => {
    const config = getSeriesConfig(series as any)
    return { name: config?.shortName || series, fullName: config?.nameZh || series, count, color: config?.color.light || '#ccc' }
  }).sort((a, b) => b.count - a.count)

  return (
    <GenrePageWrapper genreSlug={slug}>
      <main className="min-h-screen">
        {/* Hero */}
        <div className="section-claude px-4 border-b border-border-warm" style={{ backgroundColor: `${genre.color.light}18` }}>
          <div className="container-claude">
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
              style={{ backgroundColor: genre.color.light }}
            >
              {genre.nameZh}
            </span>
            <h1
              className="text-4xl md:text-5xl text-near-black mb-4 text-serif" style={{ lineHeight: 1.15 }}
            >
              {genre.nameZh}
            </h1>
            <p className="text-lg text-olive-gray leading-relaxed mb-3 max-w-2xl">{genre.description}</p>
            <p className="text-sm text-stone-gray">{genre.boundary}</p>
          </div>
        </div>

        <div className="container-claude py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 曲目列表 */}
            <div className="lg:col-span-2">
              <h2
                className="text-xl text-near-black mb-6 flex items-center gap-2 text-serif"
              >
                <Music2 className="w-5 h-5 text-terracotta" />
                曲目列表 ({songs.length}首)
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {songs.map(song => {
                  const series = getSeriesConfig(song.series)
                  return (
                    <Link key={song.id} href={`/song/${song.id}`}>
                      <div className="p-4 bg-ivory rounded-very border border-border-cream hover:border-ring-warm transition-all hover:shadow-whisper">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-xs shrink-0"
                            style={{ backgroundColor: series?.color.light }}
                          >
                            {series?.shortName.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-near-black truncate">{song.titleJa}</h3>
                            <p className="text-sm text-stone-gray truncate">{song.titleZh}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-gray mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-parchment border border-border-cream">
                            {series?.shortName}
                          </span>
                          <span>{song.firstYear}</span>
                          {song.isCover && <span className="text-terracotta">翻唱</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* 右侧统计 */}
            <div className="space-y-6">
              {/* 各系列占比 */}
              <div className="bg-ivory rounded-very p-6 border border-border-cream">
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4">各系列占比</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={seriesData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" paddingAngle={2}>
                        {seriesData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#faf9f5',
                          border: '1px solid #f0eee6',
                          borderRadius: '8px',
                          boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px',
                          fontFamily: 'system-ui, Arial, sans-serif',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {seriesData.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-olive-gray">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最活跃编曲人 */}
              {stats.topArrangers.length > 0 && (
                <div className="bg-ivory rounded-very p-6 border border-border-cream">
                  <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    最活跃编曲人 Top 3
                  </h3>
                  <div className="space-y-3">
                    {stats.topArrangers.map(([name, count], idx) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-parchment border border-border-cream flex items-center justify-center text-xs text-stone-gray font-medium">
                            {idx + 1}
                          </span>
                          <Link href={`/arranger/${encodeURIComponent(name)}`} className="text-sm text-near-black hover:text-terracotta transition-colors">
                            {name}
                          </Link>
                        </div>
                        <span className="text-xs text-stone-gray">{count} 首</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 代表曲 */}
              <div className="bg-ivory rounded-very p-6 border border-border-cream">
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4">代表曲</h3>
                <div className="space-y-2">
                  {genre.representativeSongs.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: genre.color.light }} />
                      <span className="text-near-black">{s.title}</span>
                      <span className="text-xs text-stone-gray">({s.series})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GenrePageWrapper>
  )
}
