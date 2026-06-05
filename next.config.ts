import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Add 412px breakpoint for mobile viewports (common phone width).
    // This ensures the hero srcset includes an exact mobile size so the
    // browser downloads ~80KB instead of ~120KB on throttled connections.
    imageSizes: [412, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
