const fs = require('fs')
const artists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))

// 手动映射：id -> nameJa（修复长音/拼写差异导致的未匹配）
const manualMappings: Record<string, string> = {
  // CG - 假名长音问题（Syoko -> しょうこ，不是 しょこ）
  'Hoshi_Syoko': '星輝子',
  'Hattori_Toko': '服部瞳子',

  // CG - 已有正确 nameJa 但被跳过（因为 nameEn 是英文导致策略不匹配）
  'Miyamoto_Frederica': '宮本フレデリカ',
  'Hyodo_Rena': '兵藤レナ',

  // MLTD - 片假名/假名差异
  'Handa_Roco': 'ロコ',
  'Nikaido_Chizuru': '二階堂千鶴',

  // 765 - 已有正确汉字 nameJa
  'Togoji_Reika': '東豪寺麗華',
  'Okuzora_Kohaku': '奥空心白',
  'Asahina_Rin': '朝日奈りん',
  'Suzuki_Ayane': '鈴木彩音',
  'Sanjo_Tomomi': '三条ともみ',
}

let changed = 0
for (const [id, nameJa] of Object.entries(manualMappings)) {
  const artist = artists.find((a: any) => a.id === id)
  if (artist && artist.nameJa !== nameJa) {
    artist.nameJa = nameJa
    changed++
  }
}

fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
console.log('Manual fix applied to', changed, 'artists')

// 列出剩余未匹配（按系列）
const unmatched = artists.filter((a: any) => a.role === 'IDOL' && !a.portraitUrl)
console.log('\nRemaining unmatched:', unmatched.length)

const bySeries: Record<string, any[]> = {}
for (const a of unmatched) {
  const s = a.series?.[0] || 'unknown'
  bySeries[s] = bySeries[s] || []
  bySeries[s].push(a)
}

for (const [s, list] of Object.entries(bySeries)) {
  console.log(`\n=== ${s} (${list.length}) ===`)
  list.forEach((a: any) => console.log(a.id, '|', a.nameJa))
}
