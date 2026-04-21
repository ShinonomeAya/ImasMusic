'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music, Search, Map, BarChart3, GitCompare, Heart } from 'lucide-react'

const navItems = [
  { href: '/', label: '首页', icon: Music },
  { href: '/search', label: '搜索', icon: Search },
  { href: '/map', label: '风格地图', icon: Map },
  { href: '/timeline', label: '时间线', icon: BarChart3 },
  { href: '/compare', label: '对比', icon: GitCompare },
  { href: '/favorites', label: '收藏', icon: Heart },
]

export default function SiteNav() {
  const pathname = usePathname()

  return (
    <header className="nav-claude">
      <div className="container-claude">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Music className="w-5 h-5 text-terracotta" />
            <span className="hidden sm:block text-sm font-medium text-near-black group-hover:text-terracotta transition-colors text-serif">
              偶像大师音乐数据库
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-generous text-sm transition-all ${
                    isActive
                      ? 'bg-ivory text-terracotta border border-border-cream shadow-ring'
                      : 'text-olive-gray hover:text-near-black hover:bg-ivory/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
