import { SkeletonPage, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton'

export default function ArtistLoading() {
  return (
    <SkeletonPage>
      <div className="flex flex-col md:flex-row gap-8 mb-16 items-start">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-highly animate-pulse shrink-0" style={{ backgroundColor: 'var(--bg-interactive)' }} />
        <div className="flex-1 space-y-4">
          <div className="flex gap-3">
            <SkeletonText width="60px" height="1.5rem" className="rounded-full" />
            <SkeletonText width="80px" height="1.5rem" className="rounded-full" />
          </div>
          <SkeletonText width="60%" height="2.5rem" />
          <SkeletonText width="40%" height="1.25rem" />
          <div className="flex gap-6 pt-2">
            <SkeletonText width="48px" height="2rem" />
            <SkeletonText width="48px" height="2rem" />
          </div>
        </div>
      </div>
      <div>
        <SkeletonText width="30%" height="1.75rem" className="mb-6" />
        <SkeletonCard rows={4} />
      </div>
    </SkeletonPage>
  )
}
