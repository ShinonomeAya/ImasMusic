'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { getIdolById, getSongsByIdol } from '@/lib/data'
import { getGenreConfig } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { ArrowLeft, User, Music2, Wand2 } from 'lucide-react'

export default function IdolPage() {
  const params = useParams()
  const idolId = params.id as string
  const idol = getIdolById(idolId)
  const songs = getSongsByIdol(idolId)

  if (!idol) {
    return (
      <main className="min-h-screen bg-parchment  flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">
            偶像不存在
          </h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  // 个人风格统计
  const genreStats = songs.reduce((acc, song) => {
    acc[song.primaryGenre] = (acc[song.primaryGenre] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const genrePieData = Object.entries(genreStats).map(([key, count]) => {
    const genre = getGenreConfig(key as any)
    return {
      name: genre?.nameZh || key,
      key,
      count,
      color: genre?.color.light || '#ccc',
    }
  })

  // 合作编曲人统计
  const arrangerStats = songs.reduce((acc, song) => {
    acc[song.arranger] = (acc[song.arranger] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topArrangers = Object.entries(arrangerStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // 参与系列
  const seriesSet = new Set(songs.map(s => s.series))

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-ivory border border-border-cream rounded-very p-3 text-sm" style={{ boxShadow: 'rgba(0,0,0,0.05) 0px 4px 24px' }}>
        <p className="text-3xl font-medium text-near-black text-serif">{data.name}</p>
        <p className="text-xs text-stone-gray mt-1">{data.count} 首 ({Math.round((data.count / songs.length) * 100)}%)</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-parchment">
      {/* 头部 */}
      <div className="section-claude border-b border-border-warm">
        <div className="container-claude">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-terracotta text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-very bg-ivory border border-border-cream flex items-center justify-center">
              <User className="w-8 h-8 text-terracotta" />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-near-black text-serif">
                {idol.nameJa}
              </h1>
              <p className="text-olive-gray mt-1">{idol.nameZh}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from(seriesSet).map(s => {
              const cfg = getSeriesConfig(s)
              return (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: cfg.color.light }}
                >
                  {cfg.shortName}
                </span>
              )
            })}
            <span className="text-sm text-stone-gray">
              {songs.length} 首曲目
            </span>
          </div>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：风格饼图 + 编曲人 */}
          <div className="space-y-6">
            {/* 风格饼图 */}
            <div>
              <h2 className="text-lg font-medium text-near-black mb-4 flex items-center gap-2 text-serif">
                <Wand2 className="w-5 h-5 text-terracotta" />
                风格分布
              </h2>
              {genrePieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={genrePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {genrePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {genrePieData.map(g => (
                      <div key={g.key} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                        <span className="text-olive-gray">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-stone-gray text-center py-8">暂无数据</p>
              )}
            </div>

            {/* 合作编曲人 */}
            <div>
              <h2 className="text-lg font-medium text-near-black mb-4 text-serif">
                合作编曲人
              </h2>
              {topArrangers.length > 0 ? (
                <div className="space-y-3">
                  {topArrangers.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <Link
                        href={`/arranger/${encodeURIComponent(name)}`}
                        className="text-sm text-near-black  hover:text-terracotta transition-colors"
                      >
                        {name}
                      </Link>
                      <span className="text-xs text-stone-gray">{count} 次合作</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-gray">暂无数据</p>
              )}
            </div>
          </div>

          {/* 右侧：曲目列表 */}
          <div className="lg:col-span-2">
            <div>
              <h2 className="text-lg font-medium text-near-black mb-4 flex items-center gap-2 text-serif">
                <Music2 className="w-5 h-5 text-terracotta" />
                全部曲目
              </h2>
              {songs.length > 0 ? (
                <div className="space-y-3">
                  {songs.map(song => {
                    const genre = getGenreConfig(song.primaryGenre)
                    const series = getSeriesConfig(song.series)
                    return (
                      <Link key={song.id} href={`/song/${song.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-very hover:bg-parchment  transition-colors group">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-xs shrink-0"
                            style={{ backgroundColor: series?.color.light }}
                          >
                            {series?.shortName.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-near-black  group-hover:text-terracotta transition-colors truncate">
                              {song.titleJa}
                            </h3>
                            <p className="text-xs text-stone-gray truncate">{song.titleZh}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs text-white"
                              style={{ backgroundColor: genre?.color.light }}
                            >
                              {genre?.nameZh}
                            </span>
                            <span className="text-xs text-stone-gray">{song.firstYear}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-gray text-center py-8">暂无曲目数据</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
