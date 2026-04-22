import { getAllReleases, getReleasesBySeries } from '@/lib/data'
import type { SeriesBrand } from '@/types'
import ReleaseList from './ReleaseList'

export const revalidate = 86400

export default async function ReleasesPage({ searchParams }: { searchParams: Promise<{ series?: string }> }) {
  const { series } = await searchParams
  const seriesBrand = series as SeriesBrand | undefined
  const releases = seriesBrand ? await getReleasesBySeries(seriesBrand) : await getAllReleases()

  return <ReleaseList releases={releases} seriesFilter={seriesBrand} />
}
