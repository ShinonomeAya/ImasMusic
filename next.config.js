/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is2-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is3-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is4-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is5-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  experimental: {
    // App Router already default in Next.js 15
  },
}

module.exports = nextConfig
