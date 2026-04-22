#!/usr/bin/env node
/**
 * imasparql 偶像数据导入脚本
 * 从 https://sparql.crssnky.xyz/spql/imas/query 抓取全部偶像数据
 * 输出到 data/artists.json
 *
 * 用法:
 *   npx tsx scripts/seed-idols.ts
 */

import { writeFile } from 'fs/promises'
import { join } from 'path'

const ENDPOINT = 'https://sparql.crssnky.xyz/spql/imas/query'

interface SparqlBinding {
  [key: string]: { type: string; value: string }
}

interface SparqlResult {
  results: { bindings: SparqlBinding[] }
}

async function query(sparql: string): Promise<SparqlResult> {
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

function extractValue(b: SparqlBinding, key: string): string | undefined {
  return b[key]?.value
}

// Brand → SeriesId 映射
const BRAND_MAP: Record<string, string> = {
  '765AS': '765',
  CinderellaGirls: 'cinderella',
  MillionLive: 'million',
  SideM: 'sidem',
  ShinyColors: 'shinycolors',
  Gakuen: 'gakuen',
  DearlyStars: '765',
  'va-liv': 'shinycolors',
  Other: '765',
}

function mapBrandToSeries(brand: string): string {
  return BRAND_MAP[brand] || '765'
}

// 从名字推断角色类型
function inferRole(name: string, brand: string): string {
  if (brand === 'SideM') return 'IDOL'
  // 大部分偶像都是 IDOL，后续可人工补充 CV/CREATOR
  return 'IDOL'
}

async function main() {
  console.log('🎤 Fetching idol data from imasparql...\n')

  // 查询所有 Idol 的核心属性
  const sparql = `
    SELECT ?s ?name ?nameEn ?brand ?birthDate ?height ?bloodType ?color ?hobby ?cv ?memberOf WHERE {
      ?s a <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Idol> .
      ?s <http://schema.org/name> ?name .
      OPTIONAL { ?s <http://schema.org/givenName> ?nameEn }
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Brand> ?brand }
      OPTIONAL { ?s <http://schema.org/birthDate> ?birthDate }
      OPTIONAL { ?s <http://schema.org/height> ?height }
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#BloodType> ?bloodType }
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Color> ?color }
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#Hobby> ?hobby }
      OPTIONAL { ?s <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#cv> ?cv }
      OPTIONAL { ?s <http://schema.org/memberOf> ?memberOf }
    }
  `

  const result = await query(sparql)
  console.log(`Total records from SPARQL: ${result.results.bindings.length}`)

  // 按 ?s 去重合并（同一个偶像可能有多行结果）
  const idolMap = new Map<string, any>()

  for (const b of result.results.bindings) {
    const uri = extractValue(b, 's')!
    const name = extractValue(b, 'name')!
    const nameEn = extractValue(b, 'nameEn')
    const brand = extractValue(b, 'brand')
    const birthDate = extractValue(b, 'birthDate')
    const height = extractValue(b, 'height')
    const bloodType = extractValue(b, 'bloodType')
    const color = extractValue(b, 'color')
    const hobby = extractValue(b, 'hobby')
    const cv = extractValue(b, 'cv')
    const memberOf = extractValue(b, 'memberOf')

    if (!idolMap.has(uri)) {
      idolMap.set(uri, {
        id: uri.split('/').pop() || uri,
        nameJa: name,
        nameEn: nameEn || undefined,
        role: 'IDOL',
        series: brand ? [mapBrandToSeries(brand)] : undefined,
        brand,
        birthDate: birthDate || undefined,
        height: height ? parseInt(height) : undefined,
        bloodType: bloodType || undefined,
        color: color || undefined,
        hobby: hobby || undefined,
        cv: cv || undefined,
        units: [] as string[],
      })
    }

    const idol = idolMap.get(uri)

    // 合并 nameEn（优先保留非空的）
    if (nameEn && !idol.nameEn) idol.nameEn = nameEn

    // 合并 brand/series
    if (brand) {
      const seriesId = mapBrandToSeries(brand)
      if (!idol.series) idol.series = []
      if (!idol.series.includes(seriesId)) idol.series.push(seriesId)
      idol.brand = brand
    }

    // 合并 unit
    if (memberOf) {
      const unitName = memberOf.split('/').pop() || memberOf
      if (!idol.units.includes(unitName)) idol.units.push(unitName)
    }
  }

  // 推断 role
  for (const idol of idolMap.values()) {
    idol.role = inferRole(idol.nameJa, idol.brand)
  }

  const artists = Array.from(idolMap.values())

  // 清理临时字段
  for (const a of artists) {
    delete a.brand
    if (a.units.length === 0) delete a.units
  }

  console.log(`\n✅ Deduplicated idols: ${artists.length}`)

  // 统计
  const seriesCounts: Record<string, number> = {}
  for (const a of artists) {
    for (const s of a.series || []) {
      seriesCounts[s] = (seriesCounts[s] || 0) + 1
    }
  }
  console.log('\nSeries distribution:')
  for (const [series, count] of Object.entries(seriesCounts)) {
    console.log(`  ${series}: ${count}`)
  }

  // 输出前 5 条预览
  console.log('\nPreview (first 5):')
  for (const a of artists.slice(0, 5)) {
    console.log(`  ${a.nameJa} | ${a.nameEn || 'N/A'} | series: ${a.series?.join(', ')} | role: ${a.role}`)
  }

  // 写入文件
  const outputPath = join(process.cwd(), 'data', 'artists.json')
  await writeFile(outputPath, JSON.stringify(artists, null, 2), 'utf-8')
  console.log(`\n💾 Written to ${outputPath}`)
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
