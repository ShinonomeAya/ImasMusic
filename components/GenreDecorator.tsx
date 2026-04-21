'use client'

import type { PrimaryGenre } from '@/types/song'
import { getGenreConfig } from '@/styles/genres.config'

interface GenreDecoratorProps {
  genreSlug: PrimaryGenre
}

export function GenreDecorator({ genreSlug }: GenreDecoratorProps) {
  const genre = getGenreConfig(genreSlug)
  const color = genre?.color?.light || '#87867f'
  const secondary = genre?.color?.secondary || '#b0aea5'

  const decorators: Record<PrimaryGenre, React.ReactNode> = {
    'idol-pop': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="idol-pop-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill={color} />
              <circle cx="90" cy="90" r="15" fill={secondary} />
              <polygon points="90,20 100,40 80,40" fill={secondary} />
              <circle cx="60" cy="60" r="8" fill={color} opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#idol-pop-pattern)" />
        </svg>
      </div>
    ),

    'mature-pop': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mature-pop-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,10 70,40 40,70 10,40" fill="none" stroke={color} strokeWidth="0.5" />
              <polygon points="40,25 55,40 40,55 25,40" fill="none" stroke={secondary} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mature-pop-pattern)" />
        </svg>
      </div>
    ),

    'rock-energy': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="rock-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke={color} strokeWidth="1" />
              <line x1="0" y1="0" x2="60" y2="60" stroke={secondary} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rock-pattern)" />
        </svg>
      </div>
    ),

    'electronic': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="electronic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="1" fill={color} />
              <rect x="0" y="20" width="40" height="0.5" fill={secondary} opacity="0.5" />
              <rect x="20" y="0" width="1" height="40" fill={color} opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#electronic-pattern)" />
        </svg>
      </div>
    ),

    'jazz-soul': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="jazz-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="2" fill={color} />
              <circle cx="0" cy="0" r="1.5" fill={secondary} />
              <circle cx="24" cy="24" r="1.5" fill={secondary} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#jazz-pattern)" />
        </svg>
      </div>
    ),

    classical: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="classical-pattern" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="200" y2="10" stroke={color} strokeWidth="0.4" />
              <line x1="0" y1="20" x2="200" y2="20" stroke={color} strokeWidth="0.4" />
              <line x1="0" y1="30" x2="200" y2="30" stroke={color} strokeWidth="0.4" />
              <line x1="0" y1="40" x2="200" y2="40" stroke={color} strokeWidth="0.4" />
              <line x1="0" y1="50" x2="200" y2="50" stroke={color} strokeWidth="0.4" />
              <ellipse cx="40" cy="25" rx="4" ry="3" fill={secondary} opacity="0.6" />
              <line x1="44" y1="25" x2="44" y2="10" stroke={secondary} strokeWidth="0.8" opacity="0.6" />
              <ellipse cx="100" cy="35" rx="4" ry="3" fill={secondary} opacity="0.4" />
              <line x1="104" y1="35" x2="104" y2="20" stroke={secondary} strokeWidth="0.8" opacity="0.4" />
              <ellipse cx="160" cy="20" rx="4" ry="3" fill={secondary} opacity="0.5" />
              <line x1="164" y1="20" x2="164" y2="5" stroke={secondary} strokeWidth="0.8" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#classical-pattern)" />
        </svg>
      </div>
    ),

    wafuu: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="wafuu-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 Q20 20 40 40 Q60 60 80 40" fill="none" stroke={color} strokeWidth="1" />
              <path d="M0 40 Q20 60 40 40 Q60 20 80 40" fill="none" stroke={secondary} strokeWidth="0.8" />
              <path d="M0 0 Q20 -20 40 0 Q60 20 80 0" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
              <path d="M0 80 Q20 60 40 80 Q60 100 80 80" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wafuu-pattern)" />
        </svg>
      </div>
    ),

    'stage-drama': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <radialGradient id="spotlight" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="60%" fill="url(#spotlight)" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke={secondary} strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="85%" x2="100%" y2="85%" stroke={secondary} strokeWidth="0.3" opacity="0.2" />
        </svg>
      </div>
    ),

    'ambient-ballad': (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${color} 0%, transparent 60%),
                         radial-gradient(ellipse at 70% 60%, ${secondary} 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 80%, ${color} 0%, transparent 70%)`,
          }}
        />
      </div>
    ),
  }

  return decorators[genreSlug] || null
}
