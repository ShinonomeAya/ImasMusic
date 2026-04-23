'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Disc, Music, Users, Heart } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/releases', label: '专辑', icon: Disc },
  { href: '/tracks', label: '单曲', icon: Music },
  { href: '/artists', label: '艺人', icon: Users },
  { href: '/favorites', label: '我的', icon: Heart },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 touch-highlight-none"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200',
                active ? 'text-terracotta' : 'text-stone-gray'
              )}
              style={{
                color: active ? 'var(--color-terracotta)' : 'var(--text-tertiary)',
              }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.5}
                className="transition-transform duration-200"
              />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
