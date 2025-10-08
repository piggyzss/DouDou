/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6747ce",
          light: "#8a6fd8",
          dark: "#4f35a0",
        },
        secondary: "#eeb8b8",
        accent: "#fed336",
        text: {
          primary: "#000C2A",
          secondary: "#444A6E",
          muted: "#6c757d",
          light: "#c6c6c6",
        },
        bg: {
          primary: "#ffffff",
          secondary: "#f8f9fa",
          tertiary: "#e9ecef",
        },
      },
      fontFamily: {
        // 标题字体 - ZenKakuGothicNew-Medium
        heading: [
          "var(--font-zen-kaku)",
          "PingFang SC",
          "YouYuan",
          "Microsoft Yahei",
          "sans-serif",
        ],
        // 英文字体 - fzm-Old.Typewriter
        english: [
          "var(--font-typewriter)",
          "PingFang SC",
          "YouYuan",
          "Microsoft Yahei",
          "sans-serif",
        ],
        // 正文字体 - PingFang SC
        body: ["PingFang SC", "YouYuan", "Microsoft Yahei", "sans-serif"],
        // 默认字体
        sans: [
          "var(--font-typewriter)",
          "PingFang SC",
          "YouYuan",
          "Microsoft Yahei",
          "sans-serif",
        ],
        typewriter: ["var(--font-typewriter)", "sans-serif"],
        "zen-kaku": ["var(--font-zen-kaku)", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.35rem", { lineHeight: "1.4" }],
        "3xl": ["1.6rem", { lineHeight: "1.3" }],
        "4xl": ["1.85rem", { lineHeight: "1.2" }],
        "5xl": ["2.1rem", { lineHeight: "1.1" }],
        "6xl": ["2.5rem", { lineHeight: "1" }],
      },
      fontWeight: {
        // 恢复原来的字重设置
        light: "500",
        normal: "500",
        medium: "500",
        semibold: "500",
        bold: "500",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".dark .text-text-primary": {
          color: "#ffffff",
        },
        ".dark .text-text-secondary": {
          color: "rgba(255, 255, 255, 0.9)",
        },
        ".dark .text-text-muted": {
          color: "rgba(255, 255, 255, 0.7)",
        },
        ".dark .text-text-light": {
          color: "rgba(255, 255, 255, 0.8)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
  darkMode: "class",
};
