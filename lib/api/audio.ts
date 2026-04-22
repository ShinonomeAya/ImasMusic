/**
 * 音频相关工具
 * 处理 previewUrl 验证、格式转换等
 */

/**
 * 验证 iTunes 30秒试听 URL 是否可用
 */
export async function validatePreviewUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const ct = res.headers.get('content-type')
    return res.ok && ct ? ct.includes('audio') : false
  } catch {
    return false
  }
}

/**
 * 获取音频时长（秒）
 * 如果 iTunes 返回了 trackTimeMillis 则直接使用，否则返回 undefined
 */
export function getDurationFromMillis(ms: number | undefined): number | undefined {
  if (!ms) return undefined
  return Math.round(ms / 1000)
}

/**
 * 将 iTunes 的 releaseDate 解析为年份
 */
export function parseReleaseYear(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined
  try {
    return new Date(dateStr).getFullYear()
  } catch {
    return undefined
  }
}
