'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/lib/store/playerStore'

export default function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const store = usePlayerStore.getState()
      const { currentTrack, isPlaying, volume, view, togglePlay, playNext, playPrev, setVolume, setView, setPlaying } = store

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (currentTrack) {
            togglePlay()
          }
          break

        case 'ArrowLeft':
          if (currentTrack) {
            e.preventDefault()
            playPrev()
          }
          break

        case 'ArrowRight':
          if (currentTrack) {
            e.preventDefault()
            playNext()
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.05))
          break

        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.05))
          break

        case 'm':
        case 'M':
          setVolume(volume === 0 ? 0.8 : 0)
          break

        case 'f':
        case 'F':
          if (currentTrack) {
            setView(view === 'EXPANDED' ? 'MINI' : 'EXPANDED')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}
