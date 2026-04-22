'use client'

import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/lib/store/playerStore'
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Volume2 } from 'lucide-react'
import Image from 'next/image'

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    view,
    togglePlay,
    setView,
    setCurrentTime,
  } = usePlayerStore()

  if (view === 'HIDDEN' || !currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* ── MINI 播放器 ── */}
      {view === 'MINI' && (
        <div
          className="fixed bottom-0 left-64 right-0 z-50 h-16 flex items-center px-4 gap-4 transition-colors duration-300 animate-slide-up"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          {/* 封面 */}
          <button
            onClick={() => setView('EXPANDED')}
            className="relative w-10 h-10 rounded-subtle overflow-hidden shrink-0 ring-warm hover:ring-terracotta transition-all"
          >
            <Image
              src={currentTrack.releaseId ? `/api/placeholder?release=${currentTrack.releaseId}` : '/placeholder-album.png'}
              alt={currentTrack.titleJa}
              fill
              className="object-cover"
              sizes="40px"
            />
          </button>

          {/* 曲目信息 */}
          <button
            onClick={() => setView('EXPANDED')}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {currentTrack.titleJa}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
              {currentTrack.artistIds.join(', ')}
            </p>
          </button>

          {/* 控制按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-terracotta)',
                color: 'var(--color-ivory)',
              }}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button
              onClick={() => {}}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* 进度条 */}
          <div className="hidden md:flex items-center gap-3 w-48">
            <span className="text-micro font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-interactive)' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--color-terracotta)',
                }}
              />
            </div>
            <span className="text-micro font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* 展开按钮 */}
          <button
            onClick={() => setView('EXPANDED')}
            className="p-2 rounded-full transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {/* ── EXPANDED 播放器 (Drawer 面板) ── */}
      {view === 'EXPANDED' && (
        <div
          className="fixed inset-0 z-50 flex flex-col animate-fade-in"
          style={{ backgroundColor: 'var(--bg-page)' }}
        >
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setView('MINI')}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Minimize2 size={20} />
            </button>
            <p className="text-label uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Now Playing
            </p>
            <div className="w-10" />
          </div>

          {/* 主内容区 */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 pb-8 max-w-6xl mx-auto w-full">
            {/* 左侧: 大封面 */}
            <div className="w-full max-w-md lg:max-w-lg aspect-square relative">
              <div
                className="absolute inset-0 rounded-very blur-3xl opacity-30 scale-90"
                style={{
                  backgroundColor: 'var(--active-brand, var(--color-terracotta))',
                }}
              />
              <div className="relative w-full h-full rounded-very overflow-hidden shadow-whisper">
                <Image
                  src={currentTrack.releaseId ? `/api/placeholder?release=${currentTrack.releaseId}` : '/placeholder-album.png'}
                  alt={currentTrack.titleJa}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 512px"
                  priority
                />
              </div>
            </div>

            {/* 右侧: 信息与控制 */}
            <div className="flex flex-col gap-8 w-full max-w-md">
              {/* 曲目信息 */}
              <div>
                <h2 className="text-serif text-subheading font-medium" style={{ color: 'var(--text-primary)' }}>
                  {currentTrack.titleJa}
                </h2>
                <p className="text-body-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {currentTrack.artistIds.join(', ')}
                </p>
              </div>

              {/* 进度条 */}
              <div className="flex flex-col gap-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: 'var(--active-brand, var(--color-terracotta))',
                    }}
                  />
                </div>
                <div className="flex justify-between text-micro font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 控制区 */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => {}}
                  className="p-3 rounded-full transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--active-brand, var(--color-terracotta))',
                    color: 'var(--color-ivory)',
                  }}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button
                  onClick={() => {}}
                  className="p-3 rounded-full transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* 音量 */}
              <div className="flex items-center gap-3">
                <Volume2 size={18} style={{ color: 'var(--text-tertiary)' }} />
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${volume * 100}%`,
                      backgroundColor: 'var(--text-secondary)',
                    }}
                  />
                </div>
              </div>

              {/* Credits 预览 (占位) */}
              <div
                className="rounded-very p-5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <h3 className="text-label uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Credits
                </h3>
                <div className="space-y-2">
                  {currentTrack.credits?.map((credit, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{credit.role}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{credit.artistId}</span>
                    </div>
                  )) || (
                    <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
                      暂无 Credits 数据
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
