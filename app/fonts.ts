import localFont from 'next/font/local'

// 标题字体 - ZenKakuGothicNew-Medium
export const zenKakuGothic = localFont({
  src: './assets/fonts/ZenKakuGothicNew-Medium.ttf',
  display: 'swap',
  variable: '--font-zen-kaku',
  weight: '500',
})

// 英文字体 - fzm-Old.Typewriter
export const typewriterFont = localFont({
  src: './assets/fonts/fzm-Old.Typewriter.ttf',
  display: 'swap',
  variable: '--font-typewriter',
  weight: '400',
})

// 字体组合配置
export const fontFamily = {
  // 标题字体组合
  heading: [
    'var(--font-zen-kaku)',
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
  
  // 英文字体组合
  english: [
    'var(--font-typewriter)',
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
  
  // 正文字体组合
  body: [
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
  
  // 默认字体组合
  sans: [
    'var(--font-typewriter)',
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
} 