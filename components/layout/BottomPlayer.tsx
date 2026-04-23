'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/lib/store/playerStore'
import { extractDominantColor } from '@/lib/color'
import { motion, AnimatePresence } from 'framer-motion'
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
  ListMusic,
  Repeat,
  Repeat1,
  Shuffle,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'

export default function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [queueOpen, setQueueOpen] = useState(false)
  const [dominantColor, setDominantColor] = useState<string>('var(--color-terracotta)')
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const {
    currentTrack,
    currentCoverUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    view,
    queue,
    queueIndex,
    repeatMode,
    shuffle,
    togglePlay,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setView,
    playNext,
    playPrev,
    cyclePlayMode,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore()

  // 提取封面主色
  useEffect(() => {
    if (!currentCoverUrl) {
      setDominantColor('var(--color-terracotta)')
      return
    }
    extractDominantColor(currentCoverUrl)
      .then((color) => setDominantColor(color))
      .catch(() => setDominantColor('var(--color-terracotta)'))
  }, [currentCoverUrl])

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
      setCurrentTime(0)
      playNext()
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

    audio.play().catch(() => {
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
      <AnimatePresence mode="wait">
        {/* ── MINI 播放器 ── */}
        {view === 'MINI' && (
          <motion.div
            key="mini"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50 h-14 md:h-16 flex items-center px-4 gap-3 md:left-64"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            {/* 封面 */}
            <motion.button
              onClick={() => setView('EXPANDED')}
              className="relative w-10 h-10 rounded-subtle overflow-hidden shrink-0 ring-warm hover:ring-terracotta transition-all"
              layoutId="player-cover"
            >
              {currentCoverUrl ? (
                <Image
                  src={currentCoverUrl}
                  alt={currentTrack.titleJa}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-interactive)' }}>
                  <span className="text-lg">♪</span>
                </div>
              )}
            </motion.button>

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
                onClick={playNext}
                className="p-2 rounded-full transition-colors hover:bg-opacity-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <SkipForward size={18} />
              </button>
              {/* 手机端展开按钮 */}
              <button
                onClick={() => setView('EXPANDED')}
                className="md:hidden p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* 进度条（桌面端） */}
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

            {/* 音量 + 队列 + 展开 */}
            {/* 音量 + 控制（桌面端） */}
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

            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={cyclePlayMode}
                className="p-2 rounded-full transition-colors"
                style={{
                  color: (shuffle || repeatMode !== 'none')
                    ? 'var(--color-terracotta)'
                    : 'var(--text-tertiary)',
                }}
                title={shuffle ? '随机播放' : repeatMode === 'all' ? '列表循环' : repeatMode === 'one' ? '单曲循环' : '顺序播放'}
              >
                {shuffle ? <Shuffle size={16} /> : repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
              <button
                onClick={() => setQueueOpen(!queueOpen)}
                className="p-2 rounded-full transition-colors relative"
                style={{ color: queueOpen ? 'var(--color-terracotta)' : 'var(--text-tertiary)' }}
                title="播放队列"
              >
                <ListMusic size={16} />
                {queue.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-medium"
                    style={{ backgroundColor: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}>
                    {queue.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setView('EXPANDED')}
                className="p-2 rounded-full transition-colors hover:bg-opacity-10"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── EXPANDED 播放器 ── */}
        {view === 'EXPANDED' && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col touch-highlight-none"
            style={{
              backgroundColor: 'var(--bg-page)',
            }}
            onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
            onTouchMove={(e) => {
              if (touchStartY === null) return
              const diff = e.touches[0].clientY - touchStartY
              if (diff > 120) {
                setView('MINI')
                setTouchStartY(null)
              }
            }}
            onTouchEnd={() => setTouchStartY(null)}
          >
            {/* 氛围背景光 */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none transition-colors duration-1000"
              style={{ backgroundColor: dominantColor }}
            />

            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 relative">
              {/* 桌面端收起按钮 */}
              <button
                onClick={() => setView('MINI')}
                className="hidden md:block p-2 rounded-full transition-colors hover:bg-opacity-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Minimize2 size={20} />
              </button>
              {/* 手机端拖拽指示器 + 关闭 */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setView('MINI')}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-label uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Now Playing
              </p>
              <button
                onClick={() => setView('MINI')}
                className="hidden md:block p-2 rounded-full transition-colors hover:bg-opacity-10"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X size={20} />
              </button>
              {/* 手机端占位 */}
              <div className="md:hidden w-10" />
            </div>

            {/* 手机端拖拽指示器 */}
            <div className="md:hidden flex justify-center pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-prominent)' }} />
            </div>

            {/* 主内容 */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 px-4 md:px-8 pb-8 max-w-6xl mx-auto w-full overflow-y-auto relative">
              {/* 左侧: 大封面 */}
              <div className="w-full max-w-xs md:max-w-sm lg:max-w-md aspect-square relative">
                <div
                  className="absolute inset-0 rounded-very blur-3xl opacity-25 scale-90 transition-colors duration-1000"
                  style={{ backgroundColor: dominantColor }}
                />
                <motion.div
                  layoutId="player-cover"
                  className="relative w-full h-full rounded-very overflow-hidden shadow-whisper flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  {currentCoverUrl ? (
                    <Image
                      src={currentCoverUrl}
                      alt={currentTrack.titleJa}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 448px"
                      priority
                    />
                  ) : (
                    <span className="text-8xl">♪</span>
                  )}
                </motion.div>
              </div>

              {/* 右侧: 信息与控制 */}
              <div className="flex flex-col gap-8 w-full max-w-md">
                {/* 曲目信息 */}
                <div className="text-center lg:text-left w-full">
                  {/* Marquee 标题 */}
                  <div className="overflow-hidden w-full">
                    <div className="whitespace-nowrap animate-marquee inline-block">
                      <span className="text-serif text-subheading font-medium" style={{ color: 'var(--text-primary)' }}>
                        {currentTrack.titleJa}&nbsp;&nbsp;&nbsp;&nbsp;{currentTrack.titleJa}
                      </span>
                    </div>
                  </div>
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
                      background: `linear-gradient(to right, ${dominantColor} ${progress}%, var(--bg-interactive) ${progress}%)`,
                    }}
                  />
                  <div className="flex justify-between text-micro font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 控制区 */}
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <button
                    onClick={cyclePlayMode}
                    className="p-2 rounded-full transition-colors"
                    style={{
                      color: (shuffle || repeatMode !== 'none')
                        ? 'var(--color-terracotta)'
                        : 'var(--text-tertiary)',
                    }}
                    title={shuffle ? '随机播放' : repeatMode === 'all' ? '列表循环' : repeatMode === 'one' ? '单曲循环' : '顺序播放'}
                  >
                    {shuffle ? <Shuffle size={20} /> : repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
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
                      backgroundColor: dominantColor,
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
                  <button
                    onClick={() => setQueueOpen(!queueOpen)}
                    className="p-2 rounded-full transition-colors relative"
                    style={{ color: queueOpen ? 'var(--color-terracotta)' : 'var(--text-tertiary)' }}
                    title="播放队列"
                  >
                    <ListMusic size={20} />
                    {queue.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-medium"
                        style={{ backgroundColor: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}>
                        {queue.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* 音量（桌面端） */}
                <div className="hidden md:flex items-center justify-center gap-3">
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

                {/* Credits 预览（桌面端） */}
                <div
                  className="hidden md:block rounded-very p-5"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 队列浮层 ── */}
      <AnimatePresence>
        {queueOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed z-[60] overflow-hidden flex flex-col md:rounded-very md:shadow-whisper queue-sheet"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              bottom: '0',
              left: '0',
              right: '0',
              maxHeight: '60vh',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              paddingBottom: 'env(safe-area-inset-bottom)',
              '--queue-bottom': view === 'MINI' ? '72px' : '24px',
            } as React.CSSProperties}
          >
            {/* 队列头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                播放队列 <span style={{ color: 'var(--text-tertiary)' }}>({queue.length})</span>
              </h3>
              <div className="flex items-center gap-1">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    title="清空队列"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setQueueOpen(false)}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* 队列列表 */}
            <div className="flex-1 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <ListMusic size={24} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    队列是空的
                  </p>
                </div>
              ) : (
                <div className="flex flex-col py-1">
                  {queue.map((track, idx) => {
                    const isCurrent = idx === queueIndex
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        className="group flex items-center gap-3 px-4 py-2.5 transition-colors"
                        style={{
                          backgroundColor: isCurrent ? 'var(--bg-interactive)' : 'transparent',
                        }}
                      >
                        <span
                          className="w-5 text-center text-xs font-mono shrink-0"
                          style={{ color: isCurrent ? 'var(--color-terracotta)' : 'var(--text-tertiary)' }}
                        >
                          {isCurrent ? '▶' : idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: isCurrent ? 'var(--color-terracotta)' : 'var(--text-primary)' }}
                          >
                            {track.titleJa}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {track.artistIds.slice(0, 2).join(', ')}
                            {track.artistIds.length > 2 && '...'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromQueue(idx)}
                          className="p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          style={{ color: 'var(--text-tertiary)' }}
                          title="移除"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
