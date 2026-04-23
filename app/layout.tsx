import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Sidebar from '@/components/layout/Sidebar'
import TopAppBar from '@/components/layout/TopAppBar'
import BottomPlayer from '@/components/layout/BottomPlayer'
import BottomNav from '@/components/layout/BottomNav'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'

export const metadata: Metadata = {
  title: 'iM@S Archive — 偶像大师音乐数据库',
  description: 'THE IDOLM@STER 系列音乐数据库 — 探索所有偶像大师系列的歌曲、专辑、艺人与创作者',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg-page)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* 侧边栏 */}
          <Sidebar />

          {/* 主内容区 */}
          <div className="md:ml-64 flex flex-col min-h-screen">
            {/* 顶栏 */}
            <TopAppBar />

            {/* 页面内容 */}
            <main className="flex-1 pb-28 md:pb-0">
              {children}
            </main>

            {/* 页脚 */}
            <footer
              className="py-10 px-4 md:px-8 border-t transition-colors duration-300"
              style={{
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-serif text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    iM@S Archive
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    偶像大师音乐数据库 — 档案与探索
                  </p>
                </div>
                <div className="flex gap-6">
                  <a href="#" className="text-sm hover:text-primary transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                    关于项目
                  </a>
                  <a href="#" className="text-sm hover:text-primary transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                    数据指南
                  </a>
                  <a href="#" className="text-sm hover:text-primary transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                    GitHub
                  </a>
                </div>
              </div>
            </footer>
          </div>

          {/* 底部播放条 */}
          <BottomPlayer />

          {/* 移动端底部导航 */}
          <BottomNav />

          {/* 全局键盘快捷键 */}
          <KeyboardShortcuts />
        </ThemeProvider>
      </body>
    </html>
  )
}
