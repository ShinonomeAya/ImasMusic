'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getTimelineData } from '@/lib/data'
import { getAllGenres } from '@/styles/genres.config'
import { seriesConfig } from '@/styles/series.config'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import type { Series } from '@/types/song'

const ALL_SERIES = Object.keys(seriesConfig) as Series[]

export default function TimelinePage() {
  const [selectedSeries, setSelectedSeries] = useState<Series | 'all'>('all')
  const allGenres = getAllGenres()

  const data = useMemo(() => {
    return getTimelineData(selectedSeries === 'all' ? undefined : selectedSeries)
  }, [selectedSeries])

  const activeGenres = useMemo(() => {
    const usedGenres = new Set<string>()
    data.forEach(entry => {
      allGenres.forEach(g => {
        if (typeof entry[g.key] === 'number' && (entry[g.key] as number) > 0) {
          usedGenres.add(g.key)
        }
      })
    })
    return allGenres.filter(g => usedGenres.has(g.key))
  }, [data, allGenres])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const nonZero = payload.filter((p: any) => p.value > 0)
    if (nonZero.length === 0) return null
    return (
      <div className="bg-ivory border border-border-cream rounded-comfortable p-3 text-sm max-w-[220px] shadow-whisper">
        <p className="font-medium text-near-black mb-2">{label} 年</p>
        <div className="space-y-1">
          {nonZero.map((entry: any, idx: number) => {
            const genre = allGenres.find(g => g.key === entry.dataKey || g.key === entry.name)
            return (
              <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: genre?.color.light || entry.color || '#ccc' }} />
                  <span className="text-olive-gray">{genre?.nameZh || entry.name}</span>
                </div>
                <span className="font-medium text-near-black">{entry.value} 首</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-parchment">
      <div className="py-10 px-4 border-b border-border-warm">
        <div className="container-claude">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-terracotta text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-terracotta" />
            <h1 className="text-3xl text-near-black text-serif">
              时间线
            </h1>
          </div>
          <p className="text-olive-gray mt-2 text-sm">
            按年份追踪各风格曲目的发布趋势
          </p>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedSeries('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSeries === 'all'
                ? 'btn-terracotta'
                : 'btn-white'
            }`}
          >
            全系列合并
          </button>
          {ALL_SERIES.map(s => {
            const cfg = seriesConfig[s]
            const active = selectedSeries === s
            return (
              <button
                key={s}
                onClick={() => setSelectedSeries(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-ivory'
                    : 'btn-white'
                }`}
                style={active ? { backgroundColor: cfg.color.light } : {}}
              >
                {cfg.shortName}
              </button>
            )
          })}
        </div>

        <div className="card-claude">
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#87867f', fontSize: 12 }}
                axisLine={{ stroke: '#e8e6dc' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#87867f', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                label={{ value: '曲目数', angle: -90, position: 'insideLeft', fill: '#87867f', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value: string) => (
                  <span className="text-xs text-olive-gray">
                    {allGenres.find(g => g.key === value)?.nameZh || value}
                  </span>
                )}
              />
              {activeGenres.map(genre => (
                <Area
                  key={genre.key}
                  type="monotone"
                  dataKey={genre.key}
                  name={genre.key}
                  stackId="1"
                  stroke={genre.color.light}
                  fill={genre.color.light}
                  fillOpacity={0.7}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}
