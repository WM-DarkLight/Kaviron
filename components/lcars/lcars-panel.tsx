"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface LcarsPanelProps {
  children: React.ReactNode
}

export function LcarsPanel({ children }: LcarsPanelProps) {
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const [isAnimating, setIsAnimating] = useState(false)
  const [key, setKey] = useState<string>("initial")

  useEffect(() => {
    if (children !== displayedChildren && !isAnimating) {
      setIsAnimating(true)
      // Generate a new key to force re-render
      setKey(Math.random().toString(36).substring(2, 9))
    }
  }, [children, displayedChildren, isAnimating])

  const handleAnimationComplete = () => {
    if (isAnimating) {
      setDisplayedChildren(children)
      setIsAnimating(false)
    }
  }

  return (
    <div className="flex-1 bg-black overflow-hidden relative">
      {/* Enhanced top decorative bar */}
      <div className="flex w-full">
        <div className="h-3 w-24 bg-[#ff9900] rounded-tl-full"></div>
        <div className="h-3 w-12 bg-[#cc99cc]"></div>
        <div className="h-3 flex-grow bg-[#99ccff]"></div>
        <div className="h-3 w-12 bg-[#cc99cc]"></div>
        <div className="h-3 w-24 bg-[#ff9900] rounded-tr-full"></div>
      </div>

      {/* Left vertical bar with decorative elements */}
      <div className="absolute left-0 top-3 bottom-3 w-2 bg-[#ff9900]"></div>
      <div className="absolute left-3 top-8 w-4 h-4 bg-[#cc99cc] rounded-full"></div>
      <div className="absolute left-3 top-16 w-4 h-4 bg-[#99ccff] rounded-full"></div>
      <div className="absolute left-3 bottom-16 w-4 h-4 bg-[#cc99cc] rounded-full"></div>
      <div className="absolute left-3 bottom-8 w-4 h-4 bg-[#99ccff] rounded-full"></div>

      {/* Right vertical bar with decorative elements */}
      <div className="absolute right-0 top-3 bottom-3 w-2 bg-[#ff9900]"></div>
      <div className="absolute right-3 top-8 w-4 h-4 bg-[#cc99cc] rounded-full"></div>
      <div className="absolute right-3 top-16 w-4 h-4 bg-[#99ccff] rounded-full"></div>
      <div className="absolute right-3 bottom-16 w-4 h-4 bg-[#cc99cc] rounded-full"></div>
      <div className="absolute right-3 bottom-8 w-4 h-4 bg-[#99ccff] rounded-full"></div>

      {/* Content area with scanning effect */}
      <div className="mx-2 h-[calc(100%-24px)] relative lcars-scanning">
        <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
          <motion.div
            key={key}
            className="h-full overflow-y-auto px-6 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isAnimating ? displayedChildren : children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced bottom decorative bar */}
      <div className="flex w-full absolute bottom-0">
        <div className="h-3 w-24 bg-[#ff9900] rounded-bl-full"></div>
        <div className="h-3 w-12 bg-[#cc99cc]"></div>
        <div className="h-3 flex-grow bg-[#99ccff]"></div>
        <div className="h-3 w-12 bg-[#cc99cc]"></div>
        <div className="h-3 w-24 bg-[#ff9900] rounded-br-full"></div>
      </div>
    </div>
  )
}
