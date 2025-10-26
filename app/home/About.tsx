"use client";

import { motion } from "framer-motion";
import {
  Carrot,
  Github,
  Linkedin,
  Mail,
  Rss,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ExperienceCard {
  id: number;
  title: string;
  description: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
}

export default function About() {
  // 颜色映射函数 - 将CSS变量转换为实际颜色值
  const getCardColor = (colorVar: string) => {
    const colorMap: { [key: string]: string } = {
      primary: "#6747ce",
      secondary: "#FADCDA",
      blue: "#3388ff",
      yellow: "#fed336",
      green1: "#8ccc79",
      green2: "#53b88f",
    };
    return colorMap[colorVar] || colorVar;
  };

  // Experience 数据
  const experienceData = [
    {
      id: 1,
      company: "ByteDance",
      description: "负责数据BI产品前端开发工作，主导用户画像分析和开放平台等多个核心模块从零到一设计与开发，拓宽BI产品能力边界，推动产品能力体系化升级。"
    },
    {
      id: 2,
      company: "Horizon Robotics",
      description: "负责数据标注平台前端开发工作，专注于用户体验，创造强交互、高性能的数据标注平台，为模型训练提供高质量高效率的标注数据"
    }
  ];

  const [cards, setCards] = useState<ExperienceCard[]>([
    {
      id: 1,
      title: "关于我",
      description: "性格迷糊\n盲目乐观\n擅长寻找好吃的\n以及写bug",
      color: "primary",
      x: 35,
      y: -15,
      rotation: -8,
    },
    {
      id: 2,
      title: "关于生活",
      description: "人生都太短暂\n去疯\n去爱\n去浪费",
      color: "secondary",
      x: 72,
      y: 10,
      rotation: 12,
    },
    {
      id: 3,
      title: "关于爱好",
      description: "比起看漫画\n更喜欢自己画各种有意思的东西\n有时喜欢哼歌\n有时写一点字",
      color: "blue",
      x: 5,
      y: 15,
      rotation: -5,
    },
    {
      id: 4,
      title: "关于AI",
      description: "最近发现AI好有意思\n感觉像是交到了一个无所不能的超人朋友\n开始尝试用它写写代码\n或者写写诗",
      color: "yellow",
      x: 52,
      y: 32,
      rotation: 10,
    },
    {
      id: 5,
      title: "关于其它",
      description: "会按照颜色严格分类app\n会偶尔爆发J属性的超级P人\n可爱又迷人的反派角色",
      color: "green1",
      x: 17,
      y: 60,
      rotation: -3,
    },
    {
      id: 6,
      title: "关于坚持",
      description: "有着奇怪的坚持力\n总能在各种坑里想办法让自己不被打倒且变得更强",
      color: "green2",
      x: 46,
      y: 75,
      rotation: 7,
    },
  ]);

  const handleDragEnd = (cardId: number, info: any) => {
    const container = document.querySelector(".about-section");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              x: Math.max(5, Math.min(90, x)),
              y: Math.max(5, Math.min(90, y)),
            }
          : card,
      ),
    );
  };

  return (
    <section id="about" className="pt-20 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* 新的动画标题区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-center mb-12"
        >
          {/* 两条横线容器 */}
          <div className="flex items-center justify-center mb-6">
            {/* 左侧横线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-text-primary flex-1 max-w-32"
              style={{ transformOrigin: "right" }}
            />

            {/* 标题 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: false }}
              className="text-2xl font-medium text-text-primary font-english mx-6 px-4 py-2"
            >
              About
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-text-primary flex-1 max-w-32"
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>

        {/* 主要内容区域 - 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* 左侧：Links、Skills、Experience */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Links */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">
                Links
              </h3>
              <div className="flex space-x-4">
                <motion.a
                  href="https://github.com/piggyzss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin size={20} />
                </motion.a>
                <motion.a
                  href="/api/rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  title="订阅RSS"
                >
                  <Rss size={20} strokeWidth={2.5} />
                </motion.a>
                <motion.a
                  href="mailto:doudou.lookstar@gmail.com"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail size={20} />
                </motion.a>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "TypeScript",
                  "Node.js",
                  "Python",
                  "Webpack",
                  "Vite",
                  "CI/CD",
                  "AI Coding",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-0.5 border border-gray-300 rounded text-xs blog-body-text hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">
                Experience
              </h3>
              <div className="space-y-4">
                {experienceData.map((experience) => (
                  <div key={experience.id} className="flex items-start space-x-3">
                    <Carrot
                      className="w-5 h-5 text-text-secondary mt-1 flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {experience.company}
                      </h4>
                      <p className="text-sm blog-body-text mt-2">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 右侧：头像和可拖拽卡片 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* 头像区域 */}
            <div className="text-center mb-8 ml-4">
              <div className="relative w-52 h-52 mx-auto mb-6">
                {/* 装饰性背景圆圈 - 移到后面避免影响头像 */}
                <div className="absolute inset-2 bg-gradient-to-br from-primary/15 to-secondary/15 rounded-full -z-10"></div>
                {/* 头像容器 */}
                <div
                  className="avatar-container w-full h-full relative z-10"
                  style={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    transform: "scale(1)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Image
                    src="/images/avatar.png"
                    alt="shanshan的头像"
                    width={400}
                    height={400}
                    className="avatar-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "none !important",
                      outline: "none !important",
                      boxShadow: "none !important",
                      margin: "0 !important",
                      padding: "0 !important",
                      borderRadius: "0 !important",
                      display: "block",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 可拖拽卡片区域 */}
            <div className="relative w-full h-96">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * card.id }}
                  viewport={{ once: true }}
                  className="absolute cursor-move z-10"
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
                  }}
                  drag
                  dragMomentum={false}
                  dragElastic={0.1}
                  onDragEnd={(event, info) => handleDragEnd(card.id, info)}
                >
                  <div
                    className="w-40 h-40 p-4 rounded hover:shadow-lg transition-all duration-300 blog-body-text font-body group"
                    style={{
                      backgroundColor: `${getCardColor(card.color)}95`,
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-1 group-hover:scale-105 transition-transform duration-300">
                      {card.title}
                    </h4>
                    <p className="text-xs opacity-80 leading-relaxed group-hover:opacity-90 transition-opacity duration-300 whitespace-pre-line">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
