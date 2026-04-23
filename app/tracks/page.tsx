import { Suspense } from 'react'
import { getAllTracks, getAllReleases } from '@/lib/data'
import TrackListClient from './TrackListClient'

export default async function TracksPage() {
  const [tracks, releases] = await Promise.all([
    getAllTracks(),
    getAllReleases(),
  ])

  return (
    <Suspense fallback={<div className="px-4 md:px-8 py-10 max-w-7xl mx-auto text-center text-tertiary">加载中...</div>}>
      <TrackListClient tracks={tracks} releases={releases} />
    </Suspense>
  )
}
