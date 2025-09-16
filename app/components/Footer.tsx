'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/yourusername' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/yourusername' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yourusername' },
  { name: 'Email', icon: Mail, href: 'mailto:your.email@example.com' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-bg-secondary dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 个人信息 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">&lt;shanshan /&gt;</span>
            </div>
            <p className="text-text-secondary text-sm">
              前端开发者 | AI爱好者 | 创意工作者
            </p>
            <p className="text-text-muted text-xs">
              用代码创造美好，用AI探索未来
            </p>
          </div>

          {/* 快速链接 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/blog" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  博客文章
                </a>
              </li>
              <li>
                <a href="/apps" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  开发作品
                </a>
              </li>
              <li>
                <a href="/aigc" className="text-text-secondary hover:text-primary transition-colors text-sm">
                  AIGC作品
                </a>
              </li>
            </ul>
          </div>

          {/* 社交媒体 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">关注我</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-text-muted text-sm">
              © {currentYear} shanshan. 保留所有权利.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}