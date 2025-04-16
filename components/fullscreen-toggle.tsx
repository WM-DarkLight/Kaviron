"use client"

import { Monitor, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"
import { useFullscreen } from "@/contexts/fullscreen-context"

export function FullscreenToggle() {
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  return (
    <motion.button
      onClick={toggleFullscreen}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff9900] text-black hover:bg-[#ffb84d] transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
      title={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
    >
      {isFullscreen ? (
        <>
          <Monitor className="w-4 h-4" />
          <span className="text-xs font-bold">NORMAL</span>
        </>
      ) : (
        <>
          <Maximize2 className="w-4 h-4" />
          <span className="text-xs font-bold">FULLSCREEN</span>
        </>
      )}
    </motion.button>
  )
}
