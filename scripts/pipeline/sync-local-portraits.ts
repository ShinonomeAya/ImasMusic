/**
 * 扫描本地 public/images/idols/ 目录，将存在的图片自动绑定到 artists.json
 * 幂等设计：可反复运行，新增/修改图片后自动同步
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const DATA_PATH = path.resolve(process.cwd(), 'data', 'artists.json')
const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images', 'idols')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTS.has(ext)
}

function main() {
  // 1. 读取本地图片目录
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log(`Images directory not found: ${IMAGES_DIR}`)
    console.log('No action taken.')
    return
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(isImageFile)
  console.log(`Scanned ${files.length} local images in ${IMAGES_DIR}`)

  // 2. 建立映射表：id -> filename
  const idToFile = new Map<string, string>()
  for (const file of files) {
    const id = path.basename(file, path.extname(file))
    if (idToFile.has(id)) {
      console.warn(`⚠ Duplicate ID detected: "${id}" (${idToFile.get(id)} vs ${file}), using ${file}`)
    }
    idToFile.set(id, file)
  }

  // 3. 读取 artists.json
  const artists = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as any[]

  let linked = 0
  let alreadyCorrect = 0
  let changed = 0

  for (const artist of artists) {
    const file = idToFile.get(artist.id)
    if (!file) continue

    const expectedUrl = `/images/idols/${file}`

    if (artist.portraitUrl === expectedUrl) {
      alreadyCorrect++
      continue
    }

    const oldUrl = artist.portraitUrl
    artist.portraitUrl = expectedUrl
    linked++

    if (oldUrl && /^https?:\/\//.test(oldUrl)) {
      console.log(`  ${artist.id}: ${oldUrl.slice(0, 50)}... → ${expectedUrl}`)
      changed++
    } else if (oldUrl && oldUrl !== expectedUrl) {
      console.log(`  ${artist.id}: ${oldUrl} → ${expectedUrl}`)
      changed++
    }
  }

  // 4. 统计无头像的 IDOL
  const idolWithoutPortrait = artists.filter(
    (a) => a.role === 'IDOL' && (!a.portraitUrl || !a.portraitUrl.startsWith('/images/'))
  )

  // 5. 落盘
  fs.writeFileSync(DATA_PATH, JSON.stringify(artists, null, 2), 'utf-8')

  console.log('\n========== Sync Complete ==========')
  console.log(`Local images scanned:  ${files.length}`)
  console.log(`Linked / Fixed:        ${linked}`)
  console.log(`Already correct:       ${alreadyCorrect}`)
  console.log(`IDOL without portrait: ${idolWithoutPortrait.length} / ${artists.filter((a) => a.role === 'IDOL').length}`)

  if (idolWithoutPortrait.length > 0) {
    console.log('\nMissing portraits:')
    idolWithoutPortrait.forEach((a) => console.log(`  - ${a.id} (${a.nameJa})`))
  }
}

main()
