import { cn } from '@/lib/utils'

export function SkeletonPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      {children}
    </div>
  )
}

export function SkeletonHero({ hasCover = false }: { hasCover?: boolean }) {
  return (
    <div className="flex flex-col md:flex-row gap-10 mb-16">
      {hasCover && (
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div
            className="aspect-square rounded-very animate-pulse"
            style={{ backgroundColor: 'var(--bg-interactive)' }}
          />
        </div>
      )}
      <div className="flex-1 space-y-4">
        <SkeletonText width="80px" height="1.25rem" className="rounded-full" />
        <SkeletonText width="70%" height="2.5rem" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-md pt-2">
          <SkeletonText width="100%" height="2.5rem" />
          <SkeletonText width="100%" height="2.5rem" />
          <SkeletonText width="100%" height="2.5rem" />
          <SkeletonText width="100%" height="2.5rem" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({
  width,
  height = '1rem',
  className,
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <div
      className={cn('animate-pulse rounded', className)}
      style={{
        width: width || '100%',
        height,
        backgroundColor: 'var(--bg-interactive)',
      }}
    />
  )
}

export function SkeletonCard({ rows = 1, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn('rounded-very p-6 space-y-3', className)}
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-baseline">
          <SkeletonText width={`${40 + Math.random() * 30}%`} height="0.875rem" />
          <SkeletonText width={`${20 + Math.random() * 30}%`} height="0.875rem" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-comfortable"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <div
            className="w-6 h-5 rounded animate-pulse"
            style={{ backgroundColor: 'var(--bg-interactive)' }}
          />
          <div
            className="w-8 h-8 rounded-comfortable animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--bg-interactive)' }}
          />
          <div className="flex-1 space-y-2">
            <SkeletonText width={`${40 + Math.random() * 40}%`} height="0.875rem" />
            <SkeletonText width={`${25 + Math.random() * 30}%`} height="0.75rem" />
          </div>
          <SkeletonText width="48px" height="0.75rem" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div
            className="aspect-square rounded-very animate-pulse"
            style={{ backgroundColor: 'var(--bg-interactive)' }}
          />
          <SkeletonText width="80%" height="0.875rem" />
          <SkeletonText width="40%" height="0.75rem" />
        </div>
      ))}
    </div>
  )
}
