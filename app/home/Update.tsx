"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rabbit, PartyPopper } from "lucide-react";

interface MosaicTile {
  id: string;
  size: "uniform";
  intensity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  eaten?: boolean;
}

export default function Update() {
  const [isMounted, setIsMounted] = useState(false);
  const [tiles, setTiles] = useState<MosaicTile[]>([]);
  const [rabbitPosition, setRabbitPosition] = useState({ x: -50, y: 74 }); // Start off-screen left, middle row
  const [currentTileIndex, setCurrentTileIndex] = useState(0);
  const [isRabbitActive, setIsRabbitActive] = useState(false);
  const [rabbitDirection, setRabbitDirection] = useState<
    "left-to-right" | "right-to-left"
  >("left-to-right");

  const [isPaused, setIsPaused] = useState(false);
  const [isClickDisabled, setIsClickDisabled] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [fireworks, setFireworks] = useState<
    Array<{ id: string; x: number; y: number; size: number; direction: number }>
  >([]);
  const [rabbitJumpPosition, setRabbitJumpPosition] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const generatedTiles = generateMosaicTiles();
    setTiles(generatedTiles);

    // Start rabbit animation after a delay
    const timer = setTimeout(() => {
      setIsRabbitActive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 生成网格化马赛克瓷砖数据
  const generateMosaicTiles = (): MosaicTile[] => {
    // 简单的可复现伪随机数（Mulberry32）
    const mulberry32 = (a: number) => {
      return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const rng = mulberry32(20241220); // 固定种子确保一致性
    const tiles: MosaicTile[] = [];

    // 网格配置
    const tileSize = 12; // 统一的瓷砖大小
    const gap = 2; // 瓷砖间距
    const cols = 60; // 列数
    const rows = 12; // 行数

    let id = 0;

    // 生成网格化布局，按蛇形路径顺序排列
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 根据蛇形路径确定实际的列位置
        let actualCol: number;
        if (row % 2 === 0) {
          // 偶数行：从左到右
          actualCol = col;
        } else {
          // 奇数行：从右到左
          actualCol = cols - 1 - col;
        }

        // 网格位置（使用实际列位置）
        const x = actualCol * (tileSize + gap);
        const y = row * (tileSize + gap);

        // 参考图片创建更自然美观的分布
        const baseRandom = rng();

        // 创建类似GitHub贡献图的自然分布
        let intensity = 0;

        // 使用更自然的概率分布
        const activityLevel = baseRandom;

        if (activityLevel < 0.4) {
          // 40% 完全空白
          intensity = 0;
        } else if (activityLevel < 0.7) {
          // 30% 浅色
          intensity = 0.15 + rng() * 0.25; // 15-40%
        } else if (activityLevel < 0.9) {
          // 20% 中等
          intensity = 0.45 + rng() * 0.25; // 45-70%
        } else {
          // 10% 深色
          intensity = 0.75 + rng() * 0.25; // 75-100%
        }

        // 添加位置相关的聚集效应，创建更自然的模式
        const positionInfluence =
          Math.sin(actualCol * 0.15) * Math.cos(row * 0.2) * 0.5 + 0.5;

        // 在某些区域增加活跃度
        if (positionInfluence > 0.6 && intensity === 0 && rng() < 0.3) {
          intensity = 0.1 + rng() * 0.2;
        }

        // 在活跃区域增强现有强度
        if (intensity > 0 && positionInfluence > 0.7) {
          intensity = Math.min(1, intensity * 1.2);
        }

        // 确保强度在合理范围内
        intensity = Math.max(0, Math.min(1, intensity));

        tiles.push({
          id: `tile-${id++}`,
          size: "uniform",
          intensity,
          x,
          y,
          width: tileSize,
          height: tileSize,
        });
      }
    }

    return tiles;
  };

  // Rabbit eating animation effect with proper sequential movement
  useEffect(() => {
    if (!isRabbitActive || isPaused) return;

    // Check if we've finished all tiles
    if (currentTileIndex >= tiles.length) {
      // Start celebration sequence
      if (!isCelebrating) {
        setIsCelebrating(true);
        startCelebration();
      }
      return;
    }

    const timer = setTimeout(() => {
      const targetTile = tiles[currentTileIndex];

      if (targetTile) {
        // Calculate row and column for direction logic
        const cols = 60;
        const row = Math.floor(currentTileIndex / cols);
        const col = currentTileIndex % cols;

        // Determine direction based on row (even rows: left-to-right, odd rows: right-to-left)
        const shouldBeLeftToRight = row % 2 === 0;
        setRabbitDirection(
          shouldBeLeftToRight ? "left-to-right" : "right-to-left",
        );

        // Move rabbit to tile position (centered on tile)
        setRabbitPosition({
          x: targetTile.x - 24, // Adjust for rabbit size and padding
          y: targetTile.y - 26, // Adjust for better vertical alignment
        });

        // After rabbit reaches position, handle the tile
        setTimeout(() => {
          // Eat all tiles including empty ones (浅紫灰色)
          setTiles((prev) =>
            prev.map((tile, index) =>
              index === currentTileIndex ? { ...tile, eaten: true } : tile,
            ),
          );
          // Always move to next tile
          setCurrentTileIndex((prev) => prev + 1);
        }, 600); // Longer delay for smooth eating animation
      }
    }, 1200); // Time between each move (slower and more relaxed)

    return () => clearTimeout(timer);
  }, [currentTileIndex, tiles, isRabbitActive, isPaused]);

  // Celebration sequence: turn around, jump, and create fireworks
  const startCelebration = () => {
    // Turn around (flip direction)
    setTimeout(() => {
      setRabbitDirection((prev) =>
        prev === "left-to-right" ? "right-to-left" : "left-to-right",
      );
    }, 500);

    // Start jumping sequence
    setTimeout(() => {
      setIsJumping(true);
      performJumpSequence();
    }, 1000);

    // Clear fireworks after animation
    setTimeout(() => {
      setFireworks([]);
      setIsCelebrating(false);
      setIsJumping(false);
    }, 6000);
  };

  // Perform jumping sequence with 3 jumps forward
  const performJumpSequence = () => {
    const jumpSteps = 3;
    const jumpDistance = 40; // Distance per jump
    const jumpHeight = -15; // Upward movement
    const jumpDuration = 400; // Duration per jump in ms

    let currentStep = 0;

    const performJump = () => {
      if (currentStep >= jumpSteps) {
        // All jumps completed, create fireworks
        setTimeout(() => {
          createFireworks();
        }, 300);
        return;
      }

      // Calculate new position
      const direction = rabbitDirection === "left-to-right" ? 1 : -1;
      const newX =
        rabbitPosition.x + jumpDistance * direction * (currentStep + 1);
      const newY = rabbitPosition.y + jumpHeight;

      // Update position
      setRabbitJumpPosition({ x: newX, y: newY });

      // Reset Y position after jump
      setTimeout(() => {
        setRabbitJumpPosition({ x: newX, y: rabbitPosition.y });
        currentStep++;

        // Next jump
        setTimeout(performJump, 200);
      }, jumpDuration);
    };

    performJump();
  };

  // Create fireworks around the rabbit
  const createFireworks = () => {
    const newFireworks = [];
    const centerX = rabbitPosition.x + 24; // Center of rabbit
    const centerY = rabbitPosition.y + 14; // Center of rabbit

    // Create a single firework near the rabbit
    newFireworks.push({
      id: "firework-main",
      x: centerX + 20, // Slightly to the right of rabbit
      y: centerY - 10, // Slightly above rabbit
      size: 24,
      direction: 0,
    });

    setFireworks(newFireworks);
  };

  // Handle rabbit click to pause/resume with debounce
  const handleRabbitClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isClickDisabled) return;

    setIsClickDisabled(true);
    setIsPaused((prev) => !prev);

    // Re-enable clicking after 500ms
    setTimeout(() => {
      setIsClickDisabled(false);
    }, 500);
  };

  // 获取瓷砖颜色 - 使用固定的颜色级别
  const getTileColor = (intensity: number) => {
    if (intensity < 0.05) {
      return "#f3f1f9"; // 稍微深一点的浅紫灰色
    }

    // 参考GitHub贡献图，使用4个固定的颜色级别
    if (intensity < 0.25) {
      return "#e1d5f7"; // 最浅紫色
    } else if (intensity < 0.5) {
      return "#c4b5ed"; // 浅紫色
    } else if (intensity < 0.75) {
      return "#9f7aea"; // 中等紫色
    } else {
      return "#6747ce"; // 深紫色 (主题色)
    }
  };

  return (
    <section className="pt-12 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          viewport={{ once: true }}
          className="transition-all duration-300 group"
        >
          {/* 马赛克瓷砖背景 */}
          <div className="w-full flex justify-center">
            <div
              className="relative"
              style={{
                width: "840px", // 60 cols * (12px + 2px) = 840px
                height: "168px", // 12 rows * (12px + 2px) = 168px
                maxWidth: "100%",
                opacity: 0.68, // Mosaic background opacity
              }}
            >
              {tiles.map((tile, index) => {
                const color = getTileColor(tile.intensity);

                return (
                  <motion.div
                    key={tile.id}
                    className="absolute cursor-pointer group/tile"
                    style={{
                      left: `${tile.x}px`,
                      top: `${tile.y}px`,
                      width: `${tile.width}px`,
                      height: `${tile.height}px`,
                      backgroundColor: color,
                      borderRadius: "2px",
                      border: "none",
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: tile.eaten ? 0 : 1,
                      scale: tile.eaten ? 0 : 1,
                    }}
                    transition={{
                      duration: tile.eaten ? 0.2 : 0.15,
                      delay: tile.eaten ? 0 : index * 0.002,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: tile.eaten ? 0 : 1.1,
                      zIndex: 10,
                    }}
                  >
                    {/* 悬停提示 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tile:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      <div className="font-medium">{tile.size} tile</div>
                      <div className="text-gray-300">
                        Intensity: {Math.round(tile.intensity * 100)}%
                      </div>
                      {/* 小三角箭头 */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </motion.div>
                );
              })}

              {/* 兔子动画 */}
              {isRabbitActive && (
                <motion.div
                  className="absolute z-50 cursor-pointer select-none"
                  onClick={(e) => handleRabbitClick(e)}
                  style={{
                    padding: "12px", // Larger click area
                    borderRadius: "50%",
                    opacity: 1, // Rabbit has 100% opacity
                    zIndex: 100, // Much higher z-index
                    pointerEvents: "auto", // Ensure pointer events work
                  }}
                  animate={{
                    x: isJumping ? rabbitJumpPosition.x : rabbitPosition.x,
                    y: isJumping ? rabbitJumpPosition.y : rabbitPosition.y,
                    scaleX: rabbitDirection === "right-to-left" ? -1 : 1, // Flip rabbit when going right to left
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.2,
                  }}
                >
                  <motion.div
                    animate={
                      isPaused
                        ? {
                            // Paused animation - gentle breathing effect
                            scale: [1, 1.05, 1],
                          }
                        : isCelebrating
                          ? {
                              // Celebration jumping animation
                              y: [0, -15, 0, -15, 0, -15, 0],
                              scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
                            }
                          : {
                              // No jumping - completely smooth movement
                              scale: 1,
                            }
                    }
                    transition={{
                      duration: isPaused ? 1.5 : isCelebrating ? 2.5 : 0,
                      ease: "easeInOut",
                      repeat: isPaused ? Infinity : isCelebrating ? 0 : 0,
                    }}
                  >
                    <Rabbit
                      size={28}
                      className="text-[var(--primary-dark)] drop-shadow-sm"
                      fill="white"
                      stroke="currentColor"
                      strokeWidth={1}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* 烟花动画 */}
              {fireworks.map((firework) => (
                <motion.div
                  key={firework.id}
                  className="absolute z-40"
                  style={{
                    left: firework.x,
                    top: firework.y,
                    zIndex: 40,
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0,
                    rotate: 0,
                  }}
                  animate={{
                    scale: [0, 1.3, 1, 0.8],
                    opacity: [0, 1, 0.8, 0],
                    rotate: [0, 180, 360],
                    y: [0, -15, -25],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeOut",
                    delay: 0,
                  }}
                >
                  <PartyPopper
                    size={firework.size}
                    className="text-[var(--primary)] drop-shadow-lg"
                    fill="currentColor"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
