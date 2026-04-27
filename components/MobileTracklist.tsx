'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Track } from '@/types'
import TrackPlayButton from './TrackPlayButton'
import FavoriteButton from './FavoriteButton'
import { Clock } from 'lucide-react'

interface MobileTracklistProps {
  tracks: Track[]
  showCover?: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MobileTracklist({ tracks, showCover = true }: MobileTracklistProps) {
  if (tracks.length === 0) return null

  return (
    <div className="flex flex-col">
      {tracks.map((track, idx) => (
        <Link
          key={track.id}
          href={`/track/${track.id}`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-opacity-50"
          style={{
            borderBottom: idx < tracks.length - 1 ? '1px solid var(--border-default)' : 'none',
          }}
        >
          {/* 序号 */}
          <span className="w-5 text-center text-sm font-mono shrink-0" style={{ color: 'var(--text-tertiary)' }}>
            {idx + 1}
          </span>

          {/* 封面 */}
          {showCover && track.coverUrl && (
            <div className="relative w-10 h-10 rounded-subtle overflow-hidden shrink-0">
              <Image
                src={track.coverUrl}
                alt={track.titleJa}
                fill
                className="object-cover"
                sizes="40px"
                loading="lazy"
              />
            </div>
          )}

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {track.titleJa}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
              {track.artistIds.slice(0, 2).join(', ')}
              {track.artistIds.length > 2 && '...'}
            </p>
          </div>

          {/* 操作 + 时长 */}
          <div className="flex items-center gap-2 shrink-0">
            {track.previewUrl && (
              <TrackPlayButton track={track} size="sm" coverUrl={track.coverUrl} />
            )}
            <FavoriteButton
              item={{
                id: track.id,
                type: 'track',
                title: track.titleJa,
                subtitle: track.artistIds.join(', '),
              }}
              size="sm"
            />
            {track.durationSec && (
              <span className="text-xs font-mono flex items-center gap-0.5" style={{ color: 'var(--text-tertiary)' }}>
                <Clock size={10} />
                {formatTime(track.durationSec)}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
