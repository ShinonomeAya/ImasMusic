import Link from 'next/link'
import { Compass, Map, LineChart, BarChart3, Heart } from 'lucide-react'

export const revalidate = 86400

const EXPLORE_ITEMS = [
  {
    title: '曲风地图',
    desc: 'Energy × Valence 散点图，探索音乐的情感坐标',
    href: '/explore/map',
    icon: Map,
    color: '#c96442',
    available: true,
  },
  {
    title: '发行时间线',
    desc: '堆叠面积图展示每年各曲风发行量',
    href: '/explore/timeline',
    icon: LineChart,
    color: '#2681C8',
    available: false,
  },
  {
    title: '系列对比',
    desc: '雷达图对比两大企划的曲风占比',
    href: '/explore/compare',
    icon: BarChart3,
    color: '#FFC30B',
    available: false,
  },
  {
    title: '我的收藏',
    desc: '管理你喜欢的曲目与专辑',
    href: '/favorites',
    icon: Heart,
    color: '#F34F6D',
    available: true,
  },
]

export default function ExplorePage() {
  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          探索
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          数据可视化与高级分析工具
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXPLORE_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              href={item.available ? item.href : '#'}
              className={`card-claude-featured p-8 flex items-start gap-5 transition-all duration-300 ${
                item.available ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className="w-12 h-12 rounded-generous flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                <Icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-subheading-sm font-serif font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  {!item.available && (
                    <span
                      className="px-2 py-0.5 rounded-subtle text-micro font-medium"
                      style={{ backgroundColor: 'var(--bg-interactive)', color: 'var(--text-tertiary)' }}
                    >
                      开发中
                    </span>
                  )}
                </div>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.desc}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 提示 */}
      <div className="mt-12 p-6 rounded-very" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <div className="flex items-start gap-3">
          <Compass size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--color-terracotta)' }} />
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              数据可视化功能需要完整的 audio-features 数据
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              曲风地图、时间线等功能依赖 Energy/Valence/BPM 等字段。
              当前这些字段为空（待 Spotify API 激活后填充）。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
