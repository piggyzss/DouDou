"use client";

import { motion } from "framer-motion";
import Update from "./Update";
import { Terminal } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 relative overflow-hidden">
      {/* 背景日历：置于内容下方，透明度降低 */}
      <div
        className="absolute inset-0 z-0 pointer-events-none select-none"
        aria-hidden
      >
        <div className="absolute inset-x-0 top-[66%] scale-100">
          <Update />
        </div>
      </div>

      <div
        className="max-w-5xl mx-auto text-center relative z-10"
        style={{ transform: "translateY(-24%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-text-muted font-blog hover:text-primary transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <Terminal size={16} />
            <span>More About Me</span>
          </button>
        </motion.div>

        {/* 主要内容 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* 主标题 */}
          <div className="space-y-4">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-6xl font-bold font-heading leading-tight whitespace-nowrap"
              style={{}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span
                className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-english"
                style={{
                  fontWeight: 800,
                  fontSize: "58px",
                  letterSpacing: "-1.5px",
                }}
              >
                Hello, I&apos;m shanshan
              </span>
            </motion.h1>

            <motion.h2
              className="text-text-primary"
              style={{
                fontFamily: "Epilogue, sans-serif",
                fontWeight: 800,
                fontSize: "38px",
                letterSpacing: "-1.5px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Welcome to my world!
            </motion.h2>
          </div>

          {/* 描述文字 */}
          <motion.div
            className="max-w-3xl mx-auto mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed font-blog">
              用代码创造美好，用AI探索未来，让创意与技术完美融合
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
