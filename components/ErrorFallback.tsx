'use client'

import Link from 'next/link'
import { Music2, ArrowLeft, RotateCcw } from 'lucide-react'

export default function ErrorFallback({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ivory border border-border-cream mb-6">
          <Music2 className="w-10 h-10 text-terracotta" />
        </div>
        <h1 className="text-2xl font-medium mb-2 text-near-black text-serif">
          页面加载出错
        </h1>
        <p className="mb-6 text-olive-gray">抱歉，加载过程中发生了错误，请稍后重试</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-olive-gray hover:text-near-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={reset}
            className="btn-terracotta"
          >
            <RotateCcw className="w-4 h-4" />
            重试
          </button>
        </div>
      </div>
    </main>
  )
}
