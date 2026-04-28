/**
 * 从 imas.gamedbs.jp 抓取角色头像和日文名
 * - CG:   https://imas.gamedbs.jp/cg/idol  (列表页)
 * - MLTD: https://imas.gamedbs.jp/mlth/chara/show/{id} (详情页)
 * - SC:   https://imassc.gamedbs.jp/chara/show/{id} (详情页)
 */

const artists = JSON.parse(require('fs').readFileSync('data/artists.json', 'utf-8'))

interface GamedbsEntry {
  id: string
  nameJa: string
  nameKana?: string
  imageUrl: string
  series: string
}

const gamedbsData: GamedbsEntry[] = []

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('unreachable')
}

// ── CG 系列 ──
async function fetchCG() {
  console.log('Fetching CG list...')
  const html = await fetchWithRetry('https://imas.gamedbs.jp/cg/idol')

  const sectionMatches = html.match(/<a[^>]*href="\/cg\/idol\/detail\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  console.log(`Found ${sectionMatches.length} CG entries`)

  for (const sec of sectionMatches) {
    const idMatch = sec.match(/detail\/(\d+)/)
    if (!idMatch) continue
    const id = idMatch[1]

    // 提取文本：名字 + 假名 + 其他信息
    const text = sec.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = text.split(/\s+/).filter(p => p && !p.match(/^(身長|体重|3サイズ|誕生日|年齢|血液型|出身地)/))
    const nameJa = parts[0]
    const nameKana = parts[1]

    // 获取详情页图片
    const detailHtml = await fetchWithRetry(`https://imas.gamedbs.jp/cg/idol/detail/${id}`)
    const xsMatch = detailHtml.match(/src="(\/cg\/image_sp\/card\/xs\/[^"]+)"/)
    const imageUrl = xsMatch ? `https://imas.gamedbs.jp${xsMatch[1]}` : ''

    gamedbsData.push({ id, nameJa, nameKana, imageUrl, series: 'cinderella' })
  }
  console.log(`CG done: ${gamedbsData.filter(d => d.series === 'cinderella').length} entries`)
}

// ── MLTD 系列 ──
async function fetchMLTD() {
  console.log('Fetching MLTD characters...')
  let count = 0
  for (let id = 1; id <= 60; id++) {
    try {
      const html = await fetchWithRetry(`https://imas.gamedbs.jp/mlth/chara/show/${id}`)
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      const nameJa = titleMatch[1].trim()
      if (!nameJa || nameJa.includes('404')) continue

      // 获取立绘图片
      const imgMatch = html.match(/src="(https:\/\/imas\.gamedbs\.jp\/mlth\/image\/chara\/img\/[^"]+)"/)
      const imageUrl = imgMatch ? imgMatch[1] : ''

      gamedbsData.push({ id: String(id), nameJa, imageUrl, series: 'million' })
      count++
    } catch {
      // ID 不存在，跳过
    }
  }
  console.log(`MLTD done: ${count} entries`)
}

// ── SC 系列 ──
async function fetchSC() {
  console.log('Fetching SC characters...')
  let count = 0
  for (let id = 1; id <= 30; id++) {
    try {
      const html = await fetchWithRetry(`https://imassc.gamedbs.jp/chara/show/${id}`)
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      // 标题格式: 【BLEND / MIX】櫻木 真乃 情報
      let nameJa = titleMatch[1].trim()
      nameJa = nameJa.replace(/^【[^】]+】\s*/, '').replace(/\s+情報.*$/, '').trim()
      if (!nameJa || nameJa.includes('404')) continue

      // 获取 icon 图片
      const imgMatch = html.match(/data-src="(https:\/\/imassc\.gamedbs\.jp\/image\/card\/icon\/[^"]+)"/)
      const imageUrl = imgMatch ? imgMatch[1] : ''

      gamedbsData.push({ id: String(id), nameJa, imageUrl, series: 'shinycolors' })
      count++
    } catch {
      // ID 不存在，跳过
    }
  }
  console.log(`SC done: ${count} entries`)
}

// ── 匹配并更新 ──
function updateArtists() {
  console.log('\nMatching artists...')
  let matched = 0
  let unmatched: string[] = []

  for (const artist of artists) {
    if (artist.role !== 'IDOL') continue

    // 策略1: nameJa 已经是汉字，直接匹配
    if (/[\u4e00-\u9fff]/.test(artist.nameJa)) {
      const entry = gamedbsData.find(d => d.nameJa === artist.nameJa || d.nameJa.replace(/\s+/g, '') === artist.nameJa)
      if (entry) {
        artist.portraitUrl = entry.imageUrl
        matched++
        continue
      }
    }

    // 策略2: nameEn 是名片段，在 gamedbs 中搜索包含该片段的
    if (artist.nameEn) {
      const candidates = gamedbsData.filter(d => d.series === artist.series?.[0] && d.nameJa.includes(artist.nameEn))
      if (candidates.length === 1) {
        artist.nameJa = candidates[0].nameJa
        artist.portraitUrl = candidates[0].imageUrl
        matched++
        continue
      }
    }

    // 策略3: id 中的名字部分匹配假名
    const idParts = artist.id.split('_')
    if (idParts.length >= 2) {
      const firstNameRomaji = idParts[idParts.length - 1].toLowerCase()
      const candidates = gamedbsData.filter(d =>
        d.series === artist.series?.[0] &&
        d.nameKana && d.nameKana.includes(firstNameRomaji)
      )
      if (candidates.length === 1) {
        artist.nameJa = candidates[0].nameJa
        artist.portraitUrl = candidates[0].imageUrl
        matched++
        continue
      }
    }

    unmatched.push(`${artist.id} | ${artist.nameJa} | ${artist.nameEn} | ${artist.series}`)
  }

  console.log(`Matched: ${matched}/${artists.filter(a => a.role === 'IDOL').length}`)
  console.log(`Unmatched: ${unmatched.length}`)
  if (unmatched.length > 0) {
    console.log('\nFirst 20 unmatched:')
    unmatched.slice(0, 20).forEach(u => console.log(u))
  }

  // 保存
  const fs = require('fs')
  fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
  console.log('\nSaved to data/artists.json')
}

async function main() {
  await fetchCG()
  await fetchMLTD()
  await fetchSC()
  console.log(`\nTotal gamedbs entries: ${gamedbsData.length}`)
  updateArtists()
}

main().catch(console.error)
