#!/usr/bin/env tsx
/**
 * Sprint 8.1f — 歌词合并引擎
 *
 * 将 lyrics_patches.json 中抓取到的歌词注入到主数据库 data/tracks.json。
 * 保留已有的人工歌词（人工数据优先）。
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ---------------------------------------------------------------------------
// 路径常量
// ---------------------------------------------------------------------------

const DATA_DIR = path.resolve(process.cwd(), 'data')
const TRACKS_PATH = path.resolve(DATA_DIR, 'tracks.json')
const PATCHES_PATH = path.resolve(DATA_DIR, 'seed', 'output', 'lyrics_patches.json')

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

interface Track {
  id: string
  titleJa: string
  lyrics?: string
  [key: string]: unknown
}

interface LyricsPatch {
  lyrics?: string
  source?: string
  matched: boolean
}

type PatchMap = Record<string, LyricsPatch>

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function backupFile(src: string): void {
  const dest = `${src}.bak.${nowStamp()}`
  fs.copyFileSync(src, dest)
  console.log(`   📋 备份: ${path.basename(src)} → ${path.basename(dest)}`)
}

function loadJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function saveJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Sprint 8.1f — 歌词合并引擎启动')
  console.log('─'.repeat(50))

  // 1. 安全备份
  console.log('📦 正在备份 tracks.json...')
  backupFile(TRACKS_PATH)

  // 2. 加载数据
  console.log('📂 加载数据文件...')
  const tracks = loadJson<Track[]>(TRACKS_PATH)
  const patches = fs.existsSync(PATCHES_PATH)
    ? loadJson<PatchMap>(PATCHES_PATH)
    : {}

  console.log(`   Tracks: ${tracks.length}`)
  console.log(`   Lyrics patches: ${Object.keys(patches).length}`)
  console.log('')

  // 3. 合并数据
  let injected = 0
  let skippedExisting = 0
  let skippedUnmatched = 0

  for (const track of tracks) {
    const patch = patches[track.id]
    if (!patch || !patch.matched || !patch.lyrics) {
      skippedUnmatched++
      continue
    }

    // 幂等性：已有人工歌词则保留，不覆盖
    if (track.lyrics && track.lyrics.trim().length > 0) {
      skippedExisting++
      console.log(`   ⚠️  跳过（已有人工歌词）: ${track.titleJa}`)
      continue
    }

    track.lyrics = patch.lyrics
    injected++
  }

  // 4. 落盘保存
  console.log('\n💾 保存更新后的 tracks.json...')
  saveJson(TRACKS_PATH, tracks)

  // 5. 统计
  console.log('─'.repeat(50))
  console.log('🎉 歌词合并完成！')
  console.log(`   成功注入歌词: ${injected} 首`)
  console.log(`   已有人工歌词（跳过）: ${skippedExisting} 首`)
  console.log(`   无补丁/未匹配: ${skippedUnmatched} 首`)
  console.log(`   总计 tracks: ${tracks.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
