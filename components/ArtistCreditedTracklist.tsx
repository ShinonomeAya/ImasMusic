'use client'

import MobileTracklist from './MobileTracklist'
import type { Track } from '@/types'

interface Props {
  tracks: Track[]
  roleMap: Record<string, string>
}

export default function ArtistCreditedTracklist({ tracks, roleMap }: Props) {
  return (
    <MobileTracklist
      tracks={tracks as any}
      getSubtitle={(track) => roleMap[track.id] || ''}
    />
  )
}
