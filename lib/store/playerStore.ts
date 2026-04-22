import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '@/types'

interface PlayerStore {
  // ── State ──
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  queueIndex: number
  view: 'HIDDEN' | 'MINI' | 'EXPANDED'

  // ── Actions ──
  setTrack: (track: Track | null) => void
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setView: (view: 'HIDDEN' | 'MINI' | 'EXPANDED') => void
  playNext: () => void
  playPrev: () => void
  addToQueue: (track: Track) => void
  clearQueue: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 30,
      volume: 0.8,
      queue: [],
      queueIndex: -1,
      view: 'HIDDEN',

      setTrack: (track) =>
        set({
          currentTrack: track,
          isPlaying: !!track,
          currentTime: 0,
          view: track ? 'MINI' : 'HIDDEN',
        }),

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      setPlaying: (playing) => set({ isPlaying: playing }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume }),

      setView: (view) => set({ view }),

      playNext: () => {
        const { queue, queueIndex } = get()
        if (queue.length === 0) return
        const nextIndex = queueIndex + 1
        if (nextIndex < queue.length) {
          set({
            queueIndex: nextIndex,
            currentTrack: queue[nextIndex],
            currentTime: 0,
            isPlaying: true,
          })
        }
      },

      playPrev: () => {
        const { queue, queueIndex } = get()
        if (queue.length === 0) return
        const prevIndex = queueIndex - 1
        if (prevIndex >= 0) {
          set({
            queueIndex: prevIndex,
            currentTrack: queue[prevIndex],
            currentTime: 0,
            isPlaying: true,
          })
        }
      },

      addToQueue: (track) =>
        set((s) => ({
          queue: [...s.queue, track],
        })),

      clearQueue: () =>
        set({
          queue: [],
          queueIndex: -1,
        }),
    }),
    {
      name: 'imas-player-state',
      partialize: (state) => ({
        volume: state.volume,
        view: state.view,
      }),
    }
  )
)
