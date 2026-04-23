import { Suspense } from 'react'
import { getAllReleases } from '@/lib/data'
import ReleaseList from './ReleaseList'

export default async function ReleasesPage() {
  const releases = await getAllReleases()
  return (
    <Suspense fallback={<div className="px-4 md:px-8 py-10 max-w-7xl mx-auto text-center text-tertiary">加载中...</div>}>
      <ReleaseList releases={releases} />
    </Suspense>
  )
}
