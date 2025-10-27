import type { Metadata } from "next";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import { typewriterFont, zenKakuGothic } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "./providers";

export const metadata: Metadata = {
  title: "shanshan的个人网站",
  description: "前端开发者 | AI爱好者 | 创意工作者",
  keywords: ["前端开发", "AI", "个人网站", "博客"],
  authors: [{ name: "shanshan" }],
  creator: "shanshan",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/app/assets/icon/icon.svg",
  },
  openGraph: {
    title: "shanshan的个人网站",
    description: "前端开发者 | AI爱好者 | 创意工作者",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${typewriterFont.variable} ${zenKakuGothic.variable} font-sans`}
      >
        <ThemeProvider>
          <div className="min-h-screen">
            <div className="w-full px-4 md:w-1/2 md:mx-auto md:px-0 flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
