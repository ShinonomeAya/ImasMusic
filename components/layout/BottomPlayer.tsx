'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/lib/store/playerStore'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import Image from 'next/image'

export default function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    view,
    togglePlay,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setView,
    playNext,
    playPrev,
  } = usePlayerStore()

  // 初始化/切换音频源
  useEffect(() => {
    if (!currentTrack?.previewUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    const audio = new Audio(currentTrack.previewUrl)
    audio.volume = volume
    audioRef.current = audio

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration || 30)
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => {
      console.error('Audio load error:', currentTrack.previewUrl)
      setPlaying(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    // 自动播放
    audio.play().catch(() => {
      // 浏览器自动播放策略可能阻止
      setPlaying(false)
    })

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audioRef.current = null
    }
  }, [currentTrack?.previewUrl])

  // 播放/暂停控制
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value)
      if (audioRef.current) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
      }
    },
    [setCurrentTime]
  )

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value))
    },
    [setVolume]
  )

  if (view === 'HIDDEN' || !currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* ── MINI 播放器 ── */}
      {view === 'MINI' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-3 transition-colors duration-300 animate-slide-up"
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
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
              <span className="text-lg">♪</span>
            </div>
          </button>

          {/* 曲目信息 */}
          <button onClick={() => setView('EXPANDED')} className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {currentTrack.titleJa}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
              {currentTrack.artistIds.slice(0, 2).join(', ')}
              {currentTrack.artistIds.length > 2 && '...'}
            </p>
          </button>

          {/* 控制按钮 */}
          <div className="flex items-center gap-1">
            <button
              onClick={playPrev}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10 hidden sm:block"
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
              onClick={playNext}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10 hidden sm:block"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* 进度条 */}
          <div className="hidden md:flex items-center gap-3 w-40 lg:w-56">
            <span className="text-micro font-mono w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-terracotta) ${progress}%, var(--bg-interactive) ${progress}%)`,
              }}
            />
            <span className="text-micro font-mono w-8" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* 音量 + 展开 */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--text-secondary) ${volume * 100}%, var(--bg-interactive) ${volume * 100}%)`,
              }}
            />
          </div>

          <button
            onClick={() => setView('EXPANDED')}
            className="p-2 rounded-full transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {/* ── EXPANDED 播放器 ── */}
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
            <button
              onClick={() => setView('HIDDEN')}
              className="p-2 rounded-full transition-colors hover:bg-opacity-10"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* 主内容 */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 pb-8 max-w-6xl mx-auto w-full overflow-y-auto">
            {/* 左侧: 大封面 */}
            <div className="w-full max-w-sm lg:max-w-md aspect-square relative">
              <div
                className="absolute inset-0 rounded-very blur-3xl opacity-20 scale-90"
                style={{ backgroundColor: 'var(--active-brand, var(--color-terracotta))' }}
              />
              <div className="relative w-full h-full rounded-very overflow-hidden shadow-whisper flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-8xl">♪</span>
              </div>
            </div>

            {/* 右侧: 信息与控制 */}
            <div className="flex flex-col gap-8 w-full max-w-md">
              {/* 曲目信息 */}
              <div className="text-center lg:text-left">
                <h2 className="text-serif text-subheading font-medium" style={{ color: 'var(--text-primary)' }}>
                  {currentTrack.titleJa}
                </h2>
                <p className="text-body-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {currentTrack.artistIds.join(', ')}
                </p>
                {currentTrack.bpm && (
                  <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {currentTrack.bpm} BPM
                  </p>
                )}
              </div>

              {/* 进度条 */}
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 30}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--active-brand, var(--color-terracotta)) ${progress}%, var(--bg-interactive) ${progress}%)`,
                  }}
                />
                <div className="flex justify-between text-micro font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 控制区 */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={playPrev}
                  className="p-3 rounded-full transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-5 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--active-brand, var(--color-terracotta))',
                    color: 'var(--color-ivory)',
                  }}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button
                  onClick={playNext}
                  className="p-3 rounded-full transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* 音量 */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--text-secondary) ${volume * 100}%, var(--bg-interactive) ${volume * 100}%)`,
                  }}
                />
              </div>

              {/* Credits 预览 */}
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
                  {currentTrack.credits?.length ? (
                    currentTrack.credits.map((credit, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>{credit.role}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{credit.artistId}</span>
                      </div>
                    ))
                  ) : (
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
