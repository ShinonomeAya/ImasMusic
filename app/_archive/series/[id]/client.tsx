'use client'

import Link from 'next/link'
import { getSeriesConfig } from '@/styles/series.config'
import { getAllGenres } from '@/styles/genres.config'
import { getSongsBySeries, getStatsBySeries } from '@/lib/data'
import { useLocalStorage } from '@/lib/hooks'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Grid3X3, List, ChevronDown, ChevronRight, Music2 } from 'lucide-react'

export default function SeriesPageClient({ id }: { id: string }) {
  const series = getSeriesConfig(id as any)
  const songs = getSongsBySeries(id as any)
  const stats = getStatsBySeries(id as any)

  const [viewMode, setViewMode] = useLocalStorage<'list' | 'grid'>(`series-${id}-view`, 'list')
  const [expandedGenres, setExpandedGenres] = useLocalStorage<string[]>(`series-${id}-expanded`, [])

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black text-serif">系列不存在</h1>
          <Link href="/" className="text-terracotta hover:underline mt-4 block">返回首页</Link>
        </div>
      </div>
    )
  }

  const genreData = Object.entries(stats.genreCounts).map(([key, count]) => {
    const genre = getAllGenres().find(g => g.key === key)
    return { name: genre?.nameZh || key, key, count, color: genre?.color.light || '#ccc' }
  }).sort((a, b) => b.count - a.count)

  const songsByGenre = genreData.map(g => ({ ...g, songs: songs.filter(s => s.primaryGenre === g.key) }))

  const toggleGenre = (genreKey: string) => {
    setExpandedGenres(prev => prev.includes(genreKey) ? prev.filter(k => k !== genreKey) : [...prev, genreKey])
  }

  return (
    <main className="min-h-screen bg-parchment">
      <div className="py-12 px-4 border-b border-border-warm" style={{ backgroundColor: `${series.color.light}15` }}>
        <div className="container-claude">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: series.color.light }}>
              {series.shortName}
            </span>
          </div>
          <h1 className="text-4xl text-near-black mb-2 text-serif">{series.nameZh}</h1>
          <p className="text-lg text-olive-gray mb-4">{series.nameJa}</p>
          <p className="text-olive-gray max-w-2xl">{series.description}</p>
          <div className="flex gap-6 mt-6 text-sm">
            <div><span className="text-stone-gray">始于</span><span className="ml-2 font-medium text-near-black">{series.yearStarted}</span></div>
            <div><span className="text-stone-gray">偶像数</span><span className="ml-2 font-medium text-near-black">{series.totalIdols}人</span></div>
            <div><span className="text-stone-gray">曲目数</span><span className="ml-2 font-medium text-near-black">{stats.totalSongs}首</span></div>
          </div>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="mb-8">
          <h2 className="text-xl text-near-black mb-4 text-serif">风格构成</h2>
          <div className="h-64 card-claude p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#5e5d59', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-near-black flex items-center gap-2 text-serif">
            <Music2 className="w-5 h-5 text-terracotta" />曲目列表
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-ivory text-terracotta border border-border-cream' : 'text-stone-gray hover:bg-ivory/60'}`}><List className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-ivory text-terracotta border border-border-cream' : 'text-stone-gray hover:bg-ivory/60'}`}><Grid3X3 className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="space-y-4">
          {songsByGenre.map(({ key, name, color, songs }) => (
            <div key={key} className="card-claude overflow-hidden">
              <button onClick={() => toggleGenre(key)} className="w-full flex items-center justify-between p-4 hover:bg-parchment transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium text-near-black">{name}</span>
                  <span className="text-sm text-stone-gray">({songs.length}首)</span>
                </div>
                {expandedGenres.includes(key) ? <ChevronDown className="w-5 h-5 text-stone-gray" /> : <ChevronRight className="w-5 h-5 text-stone-gray" />}
              </button>

              {expandedGenres.includes(key) && (
                <div className={`p-4 pt-0 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}`}>
                  {songs.map(song => (
                    <Link key={song.id} href={`/song/${song.id}`}>
                      <div className={`p-4 rounded-xl border border-border-cream hover:border-border-warm transition-all hover:shadow-whisper bg-parchment ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                        <div>
                          <h3 className="font-medium text-near-black">{song.titleJa}</h3>
                          <p className="text-sm text-stone-gray">{song.titleZh}</p>
                        </div>
                        <div className={`text-sm text-stone-gray ${viewMode === 'grid' ? 'mt-2' : ''}`}>{song.firstYear} · {song.isCover ? '翻唱' : '原创'}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
