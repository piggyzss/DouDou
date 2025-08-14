import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { zenKakuGothic } from './fonts'

export const metadata: Metadata = {
  title: 'shanshan的个人网站',
  description: '前端开发者 | AI爱好者 | 创意工作者',
  keywords: ['前端开发', 'AI', '个人网站', '博客'],
  authors: [{ name: 'shanshan' }],
  creator: 'shanshan',
  openGraph: {
    title: 'shanshan的个人网站',
    description: '前端开发者 | AI爱好者 | 创意工作者',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${zenKakuGothic.variable} font-sans`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 