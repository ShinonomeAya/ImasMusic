'use client'

import { useState, useEffect, useCallback } from 'react'

export interface FavoriteItem {
  id: string
  type: 'track' | 'release'
  title: string
  subtitle: string
  coverUrl?: string
}

const STORAGE_KEY = 'imas-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setFavorites(JSON.parse(raw))
      } catch {
        setFavorites([])
      }
    }
    setLoaded(true)
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  )

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev
      const next = [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      if (isFavorite(item.id)) {
        removeFavorite(item.id)
      } else {
        addFavorite(item)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  return { favorites, loaded, isFavorite, addFavorite, removeFavorite, toggleFavorite }
}
