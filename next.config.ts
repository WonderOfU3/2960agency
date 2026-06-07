import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['@neondatabase/serverless', '@napi-rs/canvas'],
  images: { unoptimized: true },
}

export default nextConfig