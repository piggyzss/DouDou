"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Carrot,
  Code,
  Menu,
  Moon,
  Palette,
  PenSquare,
  Search,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../providers";

const navItems = [
  { name: "Hi", href: "/", icon: Carrot },
  { name: "Blog", href: "/blog", icon: PenSquare },
  { name: "App", href: "/apps", icon: Code },
  { name: "AIGC", href: "/aigc", icon: Palette },
  { name: "Agent", href: "/agent", icon: Bot },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以添加搜索逻辑
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav-mobile ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full px-4 md:w-1/2 md:mx-auto md:px-0">
        <div className="flex items-center h-12">
          {/* 左侧导航 */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="transform transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <Link
                    href={item.href}
                    className={`relative px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center space-x-2 ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-text-secondary hover:text-primary"
                    }`}
                  >
                    <Icon
                      size={16}
                      className="icon-hover-rotate text-current flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="font-blog leading-none">
                      {item.name}
                    </span>
                    {pathname === item.href && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 右侧搜索和主题切换 */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* 搜索栏 */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 text-sm font-blog bg-bg-secondary dark:bg-gray-800 border-none outline-none rounded-full placeholder-text-light text-text-secondary focus:placeholder-text-light focus:ring-0 focus:bg-bg-tertiary dark:focus:bg-gray-700 transition-all duration-500 ease-in-out"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
                />
              </div>
            </form>

            {/* 主题切换按钮 - 在移动端也显示 */}
            <motion.button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </motion.button>

            {/* 移动端菜单按钮 */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors nav-menu-button"
              aria-label="Toggle navigation menu"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* 移动端导航 */}
        <motion.div
          className={`md:hidden nav-dropdown ${isOpen ? 'open' : ''}`}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            pointerEvents: isOpen ? 'auto' : 'none',
            overflow: 'hidden'
          }}
        >
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 mt-2 nav-dropdown">
            {/* 移动端搜索栏 */}
            <form onSubmit={handleSearch} className="px-0 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm font-blog bg-bg-secondary dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full outline-none placeholder-text-light text-text-secondary focus:placeholder-text-light focus:border-transparent focus:ring-0 focus:bg-bg-tertiary dark:focus:bg-gray-700 transition-all duration-500 ease-in-out"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent"
                />
              </div>
            </form>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="transform transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center space-x-2 ${
                      pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-text-secondary hover:text-primary hover:bg-gray-100 transition-all duration-300 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon
                      size={16}
                      className="icon-hover-rotate text-current flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="font-blog leading-none">
                      {item.name}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
