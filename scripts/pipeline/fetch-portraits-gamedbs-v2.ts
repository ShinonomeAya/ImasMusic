/**
 * v2: 从 imas.gamedbs.jp 抓取角色头像和日文名
 * 修复了 romajiToKana 的 Hepburn 变体问题
 * 增加了 ID 拆分匹配策略
 */

const fs = require('fs')

// 加载完整 artists（包含 CREATOR）
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

// ── 罗马音到假名（含 Hepburn 变体）──
function romajiToKana(romaji: string): string {
  const map: Record<string, string> = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
    ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    wa: 'わ', wo: 'を', n: 'ん',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    za: 'ざ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    da: 'だ', de: 'で', do: 'ど',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ',
    cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ',
    nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
    hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
    mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
    rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
    gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
    ja: 'じゃ', ju: 'じゅ', jo: 'じょ',
    bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
    pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
    // Hepburn 变体
    si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ',
    sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
    zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
    tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
    dyu: 'でゅ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
    wi: 'うぃ', we: 'うぇ',
  }

  let result = ''
  let i = 0
  const s = romaji.toLowerCase()
  while (i < s.length) {
    // 尝试3字符
    if (i + 2 < s.length) {
      const triple = s.slice(i, i + 3)
      if (map[triple]) { result += map[triple]; i += 3; continue }
    }
    // 尝试2字符
    if (i + 1 < s.length) {
      const double = s.slice(i, i + 2)
      if (map[double]) { result += map[double]; i += 2; continue }
    }
    // 促音：双写辅音（但不包括元音）
    if (i + 2 < s.length && s[i] === s[i+1] && !'aeiou'.includes(s[i])) {
      const next = s.slice(i+1, i+3)
      if (map[next]) { result += 'っ' + map[next]; i += 3; continue }
      const nextSingle = s[i+1]
      if (map[nextSingle]) { result += 'っ' + map[nextSingle]; i += 2; continue }
    }
    // 长音
    if (i + 1 < s.length && s[i+1] === 'u' && 'ou'.includes(s[i])) {
      if (map[s[i]]) { result += map[s[i]] + 'う'; i += 2; continue }
    }
    if (i + 1 < s.length && s[i+1] === 'i' && s[i] === 'e') {
      if (map[s[i]]) { result += map[s[i]] + 'い'; i += 2; continue }
    }
    if (i + 1 < s.length && s[i+1] === 'a' && s[i] === 'o') {
      if (map[s[i]]) { result += map[s[i]] + 'う'; i += 2; continue }
    }
    // 拨音 n 后跟辅音（除了元音和 y）
    if (s[i] === 'n' && i + 1 < s.length && !'aeiouy'.includes(s[i+1])) {
      result += 'ん'; i++; continue
    }
    // 单字符
    const single = s[i]
    if (map[single]) { result += map[single]; i++; continue }
    // 未知字符，跳过
    i++
  }
  return result
}

