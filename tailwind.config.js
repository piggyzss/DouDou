/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6747ce',
          light: '#8a6fd8',
          dark: '#4f35a0',
        },
        secondary: '#fed336',
        accent: '#d26c9e',
        text: {
          primary: '#34495e',
          secondary: '#3c4858',
          muted: '#6c757d',
          light: '#c6c6c6',
        },
        bg: {
          primary: '#ffffff',
          secondary: '#f8f9fa',
          tertiary: '#e9ecef',
        }
      },
      fontFamily: {
        // 统一使用ZenKakuGothicNew-Medium字体
        sans: ['var(--font-zen-kaku)', 'PingFang SC', 'YouYuan', 'Microsoft Yahei', 'sans-serif'],
        'zen-kaku': ['var(--font-zen-kaku)', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.35rem', { lineHeight: '1.4' }],
        '3xl': ['1.6rem', { lineHeight: '1.3' }],
        '4xl': ['1.85rem', { lineHeight: '1.2' }],
        '5xl': ['2.1rem', { lineHeight: '1.1' }],
        '6xl': ['2.5rem', { lineHeight: '1' }],
      },
      fontWeight: {
        // 恢复原来的字重设置
        'light': '500',
        'normal': '500',
        'medium': '500',
        'semibold': '500',
        'bold': '500',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
} 