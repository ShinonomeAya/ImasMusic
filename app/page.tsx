'use client'

import { useState, useEffect } from 'react'
import { seriesConfig } from '@/styles/series.config'
import { sampleSongs765, get765Stats } from '@/data/765/sample'
import { sampleSongsShinycolors, getShinycolorsStats } from '@/data/shinycolors/sample'
import { getAllGenres } from '@/styles/genres.config'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Shuffle, Music, Search } from 'lucide-react'

// 系列卡片组件
function SeriesCard({
  series,
  songCount,
  genreData
}: {
  series: typeof seriesConfig['765']
  songCount: number
  genreData: { name: string; count: number; color: string }[]
}) {
  return (
    <Link href={`/series/${series.id}`}>
      <div className="card-claude group relative overflow-hidden cursor-pointer">
        {/* 顶部色条 */}
        <div className="h-2 w-full" style={{ backgroundColor: series.color.light }} />

        <div className="p-6">
          {/* 系列标题 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-subheading-sm text-near-black group-hover:text-terracotta transition-colors text-serif">
                {series.nameZh}
              </h3>
              <p className="text-caption text-stone-gray mt-1">{series.nameJa}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-label"
              style={{
                backgroundColor: `${series.color.light}18`,
                color: series.color.light,
              }}
            >
              {songCount} 首
            </span>
          </div>

          {/* 风格构成迷你条形图 */}
          <div className="mt-4">
            <p className="text-label uppercase tracking-wider text-stone-gray mb-2">风格构成</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              {genreData.map((g, i) => (
                <div
                  key={i}
                  style={{
                    width: `${(g.count / Math.max(songCount, 1)) * 100}%`,
                    backgroundColor: g.color,
                  }}
                  title={`${g.name}: ${g.count}首`}
                />
              ))}
            </div>
          </div>

          {/* 简介摘要 */}
          <p className="mt-4 text-body-sm text-olive-gray line-clamp-2">
            {series.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

// 首页组件
export default function HomePage() {
  const allSeries = Object.values(seriesConfig)

  // 统计各系列歌曲数量
  const seriesStats: Record<string, { count: number; genreCounts: Record<string, number> }> = {
    '765': get765Stats(),
    shinycolors: getShinycolorsStats(),
    cinderella: { count: 0, genreCounts: {} },
    million: { count: 0, genreCounts: {} },
    sidem: { count: 0, genreCounts: {} },
  }

  // 获取所有歌曲用于风格统计
  const allSongs = [
    ...sampleSongs765,
    ...sampleSongsShinycolors,
  ]

  // 计算全站风格分布
  const genreDistribution = getAllGenres().map(genre => {
    const count = allSongs.filter(s => s.primaryGenre === genre.key).length
    return {
      name: genre.nameZh,
      key: genre.key,
      count,
      color: genre.color.light
    }
  }).filter(g => g.count > 0)

  // 标签云数据
  const tagCounts: Record<string, number> = {}
  allSongs.forEach(song => {
    song.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  // 随机歌曲 ID（客户端才计算，避免 SSR/CSR hydration 不一致）
  const [randomSongId, setRandomSongId] = useState('765-0001')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const randomIndex = Math.floor(Math.random() * allSongs.length)
    setRandomSongId(allSongs[randomIndex]?.id || '765-0001')
  }, [allSongs.length])

  return (
    <main className="min-h-screen">
      {/* Hero 区域 */}
      <section className="section-claude-lg section-light">
        <div className="container-claude text-center">
          <h1 className="text-display text-near-black mb-6 max-w-4xl mx-auto">
            偶像大师音乐数据库
          </h1>
          <p className="text-body-lg text-olive-gray mb-10 max-w-2xl mx-auto">
            探索 THE IDOLM@STER 全系列音乐作品，
            <br className="hidden md:block" />
            发现属于偶像们的旋律与故事
          </p>

          {/* 搜索框 */}
          <div className="max-w-xl mx-auto mb-8">
            <Link href="/search">
              <div className="flex items-center gap-3 px-6 py-4 bg-ivory rounded-generous border border-border-cream hover:border-ring-warm transition-colors whisper">
                <Search className="w-5 h-5 text-stone-gray" />
                <span className="text-stone-gray">搜索歌曲、偶像...</span>
              </div>
            </Link>
          </div>

          {/* 随机发现按钮 */}
          <Link href={`/song/${randomSongId}`}>
            <button className="btn-terracotta">
              <Shuffle className="w-5 h-5" />
              随机发现
            </button>
          </Link>
        </div>
      </section>

      {/* 系列入口卡片 */}
      <section className="section-claude section-ivory border-t border-border-warm">
        <div className="container-claude">
          <div className="flex items-center gap-3 mb-10">
            <Music className="w-6 h-6 text-terracotta" />
            <h2 className="text-subheading text-near-black text-serif">
              系列入口
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSeries.map(series => {
              const stats = seriesStats[series.id]
              const genreData = Object.entries(stats.genreCounts || {}).map(([key, count]) => {
                const genre = getAllGenres().find(g => g.key === key)
                return {
                  name: genre?.nameZh || key,
                  count,
                  color: genre?.color.light || '#ccc'
                }
              })

              return (
                <SeriesCard
                  key={series.id}
                  series={series}
                  songCount={stats.count}
                  genreData={genreData}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* 风格统计区域 */}
      <section className="section-claude section-light border-t border-border-warm">
        <div className="container-claude">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* 甜甜圈图 */}
            <div>
              <h2 className="text-subheading text-near-black text-serif mb-8">
                全站风格分布
              </h2>
              <div className="h-80 bg-ivory rounded-very p-6 border border-border-cream">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {genreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
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
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-gray">
                    加载中...
                  </div>
                )}
              </div>
              {/* 图例 */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {genreDistribution.map((g) => (
                  <div key={g.key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="text-body-sm text-olive-gray">
                      {g.name} ({g.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 标签云 */}
            <div>
              <h2 className="text-subheading text-near-black text-serif mb-8">
                热门标签
              </h2>
              <div className="flex flex-wrap gap-3">
                {tags.map(([tag, count]) => {
                  const size = Math.min(1 + count * 0.1, 1.5)
                  return (
                    <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}>
                      <span
                        className="inline-block px-4 py-2 bg-parchment rounded-lg text-olive-gray hover:bg-warm-sand hover:text-near-black transition-colors border border-border-cream"
                        style={{ fontSize: `${size}rem` }}
                      >
                        {tag}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
