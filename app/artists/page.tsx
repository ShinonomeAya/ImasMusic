import { getAllArtists } from '@/lib/data'
import ArtistGrid from './ArtistGrid'

export const revalidate = 86400

export default async function ArtistsPage() {
  const artists = await getAllArtists()

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-section font-serif font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          艺人目录
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          探索偶像、组合、声优与创作者
        </p>
      </div>

      <ArtistGrid artists={artists} />
    </div>
  )
}
