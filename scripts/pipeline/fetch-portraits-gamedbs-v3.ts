/**
 * v3: 修复 MLTD 假名抓取 + 765 跨系列匹配
 */

const fs = require('fs')
const allArtists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))
const artists = allArtists.filter((a: any) => a.role === 'IDOL')

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
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
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

function romajiToKana(romaji: string): string {
  const map: Record<string, string> = {
    a:'あ',i:'い',u:'う',e:'え',o:'お',
    ka:'か',ki:'き',ku:'く',ke:'け',ko:'こ',
    sa:'さ',shi:'し',su:'す',se:'せ',so:'そ',
    ta:'た',chi:'ち',tsu:'つ',te:'て',to:'と',
    na:'な',ni:'に',nu:'ぬ',ne:'ね',no:'の',
    ha:'は',hi:'ひ',fu:'ふ',he:'へ',ho:'ほ',
    ma:'ま',mi:'み',mu:'む',me:'め',mo:'も',
    ya:'や',yu:'ゆ',yo:'よ',
    ra:'ら',ri:'り',ru:'る',re:'れ',ro:'ろ',
    wa:'わ',wo:'を',n:'ん',
    ga:'が',gi:'ぎ',gu:'ぐ',ge:'げ',go:'ご',
    za:'ざ',ji:'じ',zu:'ず',ze:'ぜ',zo:'ぞ',
    da:'だ',de:'で',do:'ど',
    ba:'ば',bi:'び',bu:'ぶ',be:'べ',bo:'ぼ',
    pa:'ぱ',pi:'ぴ',pu:'ぷ',pe:'ぺ',po:'ぽ',
    kya:'きゃ',kyu:'きゅ',kyo:'きょ',
    sha:'しゃ',shu:'しゅ',sho:'しょ',
    cha:'ちゃ',chu:'ちゅ',cho:'ちょ',
    nya:'にゃ',nyu:'にゅ',nyo:'にょ',
    hya:'ひゃ',hyu:'ひゅ',hyo:'ひょ',
    mya:'みゃ',myu:'みゅ',myo:'みょ',
    rya:'りゃ',ryu:'りゅ',ryo:'りょ',
    gya:'ぎゃ',gyu:'ぎゅ',gyo:'ぎょ',
    ja:'じゃ',ju:'じゅ',jo:'じょ',
    bya:'びゃ',byu:'びゅ',byo:'びょ',
    pya:'ぴゃ',pyu:'ぴゅ',pyo:'ぴょ',
    si:'し',ti:'ち',tu:'つ',hu:'ふ',
    sya:'しゃ',syu:'しゅ',syo:'しょ',
    zya:'じゃ',zyu:'じゅ',zyo:'じょ',
    tya:'ちゃ',tyu:'ちゅ',tyo:'ちょ',
    dyu:'でゅ',
  }
  let result = ''
  let i = 0
  const s = romaji.toLowerCase()
  while (i < s.length) {
    if (i + 2 < s.length) { const t = s.slice(i, i + 3); if (map[t]) { result += map[t]; i += 3; continue } }
    if (i + 1 < s.length) { const d = s.slice(i, i + 2); if (map[d]) { result += map[d]; i += 2; continue } }
    if (i + 2 < s.length && s[i] === s[i+1] && !'aeiou'.includes(s[i])) {
      const n = s.slice(i+1, i + 3)
      if (map[n]) { result += 'っ' + map[n]; i += 3; continue }
      if (map[s[i+1]]) { result += 'っ' + map[s[i+1]]; i += 2; continue }
    }
    if (i + 1 < s.length && s[i+1] === 'u' && 'ou'.includes(s[i])) { if (map[s[i]]) { result += map[s[i]] + 'う'; i += 2; continue } }
    if (i + 1 < s.length && s[i+1] === 'i' && s[i] === 'e') { if (map[s[i]]) { result += map[s[i]] + 'い'; i += 2; continue } }
    if (s[i] === 'n' && i + 1 < s.length && !'aeiouy'.includes(s[i+1])) { result += 'ん'; i++; continue }
    if (map[s[i]]) { result += map[s[i]]; i++; continue }
    i++
  }
  return result
}

// ── CG ──
async function fetchCG() {
  const html = await fetchWithRetry('https://imas.gamedbs.jp/cg/idol')
  const sections = html.match(/<a[^>]*href="\/cg\/idol\/detail\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  for (const sec of sections) {
    const idMatch = sec.match(/detail\/(\d+)/)
    if (!idMatch) continue
    const text = sec.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = text.split(/\s+/).filter((p: string) => p && !p.match(/^(身長|体重|3サイズ|誕生日|年齢|血液型|出身地)/))
    const detailHtml = await fetchWithRetry(`https://imas.gamedbs.jp/cg/idol/detail/${idMatch[1]}`)
    const xsMatch = detailHtml.match(/src="(\/cg\/image_sp\/card\/xs\/[^"]+)"/)
    gamedbsData.push({
      id: idMatch[1], nameJa: parts[0], nameKana: parts[1],
      imageUrl: xsMatch ? `https://imas.gamedbs.jp${xsMatch[1]}` : '',
      series: 'cinderella',
    })
  }
  console.log(`CG: ${gamedbsData.filter(d => d.series === 'cinderella').length}`)
}

