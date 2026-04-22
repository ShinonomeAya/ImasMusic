import { getAllTracks, getAllReleases } from '@/lib/data'
import SearchClient from './SearchClient'

export const revalidate = 86400

export default async function SearchPage() {
  const [tracks, releases] = await Promise.all([
    getAllTracks(),
    getAllReleases(),
  ])

  return <SearchClient tracks={tracks} releases={releases} />
}
