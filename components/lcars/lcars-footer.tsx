"use client"

import { motion } from "framer-motion"
import { Save, LogOut, Zap, Star, BarChart3 } from "lucide-react"

interface LcarsFooterProps {
  onSave: () => void
  onExit: () => void
}

export function LcarsFooter({ onSave, onExit }: LcarsFooterProps) {
  return (
    <footer className="bg-black text-white p-2 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Left side decorative elements with more vibrant colors */}
          <div className="flex flex-col">
            <div className="flex">
              <motion.div
                className="w-12 h-6 bg-[#f90] rounded-tl-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.div className="w-6 h-6 bg-[#f90]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
            </div>
            <div className="flex">
              <motion.div
                className="w-6 h-6 bg-[#f90] rounded-bl-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.div className="w-12 h-6 bg-[#f90]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
            </div>
          </div>

          {/* Decorative elements with vibrant colors */}
          <motion.div
            className="w-24 h-16 bg-blue-500 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: ["#3b82f6", "#8b5cf6", "#3b82f6"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Zap className="h-8 w-8 text-black" />
          </motion.div>

          <motion.div
            className="w-12 h-16 bg-purple-500 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="h-6 w-6 text-black" />
          </motion.div>

          <motion.div
            className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="h-6 w-6 text-black" />
          </motion.div>

          {/* Animated bars */}
          <div className="flex flex-col space-y-1">
            <motion.div
              className="h-2 w-24 bg-[#f90]"
              animate={{ width: [24, 96, 24] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut" }}
            />
            <motion.div
              className="h-2 w-32 bg-blue-500"
              animate={{ width: [32, 128, 32] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="h-2 w-16 bg-purple-500"
              animate={{ width: [16, 64, 16] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="h-2 w-20 bg-green-500"
              animate={{ width: [20, 80, 20] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <motion.button
            className="flex items-center justify-center w-24 h-10 bg-green-500 rounded-l-full text-white lcars-button"
            whileHover={{ scale: 1.05, backgroundColor: "#4ade80" }}
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
          >
            <Save className="h-4 w-4 mr-1" />
            <span className="lcars-text">SAVE</span>
          </motion.button>

          <motion.button
            className="flex items-center justify-center w-24 h-10 bg-red-500 rounded-r-full text-white lcars-button"
            whileHover={{ scale: 1.05, backgroundColor: "#f87171" }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="lcars-text">EXIT</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom decorative bar with more vibrant colors */}
      <div className="flex mt-2">
        <div className="h-3 w-16 bg-[#f90] rounded-l-full"></div>
        <div className="h-3 w-12 bg-blue-500 mx-1"></div>
        <div className="h-3 w-20 bg-purple-500 mx-1"></div>
        <div className="h-3 flex-grow bg-green-500 mx-1"></div>
        <div className="h-3 w-16 bg-[#f90] rounded-r-full"></div>
      </div>
    </footer>
  )
}
