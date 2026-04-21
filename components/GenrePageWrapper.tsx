'use client'

import { ReactNode } from 'react'
import { GenreDecorator } from './GenreDecorator'
import type { PrimaryGenre } from '@/types/song'

interface GenrePageWrapperProps {
  genreSlug: PrimaryGenre
  children: ReactNode
}

export function GenrePageWrapper({ genreSlug, children }: GenrePageWrapperProps) {
  return (
    <div data-genre={genreSlug} className="relative min-h-screen">
      <GenreDecorator genreSlug={genreSlug} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
