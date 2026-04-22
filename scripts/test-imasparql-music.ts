/**
 * imasparql 探针脚本 v6 — 不限制类型，直接查 Lyricist/Composer/Arranger 属性
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

function extractName(uri: string): string {
  return uri.split('#').pop() || uri.split('/').pop() || uri
}

async function main() {
  const IMAS = 'https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl'

  // ── 1. 谁有 Lyricist 属性？ ──
  console.log('=== 1. Entities with imas:Lyricist ===\n')
  const lyricist = await query(`
    SELECT DISTINCT ?type WHERE {
      ?s <${IMAS}#Lyricist> ?o .
      ?s a ?type .
    }
    LIMIT 20
  `)
  lyricist.results.bindings.forEach((b: any) => {
    console.log(extractName(b.type.value))
  })

  // ── 2. 谁有 Composer 属性？ ──
  console.log('\n=== 2. Entities with imas:Composer ===\n')
  const composer = await query(`
    SELECT DISTINCT ?type WHERE {
      ?s <${IMAS}#Composer> ?o .
      ?s a ?type .
    }
    LIMIT 20
  `)
  composer.results.bindings.forEach((b: any) => {
    console.log(extractName(b.type.value))
  })

  // ── 3. 谁有 Arranger 属性？ ──
  console.log('\n=== 3. Entities with imas:Arranger ===\n')
  const arranger = await query(`
    SELECT DISTINCT ?type WHERE {
      ?s <${IMAS}#Arranger> ?o .
      ?s a ?type .
    }
    LIMIT 20
  `)
  arranger.results.bindings.forEach((b: any) => {
    console.log(extractName(b.type.value))
  })

  // ── 4. 任意实体（不限类型）有创作者属性的前三条 ──
  console.log('\n=== 4. Any entity with Lyricist/Composer/Arranger ===\n')
  const any = await query(`
    SELECT ?s ?name ?lyricist ?composer ?arranger WHERE {
      ?s <${IMAS}#Lyricist> ?lyricist .
      OPTIONAL { ?s <http://schema.org/name> ?name }
      OPTIONAL { ?s <${IMAS}#Composer> ?composer }
      OPTIONAL { ?s <${IMAS}#Arranger> ?arranger }
    }
    LIMIT 10
  `)
  any.results.bindings.forEach((b: any, i: number) => {
    console.log(`${i + 1}. s: ${b.s?.value || 'N/A'}`)
    console.log(`   name: ${b.name?.value || 'N/A'}`)
    console.log(`   Lyricist: ${b.lyricist?.value || 'N/A'}`)
    console.log(`   Composer: ${b.composer?.value || 'N/A'}`)
    console.log(`   Arranger: ${b.arranger?.value || 'N/A'}`)
  })

  // ── 5. 用 schema:name 匹配 READY!! ──
  console.log('\n=== 5. READY!! via schema:name (any type) ===\n')
  const ready = await query(`
    SELECT ?s ?type ?name ?lyricist ?composer ?arranger WHERE {
      ?s <http://schema.org/name> ?name .
      FILTER(CONTAINS(STR(?name), "READY!!"))
      ?s a ?type .
      OPTIONAL { ?s <${IMAS}#Lyricist> ?lyricist }
      OPTIONAL { ?s <${IMAS}#Composer> ?composer }
      OPTIONAL { ?s <${IMAS}#Arranger> ?arranger }
    }
    LIMIT 10
  `)
  ready.results.bindings.forEach((b: any) => {
    console.log(`Type: ${extractName(b.type?.value || 'N/A')}`)
    console.log(`Name: ${b.name?.value || 'N/A'}`)
    console.log(`Lyricist: ${b.lyricist?.value || 'N/A'}`)
    console.log(`Composer: ${b.composer?.value || 'N/A'}`)
    console.log(`Arranger: ${b.arranger?.value || 'N/A'}`)
    console.log('---')
  })

  // ── 6. 所有 schema:name 包含 M@STER 的实体 ──
  console.log('\n=== 6. Any entity with "M@STER" in name ===\n')
  const master = await query(`
    SELECT ?s ?type ?name WHERE {
      ?s <http://schema.org/name> ?name .
      FILTER(CONTAINS(STR(?name), "M@STER"))
      ?s a ?type .
    }
    LIMIT 20
  `)
  master.results.bindings.forEach((b: any) => {
    console.log(`${extractName(b.type.value)} | ${b.name.value}`)
  })
}

main().catch(console.error)
