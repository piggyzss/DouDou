'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/yourusername', color: '#333' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/yourusername', color: '#1DA1F2' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/yourusername', color: '#0077B5' },
  { name: 'Email', icon: Mail, href: 'mailto:your.email@example.com', color: '#EA4335' },
]

export default function SocialLinks() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary mb-4">联系我</h2>
          <p className="text-xl text-text-secondary mb-12">
            欢迎与我交流技术、分享想法
          </p>

          <div className="flex justify-center space-x-8">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <social.icon 
                    size={28} 
                    className="group-hover:text-white transition-colors duration-300"
                    style={{ color: social.color }}
                  />
                </div>
                <p className="text-sm text-text-secondary mt-2 group-hover:text-primary transition-colors">
                  {social.name}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}