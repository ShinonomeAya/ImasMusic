import { SkeletonPage, SkeletonHero, SkeletonText, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton'

export default function TrackLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero hasCover />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
        <div className="col-span-1 flex flex-col gap-8">
          <SkeletonCard rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <SkeletonText width="40%" height="1.75rem" className="mb-6" />
          <SkeletonCard rows={3} />
        </div>
      </div>
      <div className="mt-16">
        <SkeletonText width="30%" height="1.75rem" className="mb-6" />
        <SkeletonList count={6} />
      </div>
    </SkeletonPage>
  )
}
