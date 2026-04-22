import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types'

type RepeatMode = 'none' | 'all' | 'one'

interface PlayerStore {
  // ── State ──
  currentTrack: Track | null
  currentCoverUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  queueIndex: number
  view: 'HIDDEN' | 'MINI' | 'EXPANDED'
  repeatMode: RepeatMode
  shuffle: boolean
  shuffledQueue: Track[] // 打乱后的索引映射（存 track id 列表）

  // ── Actions ──
  setTrack: (track: Track | null, coverUrl?: string) => void
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setView: (view: 'HIDDEN' | 'MINI' | 'EXPANDED') => void
  playNext: () => void
  playPrev: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setRepeatMode: (mode: RepeatMode) => void
  setShuffle: (shuffle: boolean) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildShuffledQueue(queue: Track[], currentIndex: number): Track[] {
  if (queue.length <= 1) return [...queue]
  const others = queue.filter((_, i) => i !== currentIndex)
  const shuffled = shuffleArray(others)
  // 把当前曲目放第一个，然后随机排列其余
  return currentIndex >= 0 ? [queue[currentIndex], ...shuffled] : shuffled
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      currentCoverUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 30,
      volume: 0.8,
      queue: [],
      queueIndex: -1,
      view: 'HIDDEN',
      repeatMode: 'none',
      shuffle: false,
      shuffledQueue: [],

      setTrack: (track, coverUrl) => {
        if (!track) {
          set({
            currentTrack: null,
            currentCoverUrl: null,
            isPlaying: false,
            currentTime: 0,
            view: 'HIDDEN',
          })
          return
        }

        const state = get()
        const existingIndex = state.queue.findIndex((t) => t.id === track.id)
        let newQueue = [...state.queue]
        let newIndex = existingIndex

        if (existingIndex === -1) {
          // 如果不在队列中，追加到末尾
          newQueue.push(track)
          newIndex = newQueue.length - 1
        }

        const newShuffled = state.shuffle
          ? buildShuffledQueue(newQueue, newIndex)
          : state.shuffledQueue

        set({
          currentTrack: track,
          currentCoverUrl: coverUrl || null,
          isPlaying: true,
          currentTime: 0,
          queue: newQueue,
          queueIndex: newIndex,
          view: 'MINI',
          shuffledQueue: newShuffled,
        })
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      setPlaying: (playing) => set({ isPlaying: playing }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume }),

      setView: (view) => set({ view }),

      playNext: () => {
        const { queue, queueIndex, shuffledQueue, shuffle, repeatMode } = get()
        const activeQueue = shuffle && shuffledQueue.length > 0 ? shuffledQueue : queue
        const currentId = queue[queueIndex]?.id
        const activeIndex = activeQueue.findIndex((t) => t.id === currentId)

        if (repeatMode === 'one') {
          // 单曲循环：重新播放当前曲目
          set((s) => ({ currentTime: 0, isPlaying: true }))
          return
        }

        const nextIndex = activeIndex + 1
        if (nextIndex < activeQueue.length) {
          const nextTrack = activeQueue[nextIndex]
          const realIndex = queue.findIndex((t) => t.id === nextTrack.id)
          set({
            queueIndex: realIndex >= 0 ? realIndex : nextIndex,
            currentTrack: nextTrack,
            currentTime: 0,
            isPlaying: true,
          })
        } else if (repeatMode === 'all' && activeQueue.length > 0) {
          // 列表循环：回到第一首
          const firstTrack = activeQueue[0]
          const realIndex = queue.findIndex((t) => t.id === firstTrack.id)
          set({
            queueIndex: realIndex >= 0 ? realIndex : 0,
            currentTrack: firstTrack,
            currentTime: 0,
            isPlaying: true,
          })
        }
        // repeatMode === 'none' 且到末尾：停止播放
      },

      playPrev: () => {
        const { queue, queueIndex, shuffledQueue, shuffle } = get()
        const activeQueue = shuffle && shuffledQueue.length > 0 ? shuffledQueue : queue
        const currentId = queue[queueIndex]?.id
        const activeIndex = activeQueue.findIndex((t) => t.id === currentId)

        const prevIndex = activeIndex - 1
        if (prevIndex >= 0) {
          const prevTrack = activeQueue[prevIndex]
          const realIndex = queue.findIndex((t) => t.id === prevTrack.id)
          set({
            queueIndex: realIndex >= 0 ? realIndex : prevIndex,
            currentTrack: prevTrack,
            currentTime: 0,
            isPlaying: true,
          })
        }
      },

      addToQueue: (track) =>
        set((s) => {
          if (s.queue.some((t) => t.id === track.id)) return s // 去重
          const newQueue = [...s.queue, track]
          return {
            queue: newQueue,
            shuffledQueue: s.shuffle
              ? buildShuffledQueue(newQueue, s.queueIndex)
              : s.shuffledQueue,
          }
        }),

      removeFromQueue: (index) =>
        set((s) => {
          if (index < 0 || index >= s.queue.length) return s
          const newQueue = s.queue.filter((_, i) => i !== index)
          let newIndex = s.queueIndex
          if (index < s.queueIndex) {
            newIndex = s.queueIndex - 1
          } else if (index === s.queueIndex) {
            // 移除当前播放曲目，停止播放
            return {
              queue: newQueue,
              queueIndex: -1,
              currentTrack: null,
              isPlaying: false,
              currentTime: 0,
              shuffledQueue: s.shuffle
                ? buildShuffledQueue(newQueue, -1)
                : s.shuffledQueue,
            }
          }
          return {
            queue: newQueue,
            queueIndex: newIndex,
            shuffledQueue: s.shuffle
              ? buildShuffledQueue(newQueue, newIndex)
              : s.shuffledQueue,
          }
        }),

      clearQueue: () =>
        set({
          queue: [],
          queueIndex: -1,
          shuffledQueue: [],
        }),

      setRepeatMode: (mode) => set({ repeatMode: mode }),

      setShuffle: (shuffle) =>
        set((s) => ({
          shuffle,
          shuffledQueue: shuffle
            ? buildShuffledQueue(s.queue, s.queueIndex)
            : [],
        })),
    }),
    {
      name: 'imas-player-state',
      partialize: (state) => ({
        volume: state.volume,
        view: state.view,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
      }),
    }
  )
)
