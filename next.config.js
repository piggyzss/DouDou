/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用实验性功能以解决 Vercel 构建问题
  experimental: {
    // 禁用构建追踪以解决 micromatch 堆栈溢出
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // 简化图片配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // 优化 webpack 配置
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // 生产构建时禁用一些可能导致问题的功能
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
      }
    }
    
    // 忽略可能导致循环依赖的模块
    config.ignoreWarnings = [
      /Module not found: Can't resolve/,
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },
  // 添加缓存控制头
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig