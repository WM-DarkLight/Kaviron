"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ThemedSceneDisplay } from "@/components/themed-scene-display"
import { ThemedChoiceButtons } from "@/components/themed-choice-buttons"
import { FullscreenToggle } from "@/components/fullscreen-toggle"
import type { Scene, Choice } from "@/lib/types"

interface FullscreenDisplayProps {
  scene: Scene
  choices: Choice[]
  onSceneDisplayed: () => void
  onChoiceSelected: (choice: Choice) => void
  disabled: boolean
}

export function FullscreenDisplay({
  scene,
  choices,
  onSceneDisplayed,
  onChoiceSelected,
  disabled,
}: FullscreenDisplayProps) {
  const [showToggle, setShowToggle] = useState(false)

  // Show toggle on mouse movement, hide after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowToggle(true)
      resetTimer()
    }

    let timer: NodeJS.Timeout
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setShowToggle(false), 3000)
    }

    window.addEventListener("mousemove", handleMouseMove)
    resetTimer()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-center items-center p-8 z-50">
      <AnimatePresence>
        {showToggle && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4"
          >
            <FullscreenToggle />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex-grow overflow-hidden">
          <ThemedSceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
        </div>
        <div className="mt-8">
          <ThemedChoiceButtons choices={choices} onChoiceSelected={onChoiceSelected} disabled={disabled} />
        </div>
      </div>
    </div>
  )
}
