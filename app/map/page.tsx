'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getAllSongs } from '@/lib/data'
import { getAllGenres } from '@/styles/genres.config'
import { seriesConfig } from '@/styles/series.config'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ArrowLeft, Map } from 'lucide-react'
import type { Series } from '@/types/song'

const ALL_SERIES = Object.keys(seriesConfig) as Series[]

export default function MapPage() {
  const allSongs = getAllSongs()
  const allGenres = getAllGenres()

  const [selectedSeries, setSelectedSeries] = useState<Series[]>([...ALL_SERIES])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const filteredSongs = useMemo(() => {
    return allSongs.filter(s => {
      const seriesOk = selectedSeries.includes(s.series)
      const genreOk = selectedGenres.length === 0 || selectedGenres.includes(s.primaryGenre)
      return seriesOk && genreOk
    })
  }, [allSongs, selectedSeries, selectedGenres])

  const toggleSeries = (s: Series) =>
    setSelectedSeries(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const song = payload[0]?.payload
    if (!song) return null
    const genre = allGenres.find(g => g.key === song.primaryGenre)
    return (
      <div className="bg-ivory border border-border-cream rounded-xl p-3 text-sm max-w-[200px] shadow-whisper">
        <p className="font-medium text-near-black leading-tight">{song.titleJa}</p>
        <p className="text-olive-gray text-xs mt-1">{song.titleZh}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: genre?.color.light }}>{genre?.nameZh}</span>
        </div>
        <p className="text-stone-gray text-xs mt-1">能量 {song.energy} · 情绪 {song.valence}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-parchment">
      <div className="py-10 px-4 border-b border-border-warm">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-terracotta text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-3">
            <Map className="w-7 h-7 text-terracotta" />
            <h1 className="text-3xl font-medium text-near-black text-serif">
              风格地图
            </h1>
          </div>
          <p className="text-olive-gray mt-2 text-sm">
            X轴 = 能量强度（0–10）· Y轴 = 情绪明暗（0=忧郁，10=明朗）
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0 space-y-6">
            <div>
              <h3 className="text-xs font-medium text-stone-gray uppercase tracking-wider mb-3">系列</h3>
              <div className="space-y-1.5">
                {ALL_SERIES.map(s => {
                  const cfg = seriesConfig[s]
                  const active = selectedSeries.includes(s)
                  return (
                    <button key={s} onClick={() => toggleSeries(s)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                      style={active ? { backgroundColor: cfg.color.light + '20', color: cfg.color.light } : { color: 'var(--text-muted)' }}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: active ? cfg.color.light : '#b0aea5' }} />
                      {cfg.shortName}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-stone-gray uppercase tracking-wider mb-3">风格</h3>
              <div className="space-y-1">
                {allGenres.map(g => {
                  const active = selectedGenres.includes(g.key)
                  return (
                    <button key={g.key} onClick={() => toggleGenre(g.key)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={active ? { backgroundColor: g.color.light + '20', color: g.color.light } : { color: 'var(--text-muted)' }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: active ? g.color.light : '#b0aea5' }} />
                      {g.nameZh}
                    </button>
                  )
                })}
                {selectedGenres.length > 0 && (
                  <button onClick={() => setSelectedGenres([])} className="text-xs text-terracotta mt-1 px-3">清除风格筛选</button>
                )}
              </div>
            </div>
            <p className="text-xs text-stone-gray">显示 {filteredSongs.length} / {allSongs.length} 首</p>
          </aside>

          <div className="flex-1 bg-ivory rounded-2xl p-6 border border-border-cream shadow-whisper">
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-heavy)" />
                <XAxis type="number" dataKey="energy" domain={[0, 10]} name="能量"
                  label={{ value: '能量', position: 'insideBottom', offset: -15, fill: 'var(--text-muted)', fontSize: 12 }}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="number" dataKey="valence" domain={[0, 10]} name="情绪"
                  label={{ value: '情绪', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={filteredSongs} isAnimationActive={false}>
                  {filteredSongs.map((song, i) => (
                    <Cell key={i} fill={seriesConfig[song.series]?.color.light || 'var(--accent)'} fillOpacity={0.85} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {ALL_SERIES.filter(s => selectedSeries.includes(s)).map(s => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-olive-gray">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seriesConfig[s].color.light }} />
                  {seriesConfig[s].shortName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
