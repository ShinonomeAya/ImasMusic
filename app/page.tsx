'use client'

import { usePlayerStore } from '@/lib/store/playerStore'
import { Play } from 'lucide-react'

export default function HomePage() {
  const setTrack = usePlayerStore((s) => s.setTrack)
  const setView = usePlayerStore((s) => s.setView)

  const handlePlayDemo = () => {
    setTrack({
      id: 'demo-001',
      titleJa: 'M@STERPIECE',
      titleRomaji: 'Masterpiece',
      releaseId: 'demo-release',
      artistIds: ['765PRO ALLSTARS'],
      credits: [
        { artistId: '765PRO ALLSTARS', role: 'VOCALS' },
        { artistId: '椎名豪', role: 'COMPOSER' },
      ],
      trackNumber: 1,
      durationSec: 30,
      bpm: 132,
      energy: 0.72,
      valence: 0.85,
      previewUrl: undefined,
    })
    setView('MINI')
  }

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="mb-20">
        <h1 className="text-display font-serif font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
          THE IDOLM@STER
          <br />
          <span style={{ color: 'var(--color-terracotta)' }}>音乐数据库</span>
        </h1>
        <p className="text-body-lg max-w-2xl mb-8" style={{ color: 'var(--text-secondary)' }}>
          探索偶像大师全系列的歌曲、专辑、艺人与创作者。
          从 765PRO 到学园偶像大师，收录六大企划的完整音乐档案。
        </p>
        <div className="flex gap-4">
          <button
            onClick={handlePlayDemo}
            className="btn-terracotta gap-2"
          >
            <Play size={18} fill="currentColor" />
            试听演示
          </button>
          <button className="btn-sand">
            浏览曲库
          </button>
        </div>
      </section>

      {/* 企划卡片 */}
      <section className="mb-20">
        <h2 className="text-section font-serif font-medium mb-8" style={{ color: 'var(--text-primary)' }}>
          六大企划
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: '765', name: '765PRO ALLSTARS', color: '#F34F6D', desc: '一切的原点，永远的传奇' },
            { id: 'cinderella', name: 'Cinderella Girls', color: '#2681C8', desc: '346 事务所的闪耀新星' },
            { id: 'million', name: 'Million Live!', color: '#FFC30B', desc: '765 剧场的百万梦想' },
            { id: 'sidem', name: 'SideM', color: '#0FBE94', desc: '315 事务所的绅士偶像' },
            { id: 'shinycolors', name: 'Shiny Colors', color: '#8DBBFF', desc: '283 事务所的闪耀色彩' },
            { id: 'gakuen', name: '学园偶像大师', color: '#FF7F27', desc: '初星学园的青春物语' },
          ].map((series) => (
            <div
              key={series.id}
              className="card-claude-featured p-6 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-10 h-10 rounded-generous mb-4 flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: series.color }}
              >
                {series.name.charAt(0)}
              </div>
              <h3 className="text-subheading-sm font-serif font-medium mb-2 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                {series.name}
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {series.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-section font-serif font-medium mb-8" style={{ color: 'var(--text-primary)' }}>
          功能特性
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: '曲风地图', desc: '基于 Energy × Valence 的散点图可视化，发现属于你的音乐领地' },
            { title: '发行时间线', desc: '堆叠面积图展示每年各曲风发行量，纵览偶像大师音乐史' },
            { title: '智能搜索', desc: '支持日文、中文、罗马音多语言检索，模糊匹配即刻找到' },
          ].map((feat) => (
            <div key={feat.title} className="card-claude p-5">
              <h4 className="text-feature-title font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {feat.title}
              </h4>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
