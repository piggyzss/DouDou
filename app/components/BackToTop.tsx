"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowBigLeftDash } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // 当页面滚动超过300px时显示按钮
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 监听滚动事件
    window.addEventListener("scroll", toggleVisibility);

    // 清理事件监听器
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          onClick={scrollToTop}
          className="hidden md:block fixed bottom-8 right-48 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary group"
          aria-label="回到顶部"
        >
          <ArrowBigLeftDash
            size={24}
            className="text-text-secondary group-hover:text-primary transition-colors duration-300"
            style={{ transform: "rotate(90deg)" }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
