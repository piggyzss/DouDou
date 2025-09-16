'use client'

import { motion } from 'framer-motion'
import { Code, Smartphone, Gamepad2, Grid3X3 } from 'lucide-react'

interface FilterBarProps {
  onFilter: (type: string) => void
  selectedType: string
}

function FilterBar({ onFilter, selectedType }: FilterBarProps) {
  const typeOptions = [
    { value: 'all', label: '全部', icon: Grid3X3 },
    { value: 'app', label: '应用', icon: Code },
    { value: 'miniprogram', label: '小程序', icon: Smartphone },
    { value: 'game', label: '游戏', icon: Gamepad2 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex space-x-4"
    >
      {typeOptions.map((option) => {
        const Icon = option.icon
        return (
          <motion.button
            key={option.value}
            onClick={() => onFilter(option.value)}
            className={`p-2 rounded-full transition-all duration-300 ${
              selectedType === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-text-secondary hover:text-text-primary'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            title={option.label}
          >
            <Icon size={20} />
          </motion.button>
        )
      })}
    </motion.div>
  )
}

export default FilterBar
