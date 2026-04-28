/**
 * 第二轮名字修复：
 * 1. 对于 nameEn 是日文汉字/假名的未匹配艺人，用 nameEn 搜索 gamedbs nameJa
 * 2. 对于 nameJa 已经是汉字但没匹配的 cinderella 艺人，修正名字格式匹配
 * 3. 尝试用简化的罗马音到假名映射匹配 romaji nameEn 艺人
 */

const fs = require('fs')
const artists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))

// 加载之前抓取的 gamedbs 数据（需要重新抓取或从某处加载）
// 这里我们直接从 gamedbs 重新抓取列表页

interface GamedbsEntry {
  nameJa: string
  nameKana?: string
  imageUrl: string
  series: string
}

const gamedbsData: GamedbsEntry[] = []

// 简化的罗马音到假名映射（只覆盖最常见的情况）
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
  }

  let result = ''
  let i = 0
  const s = romaji.toLowerCase()
  while (i < s.length) {
    // 尝试匹配3字符
    if (i + 2 < s.length) {
      const triple = s.slice(i, i + 3)
      if (map[triple]) { result += map[triple]; i += 3; continue }
    }
    // 尝试匹配2字符
    if (i + 1 < s.length) {
      const double = s.slice(i, i + 2)
      if (map[double]) { result += map[double]; i += 2; continue }
    }
    // 处理促音（小っ）：双写辅音
    if (i + 2 < s.length && s[i] === s[i+1] && !'aeiou'.includes(s[i])) {
      const next = s.slice(i+1, i+3)
      if (map[next]) { result += 'っ' + map[next]; i += 3; continue }
      const nextSingle = s[i+1]
      if (map[nextSingle]) { result += 'っ' + map[nextSingle]; i += 2; continue }
    }
    // 处理长音：o结尾后跟u
    if (i + 1 < s.length && s[i+1] === 'u' && 'ou'.includes(s[i])) {
      if (map[s[i]]) { result += map[s[i]] + 'う'; i += 2; continue }
    }
    // 单字符
    const single = s[i]
    if (map[single]) { result += map[single]; i++; continue }
    // 未知字符，跳过
    i++
  }
  return result
}

async function fetchCGList(): Promise<GamedbsEntry[]> {
  const html = await fetch('https://imas.gamedbs.jp/cg/idol', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  }).then(r => r.text())

  const sections = html.match(/<a[^>]*href="\/cg\/idol\/detail\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  const entries: GamedbsEntry[] = []

  for (const sec of sections) {
    const idMatch = sec.match(/detail\/(\d+)/)
    if (!idMatch) continue
    const text = sec.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    const parts = text.split(/\s+/).filter((p: string) => p && !p.match(/^(身長|体重|3サイズ|誕生日|年齢|血液型|出身地)/))
    const nameJa = parts[0]
    const nameKana = parts[1]
    // 图片不重新抓取，只存名字和假名
    entries.push({ nameJa, nameKana, imageUrl: '', series: 'cinderella' })
  }
  return entries
}

async function main() {
  console.log('Fetching CG list for name matching...')
  const cgEntries = await fetchCGList()
  console.log(`Got ${cgEntries.length} CG entries`)

  let matched = 0

  for (const artist of artists) {
    if (artist.role !== 'IDOL') continue
    if (artist.portraitUrl) continue // 已匹配，跳过

    const series = artist.series?.[0]

    // 策略1: nameEn 是汉字/假名，搜索 gamedbs nameJa 包含该片段
    if (artist.nameEn && /[\u4e00-\u9fff\u3040-\u309F\u30A0-\u30FF]/.test(artist.nameEn)) {
      const candidates = cgEntries.filter(d => d.nameJa.includes(artist.nameEn))
      if (candidates.length === 1) {
        artist.nameJa = candidates[0].nameJa
        matched++
        continue
      }
      // MLTD / SC 需要单独处理
    }

    // 策略2: nameJa 已经是汉字，但没匹配到 portrait（可能是名字格式不同）
    if (/[\u4e00-\u9fff]/.test(artist.nameJa) && series === 'cinderella') {
      const entry = cgEntries.find(d =>
        d.nameJa === artist.nameJa ||
        d.nameJa.replace(/\s+/g, '') === artist.nameJa ||
        artist.nameJa.includes(d.nameJa) ||
        d.nameJa.includes(artist.nameJa)
      )
      if (entry) {
        artist.nameJa = entry.nameJa
        matched++
        continue
      }
    }

    // 策略3: romaji nameEn，尝试转换为假名匹配
    if (artist.nameEn && /^[A-Za-z\s]+$/.test(artist.nameEn) && series === 'cinderella') {
      const kana = romajiToKana(artist.nameEn)
      if (kana) {
        const candidates = cgEntries.filter(d => d.nameKana && d.nameKana.includes(kana))
        if (candidates.length === 1) {
          artist.nameJa = candidates[0].nameJa
          matched++
          continue
        }
      }
    }
  }

  console.log(`Additional matched: ${matched}`)

  // 统计
  const withPortrait = artists.filter((a: any) => a.portraitUrl).length
  const withKanji = artists.filter((a: any) => /[\u4e00-\u9fff]/.test(a.nameJa)).length
  console.log(`Total with portraitUrl: ${withPortrait}`)
  console.log(`Total with kanji nameJa: ${withKanji}`)

  // 保存
  fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
  console.log('Saved.')
}

main().catch(console.error)
