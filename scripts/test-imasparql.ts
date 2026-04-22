/**
 * imasparql 探针脚本 v4 — 数据量评估
 */

const ENDPOINT = 'https://sparql.crssnky.xyz/spql/imas/query'

async function query(sparql: string) {
  const url = `${ENDPOINT}?query=${encodeURIComponent(sparql)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json' },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

async function main() {
  // ── 1. 列出所有 MusicComposition 名称 ──
  console.log('=== All MusicComposition Names ===\n')
  const comps = await query(`
    SELECT ?name ?composer ?lyricist WHERE {
      ?s a <http://schema.org/MusicComposition> .
      ?s <http://schema.org/name> ?name .
      OPTIONAL { ?s <http://schema.org/composer> ?composer }
      OPTIONAL { ?s <http://schema.org/lyricist> ?lyricist }
    }
  `)
  comps.results.bindings.forEach((b: any, i: number) => {
    console.log(`${i + 1}. ${b.name?.value || 'N/A'}`)
    if (b.composer?.value) console.log(`   Composer: ${b.composer.value}`)
    if (b.lyricist?.value) console.log(`   Lyricist: ${b.lyricist.value}`)
  })

  // ── 2. 列出所有 MusicRecording ──
  console.log('\n=== All MusicRecording Names ===\n')
  const recs = await query(`
    SELECT ?name ?artist ?duration WHERE {
      ?s a <http://schema.org/MusicRecording> .
      ?s <http://schema.org/name> ?name .
      OPTIONAL { ?s <http://schema.org/byArtist> ?artist }
      OPTIONAL { ?s <http://schema.org/duration> ?duration }
    }
  `)
  recs.results.bindings.forEach((b: any, i: number) => {
    console.log(`${i + 1}. ${b.name?.value || 'N/A'}`)
    if (b.artist?.value) console.log(`   Artist: ${b.artist.value}`)
    if (b.duration?.value) console.log(`   Duration: ${b.duration.value}`)
  })

  // ── 3. Idol 总数 ──
  console.log('\n=== Idol Count ===\n')
  const idolCount = await query(`
    SELECT (COUNT(?s) AS ?count) WHERE {
      ?s a <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Idol> .
    }
  `)
  console.log('Total Idols:', idolCount.results.bindings[0]?.count?.value || '0')

  // ── 4. 所有 Idol 的 name 和 brand ──
  console.log('\n=== Idol Name + Brand Sample (first 30) ===\n')
  const idols = await query(`
    SELECT ?name ?brand WHERE {
      ?s a <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Idol> .
      ?s <http://schema.org/name> ?name .
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Brand> ?brand }
    }
    LIMIT 30
  `)
  idols.results.bindings.forEach((b: any) => {
    console.log(`${b.name?.value || 'N/A'} | ${b.brand?.value || 'N/A'}`)
  })

  // ── 5. 有哪些 Brand？ ──
  console.log('\n=== All Brands ===\n')
  const brands = await query(`
    SELECT DISTINCT ?brand WHERE {
      ?s a <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Idol> .
      ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Brand> ?brand .
    }
  `)
  brands.results.bindings.forEach((b: any) => {
    console.log(b.brand?.value || 'N/A')
  })
}

main().catch(console.error)
