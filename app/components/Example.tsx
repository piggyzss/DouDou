import localFont from 'next/font/local'

// 使用fzm-Old.Typewriter字体
export const typewriterFont = localFont({
  src: './assets/fonts/fzm-Old.Typewriter.ttf',
  display: 'swap',
  variable: '--font-typewriter',
  weight: '400',
})

// 字体组合
export const fontFamily = {
  sans: [
    'var(--font-typewriter)',
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
      <p className="text-base font-typewriter">直接使用Typewriter字体</p>
    </div>
  )
} 