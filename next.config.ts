import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/Master-OS' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
