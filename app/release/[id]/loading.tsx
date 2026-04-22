import { SkeletonPage, SkeletonHero, SkeletonText, SkeletonList } from '@/components/ui/Skeleton'

export default function ReleaseLoading() {
  return (
    <SkeletonPage>
      <SkeletonHero hasCover />
      <div className="mt-16">
        <SkeletonText width="30%" height="1.75rem" className="mb-6" />
        <SkeletonList count={8} />
      </div>
    </SkeletonPage>
  )
}