// ── CG 系列 ──
async function fetchCG() {
  console.log('Fetching CG list...')
  const html = await fetchWithRetry('https://imas.gamedbs.jp/cg/idol')
  const sections = html.match(/<a[^>]*href="\/cg\/idol\/detail\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  console.log(`Found ${sections.length} CG entries`)

  for (const sec of sections) {
    const idMatch = sec.match(/detail\/(\d+)/)
    if (!idMatch) continue
    const id = idMatch[1]
    const text = sec.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = text.split(/\s+/).filter((p: string) => p && !p.match(/^(身長|体重|3サイズ|誕生日|年齢|血液型|出身地)/))
    const nameJa = parts[0]
    const nameKana = parts[1]

    const detailHtml = await fetchWithRetry(`https://imas.gamedbs.jp/cg/idol/detail/${id}`)
    const xsMatch = detailHtml.match(/src="(\/cg\/image_sp\/card\/xs\/[^"]+)"/)
    const imageUrl = xsMatch ? `https://imas.gamedbs.jp${xsMatch[1]}` : ''

    gamedbsData.push({ id, nameJa, nameKana, imageUrl, series: 'cinderella' })
  }
  console.log(`CG done: ${gamedbsData.filter(d => d.series === 'cinderella').length}`)
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
      const nameJa = titleMatch[1].trim().replace(/\s+/g, '')
      if (!nameJa || nameJa.includes('404')) continue

      const imgMatch = html.match(/src="(https:\/\/imas\.gamedbs\.jp\/mlth\/image\/chara\/img\/[^"]+)"/)
      const imageUrl = imgMatch ? imgMatch[1] : ''

      gamedbsData.push({ id: String(id), nameJa, imageUrl, series: 'million' })
      count++
    } catch { /* ID 不存在 */ }
  }
  console.log(`MLTD done: ${count}`)
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
      let nameJa = titleMatch[1].trim()
      nameJa = nameJa.replace(/^【[^】]+】\s*/, '').replace(/\s+情報.*$/, '').trim()
      if (!nameJa || nameJa.includes('404')) continue

      const imgMatch = html.match(/data-src="(https:\/\/imassc\.gamedbs\.jp\/image\/card\/icon\/[^"]+)"/)
      const imageUrl = imgMatch ? imgMatch[1] : ''

      gamedbsData.push({ id: String(id), nameJa, imageUrl, series: 'shinycolors' })
      count++
    } catch { /* ID 不存在 */ }
  }
  console.log(`SC done: ${count}`)
}

// ── 匹配 ──
function matchArtists() {
  console.log('\nMatching artists...')
  let matched = 0
  let unmatched: string[] = []

  for (const artist of artists) {
    const series = artist.series?.[0]
    const seriesData = gamedbsData.filter(d => d.series === series)

    // 策略A: nameJa 已经是汉字，直接名字匹配
    if (/[\u4e00-\u9fff]/.test(artist.nameJa)) {
      const entry = seriesData.find(d =>
        d.nameJa === artist.nameJa ||
        d.nameJa.replace(/\s+/g, '') === artist.nameJa ||
        artist.nameJa.includes(d.nameJa) ||
        d.nameJa.includes(artist.nameJa)
      )
      if (entry) {
        artist.portraitUrl = entry.imageUrl
        matched++
        continue
      }
    }

    // 策略B: nameEn 是汉字/假名，搜索包含
    if (artist.nameEn && /[\u4e00-\u9fff\u3040-\u309F\u30A0-\u30FF]/.test(artist.nameEn)) {
      const candidates = seriesData.filter(d => d.nameJa.includes(artist.nameEn))
      if (candidates.length === 1) {
        artist.nameJa = candidates[0].nameJa
        artist.portraitUrl = candidates[0].imageUrl
        matched++
        continue
      }
    }

    // 策略C: nameEn 是英文，转换为假名，搜索假名包含
    if (artist.nameEn && /^[A-Za-z\s]+$/.test(artist.nameEn) && seriesData.length > 0) {
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

    // 策略D: 用 ID 拆分（姓氏_名字）分别转换假名，要求同时匹配
    if (artist.id.includes('_') && seriesData.length > 0) {
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

// ── 保存 ──
function save() {
  // 合并回 allArtists（包含 CREATOR）
  const idolMap = new Map(artists.map((a: any) => [a.id, a]))
  for (let i = 0; i < allArtists.length; i++) {
    if (idolMap.has(allArtists[i].id)) {
      allArtists[i] = idolMap.get(allArtists[i].id)
    }
  }
  fs.writeFileSync('data/artists.json', JSON.stringify(allArtists, null, 2))
  console.log('\nSaved to data/artists.json')

  const withPortrait = allArtists.filter((a: any) => a.portraitUrl).length
  const withKanji = allArtists.filter((a: any) => /[\u4e00-\u9fff]/.test(a.nameJa)).length
  console.log(`Total with portraitUrl: ${withPortrait}`)
  console.log(`Total with kanji nameJa: ${withKanji}`)
}

async function main() {
  await fetchCG()
  await fetchMLTD()
  await fetchSC()
  console.log(`\nTotal gamedbs entries: ${gamedbsData.length}`)
  matchArtists()
  save()
}

main().catch(console.error)
