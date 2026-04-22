'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SERIES_CONFIG } from '@/lib/series'
import {
  Compass,
  Home,
  Heart,
  Settings,
  Sun,
  Moon,
  Star,
  Sparkles,
  Music,
  Users,
  Diamond,
  GraduationCap,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const SERIES_ICONS: Record<string, React.ElementType> = {
  Star,
  Sparkles,
  Music,
  Users,
  Diamond,
  GraduationCap,
}

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 从 URL 提取当前企划参数
  const activeSeries = pathname.startsWith('/series/')
    ? pathname.split('/')[2]
    : null

  // 设置全局企划色变量（用于平滑过渡高亮色）
  useEffect(() => {
    if (activeSeries) {
      const cfg = SERIES_CONFIG.find((s) => s.id === activeSeries)
      if (cfg) {
        document.documentElement.style.setProperty('--active-brand', cfg.brandColor)
      }
    } else {
      document.documentElement.style.setProperty('--active-brand', 'var(--color-terracotta)')
    }
  }, [activeSeries])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col border-r transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <h1 className="text-serif text-xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            iM@S Archive
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            偶像大师音乐数据库
          </p>
        </Link>
      </div>

      {/* ── 顶部导航 ── */}
      <nav className="flex flex-col gap-1 px-3 mb-2">
        <SidebarItem
          href="/explore"
          icon={Compass}
          label="探索"
          active={isActive('/explore')}
        />
        <SidebarItem
          href="/"
          icon={Home}
          label="全部系列"
          active={pathname === '/'}
        />
      </nav>

      {/* ── 分割线 ── */}
      <div className="mx-4 my-2 h-px" style={{ backgroundColor: 'var(--border-default)' }} />

      {/* ── 企划列表 ── */}
      <div className="px-3 mb-1">
        <p className="text-label uppercase tracking-wider px-3 py-2" style={{ color: 'var(--text-tertiary)' }}>
          企划
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {SERIES_CONFIG.map((series) => {
          const Icon = SERIES_ICONS[series.icon] || Star
          const seriesHref = `/series/${series.id}`
          const active = activeSeries === series.id

          return (
            <Link
              key={series.id}
              href={seriesHref}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-generous text-sm font-medium transition-all duration-300',
                active
                  ? 'bg-opacity-10'
                  : 'hover:bg-opacity-5'
              )}
              style={{
                color: active ? series.brandColor : 'var(--text-secondary)',
                backgroundColor: active ? `${series.brandColor}1A` : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = `${series.brandColor}0D`
                  e.currentTarget.style.color = series.brandColor
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-subtle text-xs transition-colors duration-300"
                style={{
                  backgroundColor: active ? `${series.brandColor}26` : 'var(--bg-interactive)',
                  color: active ? series.brandColor : 'var(--text-tertiary)',
                }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
              <span className="truncate">{series.nameJa}</span>
              {active && (
                <span
                  className="ml-auto w-1 h-5 rounded-full"
                  style={{ backgroundColor: series.brandColor }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── 底部 ── */}
      <div className="px-3 pb-4 pt-2">
        <div className="mx-1 mb-2 h-px" style={{ backgroundColor: 'var(--border-default)' }} />
        <SidebarItem
          href="/favorites"
          icon={Heart}
          label="收藏"
          active={isActive('/favorites')}
        />
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-generous text-sm font-medium w-full transition-colors duration-200 hover:bg-opacity-5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-subtle text-xs" style={{ backgroundColor: 'var(--bg-interactive)', color: 'var(--text-tertiary)' }}>
            {mounted && theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </span>
          <span>{mounted && theme === 'dark' ? '亮色模式' : '暗色模式'}</span>
        </button>
      </div>
    </aside>
  )
}

/* ── Sidebar Item 子组件 ── */
function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-generous text-sm font-medium transition-all duration-200',
        active
          ? 'text-terracotta'
          : 'hover:text-primary'
      )}
      style={{
        color: active ? 'var(--color-terracotta)' : 'var(--text-secondary)',
        backgroundColor: active ? 'rgba(201,100,66,0.08)' : 'transparent',
      }}
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-subtle text-xs"
        style={{
          backgroundColor: active ? 'rgba(201,100,66,0.15)' : 'var(--bg-interactive)',
          color: active ? 'var(--color-terracotta)' : 'var(--text-tertiary)',
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1 h-5 rounded-full bg-terracotta" />
      )}
    </Link>
  )
}
