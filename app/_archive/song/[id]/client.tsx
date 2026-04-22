'use client'

import Link from 'next/link'
import { getSongById, getSimilarSongs } from '@/lib/data'
import { getGenreConfig } from '@/styles/genres.config'
import { getSeriesConfig } from '@/styles/series.config'
import { ExternalLink, Disc, Users, Youtube, Music2, Heart } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks'

export default function SongPageClient({ id }: { id: string }) {
  const song = getSongById(id)
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', [])

  if (!song) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-near-black mb-4 text-serif">
            歌曲不存在
          </h1>
          <Link href="/" className="text-terracotta hover:underline text-sm">返回首页</Link>
        </div>
      </main>
    )
  }

  const genre = getGenreConfig(song.primaryGenre)
  const series = getSeriesConfig(song.series)
  const similarSongs = getSimilarSongs(id, 6)
  const sortedReleases = [...song.releases].sort((a, b) => a.year - b.year)
  const isFavorited = favorites.includes(song.id)

  const toggleFavorite = () => {
    setFavorites(prev =>
      prev.includes(song.id) ? prev.filter(fid => fid !== song.id) : [...prev, song.id]
    )
  }

  return (
    <main className="min-h-screen bg-parchment">
      {/* Hero */}
      <div className="section-claude px-4 border-b border-border-warm" style={{ backgroundColor: `${genre.color.light}12` }}>
        <div className="container-claude">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/series/${song.series}`}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors"
              style={{ backgroundColor: `${series.color.light}25`, color: series.color.light }}
            >
              {series.shortName}
            </Link>
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorited
                  ? 'text-terracotta bg-ivory'
                  : 'text-stone-gray hover:text-terracotta hover:bg-ivory'
              }`}
              title={isFavorited ? '取消收藏' : '加入收藏'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
          <h1
            className="text-4xl md:text-5xl text-near-black mb-2 text-serif"
            style={{ lineHeight: 1.15 }}
          >
            {song.titleJa}
          </h1>
          <p className="text-xl text-olive-gray mb-1">{song.titleZh}</p>
          <p className="text-lg text-stone-gray italic">{song.titleRomaji}</p>
        </div>
      </div>

      <div className="container-claude py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 创作者 */}
            <div className="bg-ivory rounded-very p-6 border border-border-cream">
              <h2
                className="text-lg text-near-black mb-4 text-serif"
              >
                创作者
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-stone-gray uppercase tracking-wider mb-1">作曲</p>
                  <p className="font-medium text-near-black">{song.composer}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-gray uppercase tracking-wider mb-1">作词</p>
                  <p className="font-medium text-near-black">{song.lyricist}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-gray uppercase tracking-wider mb-1">编曲</p>
                  <Link href={`/arranger/${encodeURIComponent(song.arranger)}`} className="font-medium text-near-black hover:text-terracotta transition-colors">
                    {song.arranger}
                  </Link>
                </div>
              </div>
            </div>

            {/* 演唱者 */}
            <div className="bg-ivory rounded-very p-6 border border-border-cream">
              <h2
                className="text-lg text-near-black mb-4 flex items-center gap-2 text-serif"
              >
                <Users className="w-5 h-5 text-terracotta" />
                演唱者
              </h2>
              <div className="flex flex-wrap gap-2">
                {song.idols.map(idol => (
                  <Link key={idol.id} href={`/idol/${idol.id}`}>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parchment rounded-lg text-sm text-near-black hover:bg-warm-sand transition-colors border border-border-cream">
                      {idol.nameJa}
                    </span>
                  </Link>
                ))}
                {song.unit && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parchment rounded-lg text-sm text-olive-gray border border-border-cream">
                    组合: {song.unit}
                  </span>
                )}
              </div>
            </div>

            {/* 翻唱信息 */}
            {song.isCover && song.originalArtist && (
              <div className="bg-ivory rounded-very p-6 border border-border-cream">
                <h2
                  className="text-lg text-near-black mb-2 flex items-center gap-2 text-serif"
                >
                  <Music2 className="w-5 h-5 text-terracotta" />
                  翻唱曲
                </h2>
                <p className="text-olive-gray">
                  原唱: <span className="font-medium text-near-black">{song.originalArtist}</span>
                </p>
              </div>
            )}

            {/* 版本列表 */}
            {sortedReleases.length > 0 && (
              <div className="bg-ivory rounded-very p-6 border border-border-cream">
                <h2
                  className="text-lg text-near-black mb-4 flex items-center gap-2 text-serif"
                >
                  <Disc className="w-5 h-5 text-terracotta" />
                  收录版本
                </h2>
                <div className="space-y-3">
                  {sortedReleases.map((release, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-very bg-parchment border border-border-cream"
                    >
                      <div>
                        <p className="font-medium text-near-black">{release.album}</p>
                        <p className="text-xs text-stone-gray mt-0.5">
                          {release.year} · {release.type === 'single' ? '单曲' : release.type === 'album' ? '专辑' : release.type === 'game' ? '游戏' : 'DLC'}
                        </p>
                      </div>
                      <span className="text-sm text-stone-gray">{release.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 相似推荐 */}
            {similarSongs.length > 0 && (
              <div>
                <h2
                  className="text-lg text-near-black mb-4 text-serif"
                >
                  相似推荐
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarSongs.map(similar => {
                    const simGenre = getGenreConfig(similar.primaryGenre)
                    const simSeries = getSeriesConfig(similar.series)
                    return (
                      <Link key={similar.id} href={`/song/${similar.id}`}>
                        <div className="p-4 bg-ivory rounded-very border border-border-cream hover:border-ring-warm transition-all hover:shadow-whisper">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-xs shrink-0"
                              style={{ backgroundColor: simSeries?.color.light }}
                            >
                              {simSeries?.shortName.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-near-black truncate">{similar.titleJa}</h3>
                              <p className="text-xs text-stone-gray truncate">{similar.titleZh}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-gray">
                            <span
                              className="px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: simGenre?.color.light }}
                            >
                              {simGenre?.nameZh}
                            </span>
                            <span>能量 {similar.energy}</span>
                            <span>·</span>
                            <span>情绪 {similar.valence}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 主要风格 */}
            <div className="bg-ivory rounded-very p-6 border border-border-cream">
              <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-3">主要风格</h3>
              <Link href={`/genre/${song.primaryGenre}`}>
                <span
                  className="inline-block px-4 py-2 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: genre.color.light }}
                >
                  {genre.nameZh}
                </span>
              </Link>
              <p className="text-sm text-olive-gray mt-3 leading-relaxed">{genre.description}</p>
            </div>

            {/* 歌曲属性 */}
            <div className="bg-ivory rounded-very p-6 border border-border-cream">
              <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4">歌曲属性</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-olive-gray">首次发行</span>
                  <span className="font-medium text-near-black">{song.firstYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-olive-gray">类型</span>
                  <span className="font-medium text-near-black">
                    {song.usage === 'character' ? '角色曲' : song.usage === 'unit' ? '组合曲' : song.usage === 'event' ? '活动曲' : song.usage === 'theme' ? '主题曲' : song.usage === 'ingame' ? '游戏收录' : '翻唱曲'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-olive-gray">翻唱曲</span>
                  <span className="font-medium text-near-black">{song.isCover ? '是' : '否'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-olive-gray">属性</span>
                  <span className="font-medium text-near-black">
                    {song.idolAttribute === 'cute' ? 'Cute' : song.idolAttribute === 'cool' ? 'Cool' : song.idolAttribute === 'passion' ? 'Passion' : '—'}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-cream">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-olive-gray">能量</span>
                    <span className="font-medium text-near-black">{song.energy}/10</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-warm-sand overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${song.energy * 10}%`, backgroundColor: series.color.light }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-olive-gray">情绪</span>
                    <span className="font-medium text-near-black">{song.valence}/10</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-warm-sand overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${song.valence * 10}%`, backgroundColor: series.color.light }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 外部链接 */}
            {(song.externalLinks.youtube || song.externalLinks.niconico || song.externalLinks.spotify) && (
              <div className="bg-ivory rounded-very p-6 border border-border-cream">
                <h3 className="text-xs text-stone-gray uppercase tracking-wider mb-4">外部链接</h3>
                <div className="space-y-2">
                  {song.externalLinks.youtube && (
                    <a
                      href={song.externalLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-parchment rounded-very text-sm text-near-black hover:bg-warm-sand transition-colors border border-border-cream"
                    >
                      <Youtube className="w-4 h-4 text-terracotta" />
                      YouTube
                      <ExternalLink className="w-3 h-3 ml-auto text-stone-gray" />
                    </a>
                  )}
                  {song.externalLinks.niconico && (
                    <a
                      href={song.externalLinks.niconico}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-parchment rounded-very text-sm text-near-black hover:bg-warm-sand transition-colors border border-border-cream"
                    >
                      <ExternalLink className="w-4 h-4 text-terracotta" />
                      NicoNico
                      <ExternalLink className="w-3 h-3 ml-auto text-stone-gray" />
                    </a>
                  )}
                  {song.externalLinks.spotify && (
                    <a
                      href={song.externalLinks.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-parchment rounded-very text-sm text-near-black hover:bg-warm-sand transition-colors border border-border-cream"
                    >
                      <ExternalLink className="w-4 h-4 text-terracotta" />
                      Spotify
                      <ExternalLink className="w-3 h-3 ml-auto text-stone-gray" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
