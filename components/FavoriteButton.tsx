'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/hooks'
import type { FavoriteItem } from '@/lib/hooks'

interface FavoriteButtonProps {
  item: FavoriteItem
  size?: 'sm' | 'md'
}

export default function FavoriteButton({ item, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, loaded } = useFavorites()

  if (!loaded) {
    return (
      <div
        className={`${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} rounded-comfortable animate-pulse`}
        style={{ backgroundColor: 'var(--bg-interactive)' }}
      />
    )
  }

  const favorited = isFavorite(item.id)
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(item)
      }}
      className={`${btnSize} rounded-comfortable flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        color: favorited ? 'var(--color-terracotta)' : 'var(--text-secondary)',
      }}
      title={favorited ? '取消收藏' : '加入收藏'}
    >
      <Heart size={iconSize} fill={favorited ? 'currentColor' : 'none'} />
    </button>
  )
}
