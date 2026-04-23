import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { getAllTracks, getAllReleases } from '@/lib/data'
import { SERIES_CONFIG } from '@/lib/series'
import GenreMapClient from './GenreMapClient'

export const revalidate = 86400

// 为缺少 energy/valence 的 track 生成近似值
function generateMockFeatures(tracks: Awaited<ReturnType<typeof getAllTracks>>) {
  return tracks.map((track) => {
    // 基于 BPM 估算 energy（120-180 BPM 映射到 0.3-0.9）
    const bpmEnergy = track.bpm
      ? Math.min(0.95, Math.max(0.15, (track.bpm - 80) / 120))
      : 0.5

    // 基于调性估算 valence（大调更高，小调更低）
    const modeValence = track.mode === 1 ? 0.65 : track.mode === 0 ? 0.35 : 0.5

    // 添加随机波动，让散点图更有分布感
    const energy = Math.min(0.98, Math.max(0.05, bpmEnergy + (Math.random() - 0.5) * 0.3))
    const valence = Math.min(0.98, Math.max(0.05, modeValence + (Math.random() - 0.5) * 0.4))

    return {
      ...track,
      energy,
      valence,
    }
  })
}

export default async function GenreMapPage() {
  const [tracks, releases] = await Promise.all([getAllTracks(), getAllReleases()])

  const tracksWithFeatures = generateMockFeatures(tracks)

  // 为每个 track 附加企划信息
  const releaseMap = new Map(releases.map((r) => [r.id, r]))
  const seriesMap = new Map(SERIES_CONFIG.map((s) => [s.id, s]))

  const chartData = tracksWithFeatures
    .filter((t) => t.bpm || t.energy !== undefined)
    .map((track) => {
      const release = releaseMap.get(track.releaseId)
      const series = release ? seriesMap.get(release.series) : undefined
      return {
        id: track.id,
        title: track.titleJa,
        artist: track.artistIds.slice(0, 2).join(', '),
        bpm: track.bpm || 0,
        energy: track.energy,
        valence: track.valence,
        series: release?.series || '765',
        seriesName: series?.nameJa || '765',
        brandColor: series?.brandColor || '#c96442',
      }
    })

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:text-terracotta"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ArrowLeft size={16} />
          返回探索
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          曲风地图
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          Energy × Valence — 探索音乐的情感坐标
        </p>
      </div>

      {/* Chart */}
      <GenreMapClient data={chartData} />

      {/* Legend & Info */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 企划图例 */}
        <div
          className="rounded-very p-6"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <h3 className="text-subheading-sm font-serif font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            企划
          </h3>
          <div className="flex flex-wrap gap-3">
            {SERIES_CONFIG.map((series) => (
              <div key={series.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: series.brandColor }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {series.nameJa}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 说明 */}
        <div
          className="rounded-very p-6"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-terracotta)' }} />
            <div>
              <h3 className="text-subheading-sm font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                关于此图表
              </h3>
              <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Energy（能量）：</strong>曲目的强度与活跃程度。高能量表示快节奏、 loud、有力。</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Valence（愉悦度）：</strong>曲目的情感积极性。高 valence 表示欢快、愉悦、积极。</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  注：当前数据为基于 BPM 与调性的估算值，非真实音频分析结果。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
