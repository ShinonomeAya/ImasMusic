/**
 * 下载所有 IDOL 外链头像到本地 public/images/idols/
 * 并更新 artists.json 的 portraitUrl 为相对路径
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const DATA_PATH = path.resolve(process.cwd(), 'data', 'artists.json')
const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'images', 'idols')

const SLEEP_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function extFromContentType(ct: string | null): string {
  if (!ct) return 'jpg'
  if (ct.includes('image/png')) return 'png'
  if (ct.includes('image/webp')) return 'webp'
  if (ct.includes('image/gif')) return 'gif'
  return 'jpg'
}

async function main() {
  // 1. 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`Created directory: ${OUTPUT_DIR}`)
  }

  // 2. 读取 artists.json
  const artists = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) as any[]
  const targets = artists.filter(
    (a) => a.role === 'IDOL' && a.portraitUrl && /^https?:\/\//.test(a.portraitUrl)
  )

  console.log(`Found ${targets.length} IDOL portraits to download`)

  let success = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < targets.length; i++) {
    const artist = targets[i]
    const url = artist.portraitUrl as string

    // 检查是否已存在本地文件（断点续传）
    const existingFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.startsWith(artist.id + '.'))
    if (existingFiles.length > 0) {
      const localPath = `/images/idols/${existingFiles[0]}`
      artist.portraitUrl = localPath
      skipped++
      console.log(`[${i + 1}/${targets.length}] SKIP (exists) ${artist.id} → ${localPath}`)
      await sleep(SLEEP_MS)
      continue
    }

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const buffer = Buffer.from(await res.arrayBuffer())
      const ext = extFromContentType(res.headers.get('content-type'))
      const filename = `${artist.id}.${ext}`
      const filePath = path.join(OUTPUT_DIR, filename)
      const localPath = `/images/idols/${filename}`

      fs.writeFileSync(filePath, buffer)
      artist.portraitUrl = localPath
      success++

      console.log(
        `[${i + 1}/${targets.length}] OK ${artist.id} (${(buffer.length / 1024).toFixed(1)} KB) → ${localPath}`
      )
    } catch (err: any) {
      failed++
      console.warn(`[${i + 1}/${targets.length}] FAIL ${artist.id} (${url}): ${err.message}`)
    }

    await sleep(SLEEP_MS)
  }

  // 3. 保存 artists.json
  fs.writeFileSync(DATA_PATH, JSON.stringify(artists, null, 2), 'utf-8')

  console.log('\n========== Done ==========')
  console.log(`Total:   ${targets.length}`)
  console.log(`Success: ${success}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed:  ${failed}`)
}

main().catch(console.error)
