/**
 * 使用 HTML5 Canvas 提取图片主色
 * 算法：量化 RGB → 频率统计 → 取最高频颜色
 */
export function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve('#c96442')
        return
      }

      const size = 64
      canvas.width = size
      canvas.height = size
      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size).data
      const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>()

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i]
        const g = imageData[i + 1]
        const b = imageData[i + 2]
        const a = imageData[i + 3]

        if (a < 128) continue

        // 亮度过滤：去掉太暗和太白的像素
        const brightness = (r + g + b) / 3
        if (brightness < 30 || brightness > 245) continue

        // 量化到 6 级（每通道 42 步长）
        const qr = Math.floor(r / 42)
        const qg = Math.floor(g / 42)
        const qb = Math.floor(b / 42)
        const key = `${qr},${qg},${qb}`

        const existing = colorMap.get(key)
        if (existing) {
          existing.count++
        } else {
          colorMap.set(key, { r, g, b, count: 1 })
        }
      }

      if (colorMap.size === 0) {
        resolve('#c96442')
        return
      }

      // 找频率最高的颜色
      let best = { r: 201, g: 100, b: 66, count: 0 }
      for (const entry of colorMap.values()) {
        if (entry.count > best.count) {
          best = entry
        }
      }

      resolve(`rgb(${best.r}, ${best.g}, ${best.b})`)
    }

    img.onerror = () => resolve('#c96442')
    img.src = imageUrl
  })
}

/**
 * 将颜色变暗/变亮，用于氛围背景
 */
export function adjustColor(rgb: string, amount: number): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgb

  const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount))
  const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount))
  const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount))

  return `rgb(${r}, ${g}, ${b})`
}
