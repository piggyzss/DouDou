import localFont from 'next/font/local'

// 只使用现有的Medium字体文件
export const zenKakuGothic = localFont({
  src: './assets/fonts/ZenKakuGothicNew-Medium.ttf',
  display: 'swap',
  variable: '--font-zen-kaku',
  weight: '500',
})

// 字体组合
export const fontFamily = {
  sans: [
    'var(--font-zen-kaku)',
    'PingFang SC',
    'YouYuan', 
    'Microsoft Yahei',
    'sans-serif'
  ].join(', '),
}

export default function Example() {
  return (
    <div className="space-y-4">
      {/* 使用默认字体（Medium） */}
      <h1 className="text-4xl font-sans">这是默认字体</h1>
      
      {/* 使用粗体 */}
      <h2 className="text-2xl font-bold">这是粗体文字</h2>
      
      {/* 使用细体 */}
      <p className="text-lg font-light">这是细体文字</p>
      
      {/* 直接使用字体类 */}
      <p className="text-base font-zen-kaku">直接使用ZenKaku字体</p>
    </div>
  )
} 