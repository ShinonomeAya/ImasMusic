/**
 * 解析 project-imas.wiki 页面 Ctrl+A 全选文本
 *
 * 用户操作流程：
 *   1. 打开 project-imas.wiki 上某首歌的页面
 *   2. Ctrl+A 全选 → Ctrl+C 复制
 *   3. 粘贴到 data/seed/wiki-dumps/{曲名}.txt
 *   4. npx tsx scripts/merge-wiki-supplement.ts 自动解析并合并
 */

export interface ParsedWikiData {
  /** 原始日文标题 */
  titleJa?: string
  /** 罗马音标题 */
  titleRomaji?: string
  /** 英文翻译标题 */
  titleEn?: string
  /** 作曲家 */
  composer?: string
  /** 作词家 */
  lyricist?: string
  /** 编曲家 */
  arranger?: string
  /** BPM */
  bpm?: number
  /** 歌曲简介（first appeared in... 段落） */
  description?: string
  /** Image stat (Visual/Dance/Vocal) */
  imageStat?: string
  /** 关联偶像 */
  personalSongOf?: string[]
}

/**
 * 从 Wiki 全选文本中解析歌曲数据
 */
export function parseWikiDump(text: string): ParsedWikiData {
  const lines = text.split('\n')

  // ── 1. 定位 General song data 区块 ──
  const generalStartIdx = lines.findIndex(l => l.trim() === 'General song data')
  const contentsIdx = lines.findIndex(l => l.trim() === 'Contents')

  const generalLines =
    generalStartIdx >= 0
      ? lines.slice(
          generalStartIdx + 1,
          contentsIdx > generalStartIdx ? contentsIdx : generalStartIdx + 30
        )
      : []

  // ── 2. 解析 key:value 对 ──
  const raw: Record<string, string> = {}
  for (const line of generalLines) {
    const trimmed = line.trim()
    // 匹配 "Key: Value" 或 "Key:\tValue"
    const m = trimmed.match(/^([A-Za-z0-9\s@&\-]+?):\s*(.+)$/)
    if (m) {
      raw[m[1].trim()] = m[2].trim()
    }
  }

  // ── 3. 提取描述段落 ──
  let description: string | undefined

  // 策略 A：找 "first appeared in" 句子所在的段落
  const firstAppearedIdx = lines.findIndex(l => /first appeared in/i.test(l))
  if (firstAppearedIdx >= 0) {
    // 向上回溯，找到段落开头（空行、区块边界 或 General song data 的 key:value 行）
    let start = firstAppearedIdx
    const keyValuePattern = /^[A-Za-z][A-Za-z0-9\s@&\-]+?:\s*.+$/
    while (
      start > 0 &&
      lines[start - 1].trim().length > 0 &&
      !keyValuePattern.test(lines[start - 1].trim())
    ) {
      start--
    }
    // 向下收集，直到空行或已知区块标题
    let end = firstAppearedIdx
    const stopPatterns =
      /^(Contents|Lyrics|Appearances|CD Recordings|In Game|Remixes|In Adaptations|In Concerts|Navigation menu|v • d • e|Categories:|This page was last edited)/i
    while (end < lines.length - 1) {
      const next = lines[end + 1].trim()
      if (next.length === 0 || stopPatterns.test(next)) break
      end++
    }
    description = lines
      .slice(start, end + 1)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // 策略 B：如果没有 first appeared，取 General song data 和 Contents 之间的非 key:value 文本
  if (!description && generalStartIdx >= 0 && contentsIdx > generalStartIdx) {
    const between = lines
      .slice(generalStartIdx + generalLines.length + 1, contentsIdx)
      .map(l => l.trim())
      .filter(
        l =>
          l.length > 20 &&
          !l.includes('v • d • e') &&
          !l.match(/^[A-Za-z0-9\s@&\-]+?:\s*/)
      )
    if (between.length > 0) {
      description = between[0]
    }
  }

  // ── 4. 解析 Personal song of ──
  const personalRaw = raw['Personal song of']
  const personalSongOf = personalRaw
    ? personalRaw
        .split(/,|\band\b/)
        .map(s => s.trim())
        .filter(Boolean)
    : undefined

  // ── 5. 提取 BPM ──
  let bpm: number | undefined
  if (raw['BPM']) {
    const bpmMatch = raw['BPM'].match(/(\d+)/)
    if (bpmMatch) bpm = parseInt(bpmMatch[1], 10)
  }

  return {
    titleJa: raw['Original title'],
    titleRomaji: raw['Romanized title'],
    titleEn: raw['Translated title'],
    composer: raw['Composer'],
    lyricist: raw['Lyricist'],
    arranger: raw['Arranger'] || raw['Arranged by'] || raw['Arrangement'],
    bpm,
    description,
    imageStat: raw['Image stat'],
    personalSongOf,
  }
}
