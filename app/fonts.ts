import localFont from 'next/font/local'

// 使用ZenKakuGothicNew-Medium字体，但通过CSS控制字重
export const zenKakuGothic = localFont({
  src: './assets/fonts/ZenKakuGothicNew-Medium.ttf',
  display: 'swap',
  variable: '--font-zen-kaku',
  weight: '500', // 恢复为500
})

// 字体组合 - 统一使用同一个字体
export const fontFamily = {
  sans: [
    'var(--font-zen-kaku)',
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
} 