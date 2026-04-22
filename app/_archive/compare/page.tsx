'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { getSeriesGenreRatio, getSongsBySeries } from '@/lib/data'
import { getAllGenres } from '@/styles/genres.config'
import { seriesConfig } from '@/styles/series.config'
import { ArrowLeft, GitCompare } from 'lucide-react'
import type { Series } from '@/types/song'

const ALL_SERIES = Object.keys(seriesConfig) as Series[]

export default function ComparePage() {
  const [seriesA, setSeriesA] = useState<Series>('765')
  const [seriesB, setSeriesB] = useState<Series>('shinycolors')
  const allGenres = getAllGenres()

  const data = useMemo(() => {
    const ratioA = getSeriesGenreRatio(seriesA)
    const ratioB = getSeriesGenreRatio(seriesB)

    return allGenres.map(genre => ({
      subject: genre.nameZh,
      genreKey: genre.key,
      [seriesConfig[seriesA].shortName]: ratioA[genre.key] || 0,
      [seriesConfig[seriesB].shortName]: ratioB[genre.key] || 0,
      fullMark: 100,
    }))
  }, [seriesA, seriesB, allGenres])

  const songsA = useMemo(() => getSongsBySeries(seriesA), [seriesA])
  const songsB = useMemo(() => getSongsBySeries(seriesB), [seriesB])

  const uniqueGenres = useMemo(() => {
    const genresA = new Set(songsA.map(s => s.primaryGenre))
    const genresB = new Set(songsB.map(s => s.primaryGenre))

    const onlyA = Array.from(genresA).filter(g => !genresB.has(g))
    const onlyB = Array.from(genresB).filter(g => !genresA.has(g))

    return {
      onlyA: onlyA.map(g => ({
        key: g,
        name: allGenres.find(ag => ag.key === g)?.nameZh || g,
        color: allGenres.find(ag => ag.key === g)?.color.light || '#ccc',
        count: songsA.filter(s => s.primaryGenre === g).length,
      })),
      onlyB: onlyB.map(g => ({
        key: g,
        name: allGenres.find(ag => ag.key === g)?.nameZh || g,
        color: allGenres.find(ag => ag.key === g)?.color.light || '#ccc',
        count: songsB.filter(s => s.primaryGenre === g).length,
      })),
    }
  }, [songsA, songsB, allGenres])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-ivory border border-border-cream rounded-comfortable p-3 text-sm shadow-whisper">
        <p className="font-medium text-near-black mb-2">{label}</p>
        {payload.map((entry: any, idx: number) => {
          const seriesEntry = Object.entries(seriesConfig).find(([, cfg]) => cfg.shortName === entry.name)
          const seriesColor = seriesEntry ? seriesEntry[1].color.light : (entry.color || entry.stroke || '#ccc')
          return (
            <div key={idx} className="flex items-center justify-between gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seriesColor }} />
                <span className="text-olive-gray">{entry.name}</span>
              </div>
              <span className="font-medium text-near-black">{entry.value}%</span>
            </div>
          )
        })}
      </div>
    )
  }

  const nameA = seriesConfig[seriesA].shortName
  const nameB = seriesConfig[seriesB].shortName
  const colorA = seriesConfig[seriesA].color.light
  const colorB = seriesConfig[seriesB].color.light

  return (
    <main className="min-h-screen bg-parchment">
      <div className="py-10 px-4 border-b border-border-warm">
        <div className="container-claude">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-terracotta text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-terracotta" />
            <h1 className="text-3xl text-near-black text-serif">
              系列对比
            </h1>
          </div>
          <p className="text-olive-gray mt-2 text-sm">
            对比两个系列的风格构成差异
          </p>
        </div>
      </div>

      <div className="container-claude py-8">
        {/* 系列选择器 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-xs text-stone-gray uppercase tracking-wider mb-2">系列 A</label>
            <select
              value={seriesA}
              onChange={e => {
                const val = e.target.value as Series
                if (val === seriesB) setSeriesB(seriesA)
                setSeriesA(val)
              }}
              className="input-claude w-full px-4 py-2.5 text-sm"
            >
              {ALL_SERIES.map(s => (
                <option key={s} value={s}>{seriesConfig[s].nameZh}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-stone-gray rotate-90 sm:rotate-0" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-stone-gray uppercase tracking-wider mb-2">系列 B</label>
            <select
              value={seriesB}
              onChange={e => {
                const val = e.target.value as Series
                if (val === seriesA) setSeriesA(seriesB)
                setSeriesB(val)
              }}
              className="input-claude w-full px-4 py-2.5 text-sm"
            >
              {ALL_SERIES.map(s => (
                <option key={s} value={s}>{seriesConfig[s].nameZh}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 雷达图 */}
        <div className="card-claude mb-8">
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <PolarGrid stroke="#e8e6dc" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#5e5d59', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#87867f', fontSize: 11 }}
                tickCount={6}
              />
              <Radar
                name={nameA}
                dataKey={nameA}
                stroke={colorA}
                fill={colorA}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name={nameB}
                dataKey={nameB}
                stroke={colorB}
                fill={colorB}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value: string) => (
                  <span className="text-sm text-olive-gray">{value}</span>
                )}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 独有风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-claude">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorA }} />
              <h3 className="text-lg text-near-black text-serif">
                {seriesConfig[seriesA].nameZh} 独有风格
              </h3>
            </div>
            {uniqueGenres.onlyA.length > 0 ? (
              <div className="space-y-3">
                {uniqueGenres.onlyA.map(g => (
                  <div key={g.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-sm text-near-black">{g.name}</span>
                    </div>
                    <span className="text-xs text-stone-gray">{g.count} 首</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-gray">该系列没有独有风格</p>
            )}
          </div>

          <div className="card-claude">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorB }} />
              <h3 className="text-lg text-near-black text-serif">
                {seriesConfig[seriesB].nameZh} 独有风格
              </h3>
            </div>
            {uniqueGenres.onlyB.length > 0 ? (
              <div className="space-y-3">
                {uniqueGenres.onlyB.map(g => (
                  <div key={g.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-sm text-near-black">{g.name}</span>
                    </div>
                    <span className="text-xs text-stone-gray">{g.count} 首</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-gray">该系列没有独有风格</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
