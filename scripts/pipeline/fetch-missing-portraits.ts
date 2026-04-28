/**
 * 为剩余的未匹配艺人抓取 portraitUrl
 * 策略：直接用 nameJa 在 gamedbs 各系列中搜索匹配
 */

const fs = require('fs')
const artists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))
const unmatched = artists.filter((a: any) => a.role === 'IDOL' && !a.portraitUrl)

// 加载已有的 gamedbs 数据（从之前抓取的备份或重新抓取）
// 这里我们直接从 gamedbs 搜索

async function searchCGByName(name: string): Promise<string> {
  // CG 列表页搜索：遍历所有角色，找 nameJa 匹配的
  const html = await fetch('https://imas.gamedbs.jp/cg/idol', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  }).then(r => r.text())

  const sections = html.match(/<a[^>]*href="\/cg\/idol\/detail\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  for (const sec of sections) {
    const text = sec.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = text.split(/\s+/).filter((p: string) => p && !p.match(/^(身長|体重|3サイズ|誕生日|年齢|血液型|出身地)/))
    if (parts[0] === name) {
      const idMatch = sec.match(/detail\/(\d+)/)
      if (idMatch) {
        const detailHtml = await fetch(`https://imas.gamedbs.jp/cg/idol/detail/${idMatch[1]}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }).then(r => r.text())
        const xsMatch = detailHtml.match(/src="(\/cg\/image_sp\/card\/xs\/[^"]+)"/)
        return xsMatch ? `https://imas.gamedbs.jp${xsMatch[1]}` : ''
      }
    }
  }
  return ''
}

async function searchMLTDByName(name: string): Promise<string> {
  for (let id = 1; id <= 60; id++) {
    try {
      const html = await fetch(`https://imas.gamedbs.jp/mlth/chara/show/${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }).then(r => r.text())
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      const nameJa = titleMatch[1].trim()
      if (nameJa === name || nameJa.replace(/\s+/g, '') === name) {
        const imgMatch = html.match(/src="(https:\/\/imas\.gamedbs\.jp\/mlth\/image\/chara\/img\/[^"]+)"/)
        return imgMatch ? imgMatch[1] : ''
      }
    } catch { /* skip */ }
  }
  return ''
}

async function searchSCByName(name: string): Promise<string> {
  for (let id = 1; id <= 35; id++) {
    try {
      const html = await fetch(`https://imassc.gamedbs.jp/chara/show/${id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }).then(r => r.text())
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      let nameJa = titleMatch[1].trim().replace(/^【[^】]+】\s*/, '').replace(/\s+情報.*$/, '').trim()
      if (nameJa === name || nameJa.replace(/\s+/g, '') === name) {
        const imgMatch = html.match(/data-src="(https:\/\/imassc\.gamedbs\.jp\/image\/card\/icon\/[^"]+)"/)
        return imgMatch ? imgMatch[1] : ''
      }
    } catch { /* skip */ }
  }
  return ''
}

async function main() {
  let matched = 0

  for (const artist of unmatched) {
    const series = artist.series?.[0]
    let imageUrl = ''

    if (series === 'cinderella' || series === '765') {
      imageUrl = await searchCGByName(artist.nameJa)
    } else if (series === 'million') {
      imageUrl = await searchMLTDByName(artist.nameJa)
    } else if (series === 'shinycolors') {
      imageUrl = await searchSCByName(artist.nameJa)
    }

    if (imageUrl) {
      artist.portraitUrl = imageUrl
      matched++
      console.log(`✓ ${artist.id} -> ${artist.nameJa}`)
    } else {
      console.log(`✗ ${artist.id} -> ${artist.nameJa} (${series})`)
    }
  }

  console.log(`\nMatched: ${matched}/${unmatched.length}`)
  fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
}

main().catch(console.error)
