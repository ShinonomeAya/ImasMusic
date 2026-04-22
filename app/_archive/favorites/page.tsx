'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { getAllSongs } from '@/lib/data'
import { getGenreConfig } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { useLocalStorage } from '@/lib/hooks'
import { ArrowLeft, Heart, Download, Trash2, Music2 } from 'lucide-react'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', [])
  const allSongs = getAllSongs()

  const favoriteSongs = useMemo(() => {
    return allSongs.filter(song => favorites.includes(song.id))
  }, [allSongs, favorites])

  const removeFavorite = (songId: string) => {
    setFavorites(prev => prev.filter(id => id !== songId))
  }

  const exportAsText = () => {
    const lines = favoriteSongs.map(song => {
      const series = getSeriesConfig(song.series)
      return `${song.titleJa} (${song.titleZh}) — ${series?.shortName} — ${song.firstYear}`
    })
    const text = [`偶像大师音乐数据库 - 收藏列表 (${lines.length} 首)`, '='.repeat(40), ...lines].join('\n')

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `imas-favorites-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-parchment">
      <div className="py-10 px-4 border-b border-border-warm">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-gray hover:text-terracotta text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />返回首页
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-terracotta" />
            <h1 className="text-3xl font-medium text-near-black text-serif">
              我的收藏
            </h1>
          </div>
          <p className="text-olive-gray mt-2 text-sm">
            共收藏 {favoriteSongs.length} 首曲目
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favoriteSongs.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={exportAsText}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ivory text-olive-gray rounded-lg text-sm border border-border-cream hover:border-terracotta transition-colors"
            >
              <Download className="w-4 h-4" />导出为文本
            </button>
          </div>
        )}

        {favoriteSongs.length > 0 ? (
          <div className="space-y-3">
            {favoriteSongs.map(song => {
              const genre = getGenreConfig(song.primaryGenre)
              const series = getSeriesConfig(song.series)
              return (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 bg-ivory rounded-2xl border border-border-cream group"
                >
                  <Link href={`/song/${song.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium text-sm shrink-0"
                      style={{ backgroundColor: series?.color.light }}
                    >
                      {series?.shortName.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-near-black truncate">
                        {song.titleJa}
                      </h3>
                      <p className="text-xs text-stone-gray truncate">{song.titleZh}</p>
                      <div className="flex items-center gap-2 mt-1">
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
                  <button
                    onClick={() => removeFavorite(song.id)}
                    className="p-2 rounded-lg text-stone-gray hover:text-error-crimson hover:bg-ivory transition-colors shrink-0"
                    title="移除收藏"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music2 className="w-16 h-16 text-border-warm mx-auto mb-4" />
            <p className="text-stone-gray mb-2">暂无收藏曲目</p>
            <Link
              href="/search"
              className="text-sm text-terracotta hover:underline"
            >
              去搜索页面发现音乐 →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
