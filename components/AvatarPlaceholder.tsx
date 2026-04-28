'use client'

import { SERIES_MAP } from '@/lib/series'

function getInitial(name: string): string {
  if (!name) return '?'
  // 日文名（含汉字/假名）：取第一个字符
  // 英文名：取首字母大写
  const first = name.trim().charAt(0)
  return first || '?'
}

function getBgColor(seriesIds?: string[]): string {
  if (!seriesIds || seriesIds.length === 0) return 'var(--bg-interactive)'
  const series = SERIES_MAP[seriesIds[0]]
  return series?.brandColor || 'var(--bg-interactive)'
}

interface AvatarPlaceholderProps {
  name: string
  series?: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { wrapper: 'w-10 h-10', text: 'text-sm' },
  md: { wrapper: 'w-20 h-20', text: 'text-xl' },
  lg: { wrapper: 'w-32 h-32 md:w-40 md:h-40', text: 'text-3xl md:text-4xl' },
}

export default function AvatarPlaceholder({
  name,
  series,
  size = 'md',
  className = '',
}: AvatarPlaceholderProps) {
  const initial = getInitial(name)
  const bgColor = getBgColor(series)
  const dims = SIZE_MAP[size]

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 ${dims.wrapper} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <span
        className={`font-serif font-bold select-none ${dims.text}`}
        style={{ color: 'rgba(255,255,255,0.95)' }}
      >
        {initial}
      </span>
    </div>
  )
}
