'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Music, Disc } from 'lucide-react'

interface FavoriteItem {
  id: string
  type: 'track' | 'release'
  title: string
  subtitle: string
  coverUrl?: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('imas-favorites')
    if (raw) {
      try {
        setFavorites(JSON.parse(raw))
      } catch {
        setFavorites([])
      }
    }
    setLoaded(true)
  }, [])

  const removeFavorite = (id: string) => {
    const next = favorites.filter((f) => f.id !== id)
    setFavorites(next)
    localStorage.setItem('imas-favorites', JSON.stringify(next))
  }

  if (!loaded) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="animate-pulse h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-interactive)' }} />
      </div>
    )
  }

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          我的收藏
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          {favorites.length} 个项目
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-body-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            暂无收藏
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            浏览曲目和专辑时点击 ♥ 即可收藏
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-very group"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              <Link href={`/${item.type}/${item.id}`} className="relative w-14 h-14 rounded-comfortable overflow-hidden shrink-0">
                {item.coverUrl ? (
                  <Image src={item.coverUrl} alt={item.title} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                    {item.type === 'track' ? <Music size={20} style={{ color: 'var(--text-tertiary)' }} /> : <Disc size={20} style={{ color: 'var(--text-tertiary)' }} />}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/${item.type}/${item.id}`}>
                  <p className="text-sm font-medium truncate hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </p>
                </Link>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {item.subtitle}
                </p>
              </div>
              <button
                onClick={() => removeFavorite(item.id)}
                className="p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--color-terracotta)' }}
              >
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
