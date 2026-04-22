'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Music } from 'lucide-react'

interface MapDataPoint {
  id: string
  title: string
  artist: string
  bpm: number
  energy: number
  valence: number
  series: string
  seriesName: string
  brandColor: string
}

interface GenreMapClientProps {
  data: MapDataPoint[]
}

export default function GenreMapClient({ data }: GenreMapClientProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (data.length === 0) {
    return (
      <div
        className="rounded-very p-12 text-center"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <Music size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          暂无可视化数据（需要曲目具备 BPM 或 Audio Features）
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-very p-6 lg:p-8"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      {/* 象限标签 */}
      <div className="relative mb-4 h-6 hidden lg:block">
        <span className="absolute left-0 top-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          忧郁 / 平静
        </span>
        <span className="absolute right-0 top-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          快乐 / 兴奋
        </span>
      </div>

      <div className="w-full" style={{ height: 'min(60vh, 520px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-default)"
              opacity={0.5}
            />
            <XAxis
              type="number"
              dataKey="valence"
              name="Valence"
              domain={[0, 1]}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--border-default)' }}
              axisLine={{ stroke: 'var(--border-default)' }}
              label={{
                value: 'Valence（愉悦度）→',
                position: 'insideBottomRight',
                offset: -5,
                fill: 'var(--text-tertiary)',
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="energy"
              name="Energy"
              domain={[0, 1]}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--border-default)' }}
              axisLine={{ stroke: 'var(--border-default)' }}
              label={{
                value: 'Energy（能量）→',
                angle: -90,
                position: 'insideLeft',
                fill: 'var(--text-tertiary)',
                fontSize: 12,
              }}
            />
            <ReferenceLine x={0.5} stroke="var(--border-default)" strokeDasharray="4 4" />
            <ReferenceLine y={0.5} stroke="var(--border-default)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: 'var(--color-terracotta)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const point = payload[0].payload as MapDataPoint
                return (
                  <div
                    className="rounded-comfortable p-3 shadow-whisper"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {point.title}
                    </p>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      {point.artist}
                    </p>
                    <div className="flex gap-3 text-xs font-mono">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        E: {point.energy.toFixed(2)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        V: {point.valence.toFixed(2)}
                      </span>
                      {point.bpm > 0 && (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {point.bpm} BPM
                        </span>
                      )}
                    </div>
                  </div>
                )
              }}
            />
            <Scatter
              data={data}
              onMouseEnter={(point) => setHoveredId((point as MapDataPoint).id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.brandColor}
                  fillOpacity={hoveredId === entry.id ? 1 : 0.75}
                  stroke={hoveredId === entry.id ? 'var(--text-primary)' : 'none'}
                  strokeWidth={hoveredId === entry.id ? 2 : 0}
                  r={hoveredId === entry.id ? 8 : 6}
                  cursor="pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 悬停提示曲目详情 */}
      {hoveredId && (
        <div className="mt-4 text-center">
          {(() => {
            const track = data.find((d) => d.id === hoveredId)
            if (!track) return null
            return (
              <Link
                href={`/track/${track.id}`}
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-terracotta"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Music size={14} />
                {track.title} — {track.artist}
              </Link>
            )
          })()}
        </div>
      )}

      {/* 移动端象限标签 */}
      <div className="flex justify-between mt-4 lg:hidden text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span>忧郁 / 平静</span>
        <span>快乐 / 兴奋</span>
      </div>
    </div>
  )
}
