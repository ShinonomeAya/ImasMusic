import { SkeletonPage, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton'

export default function TracksLoading() {
  return (
    <SkeletonPage>
      <SkeletonText width="30%" height="2.5rem" className="mb-2" />
      <SkeletonText width="15%" height="1.25rem" className="mb-10" />

      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <SkeletonText width="100%" height="2.5rem" className="max-w-md rounded-generous" />
        <div className="flex flex-wrap gap-2">
          {[...Array(7)].map((_, i) => (
            <SkeletonText key={i} width="60px" height="2.25rem" className="rounded-comfortable" />
          ))}
        </div>
        <SkeletonText width="120px" height="2.5rem" className="rounded-comfortable" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} rows={0} className="h-80" />
        ))}
      </div>
    </SkeletonPage>
  )
}
