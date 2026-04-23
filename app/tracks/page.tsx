import { getAllTracks, getTracksBySeries, getAllReleases } from '@/lib/data'
import type { SeriesBrand } from '@/types'
import TrackListClient from './TrackListClient'

export const revalidate = 86400

export default async function TracksPage({ searchParams }: { searchParams: Promise<{ series?: string }> }) {
  const { series } = await searchParams
  const seriesBrand = series as SeriesBrand | undefined
  const [tracks, releases] = await Promise.all([
    seriesBrand ? getTracksBySeries(seriesBrand) : getAllTracks(),
    getAllReleases(),
  ])

  return <TrackListClient tracks={tracks} releases={releases} seriesFilter={seriesBrand} />
}
