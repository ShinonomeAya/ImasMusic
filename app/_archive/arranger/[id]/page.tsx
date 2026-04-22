'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getSongsByArranger, getAllArrangers } from '@/lib/data'
import { getGenreConfig } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { ArrowLeft, User, Music2, BarChart3 } from 'lucide-react'

export default function ArrangerPage() {
  const params = useParams()
  const arrangerName = decodeURIComponent(params.id as string)
  const songs = getSongsByArranger(arrangerName)
  const allArrangers = getAllArrangers()

  const exists = allArrangers.includes(arrangerName)

  if (!exists || songs.length === 0) {
    return (
      <main className="min-h-screen bg-parchment  flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">
            编曲人不存在
          </h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  const genreStats = songs.reduce((acc, song) => {
    acc[song.primaryGenre] = (acc[song.primaryGenre] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const genreBarData = Object.entries(genreStats)
    .map(([key, count]) => {
      const genre = getGenreConfig(key as any)
      return {
        name: genre?.nameZh || key,
        key,
        count,
        color: genre?.color.light || '#ccc',
      }
    })
    .sort((a, b) => b.count - a.count)

  const seriesStats = songs.reduce((acc, song) => {
    acc[song.series] = (acc[song.series] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const seriesBarData = Object.entries(seriesStats).map(([key, count]) => {
    const series = getSeriesConfig(key as any)
    return {
      name: series?.shortName || key,
      key,
      count,
      color: series?.color.light || '#ccc',
    }
  })

  const CustomBarTooltip = ({ active, payload }: any) => {
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
                {arrangerName}
              </h1>
              <p className="text-olive-gray mt-1">编曲人 · {songs.length} 首作品</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-medium text-near-black mb-4 flex items-center gap-2 text-serif">
              <BarChart3 className="w-5 h-5 text-terracotta" />
              风格偏好
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={genreBarData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#87867f', fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#5e5d59', fontSize: 12 }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {genreBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-lg font-medium text-near-black mb-4 flex items-center gap-2 text-serif">
              <BarChart3 className="w-5 h-5 text-terracotta" />
              系列分布
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={seriesBarData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#87867f', fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#5e5d59', fontSize: 12 }}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {seriesBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-near-black mb-4 flex items-center gap-2 text-serif">
            <Music2 className="w-5 h-5 text-terracotta" />
            全部作品
          </h2>
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
        </div>
      </div>
    </main>
  )
}
