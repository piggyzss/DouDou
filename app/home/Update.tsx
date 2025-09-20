'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MosaicTile {
  id: string
  size: 'uniform'
  intensity: number
  x: number
  y: number
  width: number
  height: number
}

export default function Update() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 生成网格化马赛克瓷砖数据
  const generateMosaicTiles = (): MosaicTile[] => {
    // 简单的可复现伪随机数（Mulberry32）
    const mulberry32 = (a: number) => {
      return () => {
        let t = (a += 0x6D2B79F5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    const rng = mulberry32(20241220) // 固定种子确保一致性
    const tiles: MosaicTile[] = []

    // 网格配置
    const tileSize = 12 // 统一的瓷砖大小
    const gap = 2 // 瓷砖间距
    const cols = 60 // 列数
    const rows = 12 // 行数

    let id = 0

    // 生成网格化布局
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 网格位置
        const x = col * (tileSize + gap)
        const y = row * (tileSize + gap)

        // 创建自然的活跃度分布
        // 使用多个噪声层创建更自然的模式
        const baseNoise = rng()
        const clusterNoise = Math.sin(col * 0.1) * Math.cos(row * 0.15) * 0.3 + 0.5
        const randomNoise = rng() * 0.4

        // 组合不同的噪声创建自然分布
        let intensity = (baseNoise * 0.4 + clusterNoise * 0.4 + randomNoise * 0.2)

        // 创建一些完全空白的区域
        if (rng() < 0.3) {
          intensity = 0
        }

        // 创建一些高活跃度的聚集区域
        if (rng() < 0.1) {
          intensity = Math.min(intensity + 0.5, 1)
        }

        // 确保强度在合理范围内
        intensity = Math.max(0, Math.min(1, intensity))

        tiles.push({
          id: `tile-${id++}`,
          size: 'uniform',
          intensity,
          x,
          y,
          width: tileSize,
          height: tileSize
        })
      }
    }

    return tiles
  }

  const mosaicTiles = generateMosaicTiles()

  // 获取瓷砖颜色
  const getTileColor = (intensity: number) => {
    if (intensity < 0.1) {
      return '#ebedf0' // 很浅的灰色
    }

    // 使用主题色的不同透明度
    const alpha = 0.15 + (intensity * 0.85)
    return `rgba(103, 71, 206, ${alpha})`
  }



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
              className="relative group-hover:scale-[1.01] transition-transform duration-300"
              style={{
                width: '840px', // 60 cols * (12px + 2px) = 840px
                height: '168px', // 12 rows * (12px + 2px) = 168px
                maxWidth: '100%'
              }}
            >
              {mosaicTiles.map((tile, index) => {
                const color = getTileColor(tile.intensity)

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
                      borderRadius: '2px',
                      border: tile.intensity < 0.1 ? '1px solid #e5e7eb' : 'none'
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0.8
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.002,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.1,
                      zIndex: 10
                    }}
                  >
                    {/* 悬停提示 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tile:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      <div className="font-medium">
                        {tile.size} tile
                      </div>
                      <div className="text-gray-300">
                        Intensity: {Math.round(tile.intensity * 100)}%
                      </div>
                      {/* 小三角箭头 */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}