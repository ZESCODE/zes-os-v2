import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  webpack: (config) => {
    // Android/Termux: avoid EACCES on system dirs by restricting watch scope
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: [
        "**/node_modules/**",
        "/data/**",
        "/**",           // Block root scan (causes EACCES on Android)
      ],
    }
    config.cache = false
    return config
  },
}

export default nextConfig
