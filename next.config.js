/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化构建配置以解决 micromatch 堆栈溢出问题
  experimental: {
    // 启用 webpack 构建工作器
    webpackBuildWorker: true,
  },
  // 优化构建配置
  webpack: (config, { isServer }) => {
    // 优化文件解析，避免路径匹配问题
    config.resolve.symlinks = false;
    
    // 限制文件扫描范围，避免过多文件导致堆栈溢出
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db',
      ],
    };
    
    return config;
  },
  images: {
    domains: ['localhost'],
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