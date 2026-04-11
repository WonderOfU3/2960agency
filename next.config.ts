import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['@neondatabase/serverless'],
  images: { unoptimized: true },
}

export default nextConfig