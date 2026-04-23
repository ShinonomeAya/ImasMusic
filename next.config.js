/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is2-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is3-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is4-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is5-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
}

module.exports = nextConfig
