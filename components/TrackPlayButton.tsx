'use client'

import { Play, Pause } from 'lucide-react'
import { usePlayerStore } from '@/lib/store/playerStore'
import type { Track } from '@/types'

interface TrackPlayButtonProps {
  track: Track
  size?: 'sm' | 'md'
  coverUrl?: string
}

export default function TrackPlayButton({ track, size = 'md', coverUrl }: TrackPlayButtonProps) {
  const { currentTrack, isPlaying, setTrack } = usePlayerStore()
  const isCurrentTrack = currentTrack?.id === track.id
  const isActive = isCurrentTrack && isPlaying

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCurrentTrack) {
      // 如果已经是当前曲目，切换播放/暂停由 BottomPlayer 处理
      // 这里直接重新设置 track 会触发播放
      usePlayerStore.getState().togglePlay()
    } else {
      setTrack(track, coverUrl)
    }
  }

  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={handleClick}
      className={`${btnSize} rounded-comfortable flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95`}
      style={{
        backgroundColor: isActive ? 'var(--color-terracotta)' : 'var(--color-terracotta)',
        color: 'var(--color-ivory)',
      }}
      title={isActive ? '暂停' : '播放'}
    >
      {isActive ? (
        <Pause size={iconSize} fill="currentColor" />
      ) : (
        <Play size={iconSize} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  )
}
