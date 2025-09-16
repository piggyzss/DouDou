'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Filter } from 'lucide-react'
import { useState } from 'react'

interface FilterBarProps {
  onFilter: (type: string) => void
  selectedType: string
}

function FilterBar({ onFilter, selectedType }: FilterBarProps) {
  const [isHovered, setIsHovered] = useState(false)

  const typeOptions = [
    { value: 'all', label: '全部' },
    { value: 'app', label: '应用' },
    { value: 'miniprogram', label: '小程序' },
    { value: 'game', label: '游戏' }
  ]

  const handleTypeChange = (type: string) => {
    onFilter(type)
    setIsHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <Filter size={16} className="text-text-secondary" />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-5 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-[100px]"
          >
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value)}
                className={`w-full px-3 py-2 text-left text-sm font-blog transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedType === option.value
                    ? 'text-primary bg-primary/10'
                    : 'text-text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FilterBar
