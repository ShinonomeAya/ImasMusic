'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, X, Menu } from 'lucide-react'

const TOP_NAV_ITEMS = [
  { label: '发现', href: '/' },
  { label: '专辑', href: '/releases' },
  { label: '单曲', href: '/tracks' },
  { label: '艺人', href: '/artists' },
]

function NavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    if (!query) return true
    const expectedParams = new URLSearchParams(query)
    for (const [key, value] of expectedParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  return (
    <nav className="hidden lg:flex items-center gap-1 ml-12 md:ml-0">
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
  )
}

function SearchButton() {
  const pathname = usePathname()
  const isSearchPage = pathname === '/search'

  return (
    <div className="flex items-center gap-4">
      {isSearchPage ? (
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-generous text-sm transition-all duration-200 hover:ring-warm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-tertiary)',
          }}
        >
          <X size={16} />
          <span className="hidden sm:inline">关闭搜索</span>
        </Link>
      ) : (
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
            className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-subtle text-micro font-mono ml-2"
            style={{
              backgroundColor: 'var(--bg-interactive)',
              color: 'var(--text-tertiary)',
            }}
          >
            ⌘K
          </kbd>
        </Link>
      )}
    </div>
  )
}

export default function TopAppBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 w-full h-14 md:h-16 flex items-center justify-between px-4 md:px-8 transition-colors duration-300"
      style={{
        backgroundColor: 'rgba(var(--bg-page-rgb), 0.85)',
        borderBottom: '1px solid var(--border-default)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* 左侧：汉堡菜单（手机）+ 导航链接（桌面） */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* 手机汉堡按钮 */}
        <button
          onClick={() => {
            // 触发 Sidebar 抽屉打开
            const event = new CustomEvent('toggle-sidebar')
            window.dispatchEvent(event)
          }}
          className="md:hidden p-2 rounded-comfortable transition-colors"
          style={{
            color: 'var(--text-primary)',
          }}
          aria-label="打开菜单"
        >
          <Menu size={20} />
        </button>

        <Suspense fallback={<div className="hidden lg:block ml-12 md:ml-0 h-8 w-64 animate-pulse rounded-comfortable" style={{ backgroundColor: 'var(--bg-interactive)' }} />}>
          <NavLinks />
        </Suspense>
      </div>

      {/* 右侧搜索 */}
      <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-generous" style={{ backgroundColor: 'var(--bg-interactive)' }} />}>
        <SearchButton />
      </Suspense>
    </header>
  )
}
