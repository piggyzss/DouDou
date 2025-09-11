/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用构建追踪以解决 micromatch 堆栈溢出
  outputFileTracing: false,
  
  // 禁用实验性功能
  experimental: {
    // 启用 webpack 构建工作线程来避免警告
    webpackBuildWorker: true,
  },
  
  // 简化图片配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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