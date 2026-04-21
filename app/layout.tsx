import type { Metadata } from 'next'
import './globals.css'
import SiteNav from '@/components/SiteNav'

export const metadata: Metadata = {
  title: '偶像大师音乐数据库',
  description: 'THE IDOLM@STER 系列音乐数据库 - 探索所有偶像大师系列的歌曲、风格和偶像',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SiteNav />
        {children}
        <footer className="py-10 px-4 border-t border-[var(--border-prominent)]" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="container-claude text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <p>数据来源: project-imas.wiki</p>
            <p className="mt-2">2024 偶像大师音乐数据库</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
