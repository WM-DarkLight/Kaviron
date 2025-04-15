"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Scene } from "@/lib/types"

interface SceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function SceneDisplay({ scene, onSceneDisplayed }: SceneDisplayProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Reset when scene changes
  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
    setIsComplete(false)
    setIsTyping(true)
  }, [scene])

  // Typing effect
  useEffect(() => {
    if (!isTyping || currentIndex >= scene.text.length) {
      if (currentIndex >= scene.text.length) {
        setIsComplete(true)
        setIsTyping(false)
        if (onSceneDisplayed) {
          onSceneDisplayed()
        }
      }
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + scene.text[currentIndex])
      setCurrentIndex((prev) => prev + 1)
    }, 30) // Adjust speed as needed

    return () => clearTimeout(timer)
  }, [isTyping, currentIndex, scene.text, onSceneDisplayed])

  // Handle skip
  const handleSkip = () => {
    if (isComplete) return
    setDisplayedText(scene.text)
    setCurrentIndex(scene.text.length)
    setIsTyping(false)
    setIsComplete(true)
    if (onSceneDisplayed) {
      onSceneDisplayed()
    }
  }

  // Format text with paragraph breaks
  const formattedText = displayedText.split("\n").map((paragraph, index) => (
    <p key={index} className="mb-2">
      {paragraph}
    </p>
  ))

  return (
    <div className="relative h-full">
      {/* LCARS decorative top bar */}
      <div className="flex w-full mb-2">
        <div className="h-2 w-16 bg-[#ff9900] rounded-l-full"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 flex-grow bg-[#99ccff]"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 w-16 bg-[#ff9900] rounded-r-full"></div>
      </div>

      <ScrollArea className="h-[calc(100%-40px)] pr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white lcars-text text-lg"
          >
            {formattedText}
            {/* Blinking cursor */}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-[#ff9900] ml-1"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Skip button */}
      {!isComplete && (
        <motion.button
          onClick={handleSkip}
          className="absolute bottom-2 right-2 text-[#99ccff] text-sm hover:text-[#ff9900] focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          [SKIP]
        </motion.button>
      )}

      {/* LCARS decorative bottom bar */}
      <div className="flex w-full mt-2">
        <div className="h-2 w-12 bg-[#ff9900] rounded-l-full"></div>
        <div className="h-2 flex-grow bg-[#99ccff]"></div>
        <div className="h-2 w-12 bg-[#ff9900] rounded-r-full"></div>
      </div>
    </div>
  )
}
