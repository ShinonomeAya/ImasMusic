'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

const TOP_NAV_ITEMS = [
  { label: '发现', href: '/' },
  { label: '专辑', href: '/releases' },
  { label: '单曲', href: '/releases?type=SINGLE' },
  { label: '艺人', href: '/artists' },
  { label: '创作者', href: '/artists?role=CREATOR' },
]

export default function TopAppBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <header
      className="sticky top-0 z-30 w-full h-16 flex items-center justify-between px-8 transition-colors duration-300"
      style={{
        backgroundColor: 'rgba(var(--bg-page-rgb), 0.85)',
        borderBottom: '1px solid var(--border-default)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── 左侧: 页面标题 ── */}
      <div className="flex items-center gap-8">
        <h2
          className="text-serif text-xl font-medium italic tracking-tight hidden md:block"
          style={{ color: 'var(--text-primary)' }}
        >
          Discography
        </h2>

        {/* ── 主导航 ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {TOP_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-comfortable text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'text-terracotta'
                  : 'hover:text-primary'
              )}
              style={{
                color: isActive(item.href)
                  ? 'var(--color-terracotta)'
                  : 'var(--text-secondary)',
                backgroundColor: isActive(item.href)
                  ? 'rgba(201,100,66,0.08)'
                  : 'transparent',
              }}
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  className="block h-0.5 mt-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-terracotta)' }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── 右侧: 搜索 ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/search"
          className="flex items-center gap-2 px-4 py-2 rounded-generous text-sm transition-all duration-200 hover:ring-warm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-tertiary)',
          }}
        >
          <Search size={16} />
          <span className="hidden sm:inline">搜索曲目、专辑、艺人...</span>
          <span className="sm:hidden">搜索</span>
          <kbd
            className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sharp text-micro font-mono ml-2"
            style={{
              backgroundColor: 'var(--bg-interactive)',
              color: 'var(--text-tertiary)',
            }}
          >
            ⌘K
          </kbd>
        </Link>
      </div>
    </header>
  )
}