// ── MLTD ──
async function fetchMLTD() {
  let count = 0
  for (let id = 1; id <= 60; id++) {
    try {
      const html = await fetchWithRetry(`https://imas.gamedbs.jp/mlth/chara/show/${id}`)
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      const nameJa = titleMatch[1].trim()
      if (!nameJa || nameJa.includes('404')) continue

      // 提取假名
      const kanaMatch = html.match(/なまえ<\/li><li[^>]*>([^<]+)<\/li>/i) ||
                        html.match(/なまえ\s*<\/\w+>\s*([^<]+)/i)
      const nameKana = kanaMatch ? kanaMatch[1].trim() : undefined

      const imgMatch = html.match(/src="(https:\/\/imas\.gamedbs\.jp\/mlth\/image\/chara\/img\/[^"]+)"/)
      gamedbsData.push({
        id: String(id), nameJa, nameKana,
        imageUrl: imgMatch ? imgMatch[1] : '',
        series: 'million',
      })
      count++
    } catch { /* skip */ }
  }
  console.log(`MLTD: ${count}`)
}

// ── SC ──
async function fetchSC() {
  let count = 0
  for (let id = 1; id <= 35; id++) {
    try {
      const html = await fetchWithRetry(`https://imassc.gamedbs.jp/chara/show/${id}`)
      const titleMatch = html.match(/<title>([^<|]+)/)
      if (!titleMatch) continue
      let nameJa = titleMatch[1].trim().replace(/^【[^】]+】\s*/, '').replace(/\s+情報.*$/, '').trim()
      if (!nameJa || nameJa.includes('404')) continue

      const imgMatch = html.match(/data-src="(https:\/\/imassc\.gamedbs\.jp\/image\/card\/icon\/[^"]+)"/)
      gamedbsData.push({
        id: String(id), nameJa,
        imageUrl: imgMatch ? imgMatch[1] : '',
        series: 'shinycolors',
      })
      count++
    } catch { /* skip */ }
  }
  console.log(`SC: ${count}`)
}

// ── 匹配 ──
function matchArtists() {
  let matched = 0
  const unmatched: string[] = []

  for (const artist of artists) {
    const series = artist.series?.[0]
    // 对于 765，也搜索 CG 数据（因为 CG 列表包含部分 765 角色）
    let seriesData = gamedbsData.filter(d => d.series === series)
    if (series === '765') {
      seriesData = [...seriesData, ...gamedbsData.filter(d => d.series === 'cinderella')]
    }

    // 策略A: nameJa 已经是汉字
    if (/[\u4e00-\u9fff]/.test(artist.nameJa)) {
      const entry = seriesData.find(d =>
        d.nameJa === artist.nameJa ||
        d.nameJa.replace(/\s+/g, '') === artist.nameJa ||
        artist.nameJa.includes(d.nameJa.replace(/\s+/g, '')) ||
        d.nameJa.replace(/\s+/g, '').includes(artist.nameJa)
      )
      if (entry) {
        artist.portraitUrl = entry.imageUrl
        matched++
        continue
      }
    }

    // 策略B: nameEn 是汉字/假名
    if (artist.nameEn && /[\u4e00-\u9fff\u3040-\u309F\u30A0-\u30FF]/.test(artist.nameEn)) {
      const candidates = seriesData.filter(d => d.nameJa.includes(artist.nameEn))
      if (candidates.length === 1) {
        artist.nameJa = candidates[0].nameJa
        artist.portraitUrl = candidates[0].imageUrl
        matched++
        continue
      }
    }

    // 策略C: nameEn 是英文 → 假名
    if (artist.nameEn && /^[A-Za-z\s]+$/.test(artist.nameEn)) {
      const kana = romajiToKana(artist.nameEn)
      if (kana) {
        const candidates = seriesData.filter(d => d.nameKana && d.nameKana.includes(kana))
        if (candidates.length === 1) {
          artist.nameJa = candidates[0].nameJa
          artist.portraitUrl = candidates[0].imageUrl
          matched++
          continue
        }
      }
    }

    // 策略D: ID 拆分假名
    if (artist.id.includes('_')) {
      const parts = artist.id.split('_')
      const kanaParts = parts.map((p: string) => romajiToKana(p)).filter(Boolean)
      if (kanaParts.length >= 2) {
        const candidates = seriesData.filter(d =>
          d.nameKana && kanaParts.every((k: string) => d.nameKana!.includes(k))
        )
        if (candidates.length === 1) {
          artist.nameJa = candidates[0].nameJa
          artist.portraitUrl = candidates[0].imageUrl
          matched++
          continue
        }
      }
    }

    unmatched.push(`${artist.id} | ${artist.nameJa} | ${artist.nameEn} | ${series}`)
  }

  console.log(`Matched: ${matched}/${artists.length}`)
  console.log(`Unmatched: ${unmatched.length}`)
  if (unmatched.length > 0) {
    console.log('\nFirst 30 unmatched:')
    unmatched.slice(0, 30).forEach(u => console.log(u))
  }
  return unmatched.length
}

function save() {
  const idolMap = new Map(artists.map((a: any) => [a.id, a]))
  for (let i = 0; i < allArtists.length; i++) {
    if (idolMap.has(allArtists[i].id)) {
      allArtists[i] = idolMap.get(allArtists[i].id)
    }
  }
  fs.writeFileSync('data/artists.json', JSON.stringify(allArtists, null, 2))
  console.log('\nSaved.')
  console.log(`With portraitUrl: ${allArtists.filter((a: any) => a.portraitUrl).length}`)
  console.log(`With kanji nameJa: ${allArtists.filter((a: any) => /[\u4e00-\u9fff]/.test(a.nameJa)).length}`)
}

async function main() {
  await fetchCG()
  await fetchMLTD()
  await fetchSC()
  console.log(`\nTotal gamedbs: ${gamedbsData.length}`)
  matchArtists()
  save()
}

main().catch(console.error)
