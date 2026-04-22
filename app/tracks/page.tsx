import { getAllTracks, getAllReleases } from '@/lib/data'
import TrackListClient from './TrackListClient'

export const revalidate = 86400

export default async function TracksPage() {
  const [tracks, releases] = await Promise.all([
    getAllTracks(),
    getAllReleases(),
  ])

  return <TrackListClient tracks={tracks} releases={releases} />
}
