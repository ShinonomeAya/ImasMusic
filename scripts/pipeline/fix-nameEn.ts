/**
 * 修复 nameEn 字段：
 * 对于 id 格式为 姓氏_名字 的艺人，
 * 如果 nameEn 是名片段/日文，替换为完整的英文全名（名 姓）
 */

const fs = require('fs')
const artists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))

let changed = 0

for (const artist of artists) {
  if (artist.role !== 'IDOL') continue
  if (!artist.id.includes('_')) continue

  const parts = artist.id.split('_')
  if (parts.length < 2) continue

  // 生成完整的英文全名（西方顺序：名 姓）
  const firstName = parts[parts.length - 1]
  const lastName = parts.slice(0, -1).join('_')
  const fullNameEn = `${firstName} ${lastName}`

  // 如果当前 nameEn 不是完整的英文名，或者是名片段/日文
  const currentEn = artist.nameEn || ''
  const isCurrentFullName = currentEn === fullNameEn || currentEn === `${lastName} ${firstName}`

  if (!isCurrentFullName || !/^[A-Za-z\s]+$/.test(currentEn)) {
    artist.nameEn = fullNameEn
    changed++
  }
}

fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
console.log(`Updated nameEn for ${changed} artists`)

// 验证
const samples = artists.filter((a: any) => a.role === 'IDOL' && a.id.includes('_')).slice(0, 10)
console.log('\nSamples:')
samples.forEach((a: any) => console.log(a.id, '|', a.nameJa, '|', a.nameEn))
