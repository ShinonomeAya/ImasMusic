'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSongById, getSimilarSongs } from '@/lib/data'
import { getGenreConfig } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { ExternalLink, Disc, Users } from 'lucide-react'

export default function SongPage() {
  const params = useParams()
  const songId = params.id as string
  const song = getSongById(songId)

  if (!song) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">歌曲不存在</h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  const genre = getGenreConfig(song.primaryGenre)
  const series = getSeriesConfig(song.series)
  const similarSongs = getSimilarSongs(songId, 6)
  const sortedReleases = [...song.releases].sort((a, b) => a.year - b.year)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="py-12 px-4" style={{ backgroundColor: genre.color.light + '15' }}>
        <div className="container-claude">
          <Link href={'/series/' + song.series} className="inline-block px-3 py-1 rounded-full text-sm mb-4" style={{ backgroundColor: series.color.light + '30', color: series.color.light }}>{series.shortName}</Link>
          <h1 className="text-4xl md:text-5xl font-medium text-near-black mb-2 text-serif">{song.titleJa}</h1>
          <p className="text-xl text-olive-gray mb-1">{song.titleZh}</p>
          <p className="text-lg text-stone-gray italic">{song.titleRomaji}</p>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card-claude p-6">
              <h2 className="text-lg text-near-black mb-4 text-serif">创作者</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-stone-gray uppercase tracking-wider mb-1">作曲</p><p className="font-medium text-near-black">{song.composer}</p></div>
                <div><p className="text-xs text-stone-gray uppercase tracking-wider mb-1">作词</p><p className="font-medium text-near-black">{song.lyricist}</p></div>
                <div><p className="text-xs text-stone-gray uppercase tracking-wider mb-1">编曲</p><p className="font-medium text-near-black">{song.arranger}</p></div>
              </div>
            </div>

            {song.isCover && song.originalArtist && (
              <div className="card-claude p-6">
                <h2 className="text-lg text-near-black mb-2 text-serif flex items-center gap-2"><Disc className="w-5 h-5 text-terracotta" />翻唱曲</h2>
                <p className="text-olive-gray">原唱: <span className="font-medium text-near-black">{song.originalArtist}</span></p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-claude p-6">
              <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-2">主要风格</h3>
              <div className="inline-block px-4 py-2 rounded-full text-white font-medium" style={{ backgroundColor: genre.color.light }}>{genre.nameZh}</div>
            </div>

            <div className="card-claude p-6">
              <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4">歌曲属性</h3>
              <div className="flex items-center justify-between"><span className="text-olive-gray">首次发行</span><span className="font-medium text-near-black">{song.firstYear}</span></div>
              <div className="flex items-center justify-between mt-2"><span className="text-olive-gray">翻唱曲</span><span className="font-medium text-near-black">{song.isCover ? '是' : '否'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
