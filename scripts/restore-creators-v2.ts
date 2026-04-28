const fs = require('fs')

const artists = JSON.parse(fs.readFileSync('data/artists.json', 'utf-8'))
const tracks = JSON.parse(fs.readFileSync('data/tracks.json', 'utf-8'))
const patches = JSON.parse(fs.readFileSync('data/seed/output/mb_track_patches.json', 'utf-8'))

// 收集所有 patches 中的名字 -> ID 映射
const patchNames = new Map<string, string>()

function generateId(name: string): string {
  const cleaned = name.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
  let id = `creator-${Buffer.from(cleaned).toString('hex').slice(0, 8)}`
  return id
}

for (const p of Object.values(patches) as any[]) {
  for (const name of [...(p.lyricists || []), ...(p.composers || []), ...(p.arrangers || [])]) {
    const id = generateId(name)
    patchNames.set(id, name)
  }
}

// 从 tracks.json 中提取所有实际使用的 creator ID
const usedCreatorIds = new Set<string>()
for (const t of tracks) {
  if (t.credits) {
    for (const c of t.credits) {
      if (c.artistId && c.artistId.startsWith('creator-')) {
        usedCreatorIds.add(c.artistId)
      }
    }
  }
}

let added = 0
let decoded = 0
let unresolved = 0

for (const id of usedCreatorIds) {
  if (artists.some((a: any) => a.id === id)) continue

  let name = patchNames.get(id)

  // 尝试从 ID 的 hex 部分解码
  if (!name) {
    const hex = id.slice(8) // 去掉 "creator-"
    try {
      const buf = Buffer.from(hex, 'hex')
      const decodedName = buf.toString('utf-8')
      if (decodedName && decodedName.length > 0 && !/\ufffd/.test(decodedName)) {
        name = decodedName
        decoded++
      }
    } catch {}
  }

  if (!name) {
    console.log('⚠ Cannot resolve', id)
    unresolved++
    continue
  }

  artists.push({
    id,
    nameJa: name,
    nameEn: '',
    role: 'CREATOR',
    series: [],
  })
  added++
}

fs.writeFileSync('data/artists.json', JSON.stringify(artists, null, 2))
console.log(`Added: ${added} (decoded from hex: ${decoded}, unresolved: ${unresolved})`)
console.log(`Total artists: ${artists.length}`)
console.log(`Expected creators: ${usedCreatorIds.size}, actual: ${artists.filter((a: any) => a.role === 'CREATOR').length}`)
