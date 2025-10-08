import localFont from "next/font/local";

// 标题字体 - ZenKakuGothicNew-Medium
export const zenKakuGothic = localFont({
  src: "./assets/fonts/ZenKakuGothicNew-Medium.ttf",
  display: "swap",
  variable: "--font-zen-kaku",
  weight: "500",
});

// 英文字体 - fzm-Old.Typewriter
export const typewriterFont = localFont({
  src: "./assets/fonts/fzm-Old.Typewriter.ttf",
  display: "swap",
  variable: "--font-typewriter",
  weight: "400",
});
