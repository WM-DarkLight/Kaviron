"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import type { Choice } from "@/lib/types"

interface ChoiceButtonsProps {
  choices: Choice[]
  onChoiceSelected: (choice: Choice) => void
  disabled?: boolean
}

export function ChoiceButtons({ choices, onChoiceSelected, disabled = false }: ChoiceButtonsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Get a color for each choice button
  const getChoiceColor = (index: number) => {
    const colors = [
      {
        bg: "bg-[#ff9900]",
        hover: "hover:bg-[#ffb84d]",
        text: "text-black",
        hoverText: "group-hover:text-black",
      },
      {
        bg: "bg-[#cc99cc]",
        hover: "hover:bg-[#d8b2d8]",
        text: "text-black",
        hoverText: "group-hover:text-black",
      },
      {
        bg: "bg-[#99ccff]",
        hover: "hover:bg-[#c6e2ff]",
        text: "text-black",
        hoverText: "group-hover:text-black",
      },
      {
        bg: "bg-[#ffcc00]",
        hover: "hover:bg-[#ffdd55]",
        text: "text-black",
        hoverText: "group-hover:text-black",
      },
    ]
    return colors[index % colors.length]
  }

  // Initialize button refs array when choices change
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, choices.length)
  }, [choices])

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (index < choices.length - 1) {
          setFocusedIndex(index + 1)
          buttonRefs.current[index + 1]?.focus()
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (index > 0) {
          setFocusedIndex(index - 1)
          buttonRefs.current[index - 1]?.focus()
        }
        break
      case "Enter":
      case " ": // Space key
        e.preventDefault()
        if (!disabled) {
          onChoiceSelected(choices[index])
        }
        break
      // Number keys 1-9 for quick selection
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        const numIndex = Number.parseInt(e.key) - 1
        if (numIndex >= 0 && numIndex < choices.length && !disabled) {
          e.preventDefault()
          onChoiceSelected(choices[numIndex])
        }
        break
      default:
        break
    }
  }

  // Add global keyboard shortcuts for number keys
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only handle number keys 1-9
      if (/^[1-9]$/.test(e.key) && !disabled) {
        const numIndex = Number.parseInt(e.key) - 1
        if (numIndex >= 0 && numIndex < choices.length) {
          e.preventDefault()
          onChoiceSelected(choices[numIndex])
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown)
    }
  }, [choices, disabled, onChoiceSelected])

  return (
    <div className="space-y-3 py-2" role="menu" aria-label="Available choices">
      {/* LCARS decorative top bar */}
      <div className="flex w-full">
        <div className="h-2 w-20 bg-[#ff9900] rounded-l-full"></div>
        <div className="h-2 flex-grow bg-[#cc99cc]"></div>
        <div className="h-2 w-20 bg-[#ff9900] rounded-r-full"></div>
      </div>

      <AnimatePresence>
        <div className="space-y-2">
          {choices.map((choice, index) => {
            const colorScheme = getChoiceColor(index)
            const isActive = hoveredIndex === index || focusedIndex === index

            return (
              <motion.button
                key={index}
                ref={(el) => (buttonRefs.current[index] = el)}
                className={`group w-full text-left relative overflow-hidden rounded-md transition-all 
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} 
                  ${isActive ? "border-white ring-2 ring-white/30" : "border-gray-700"}
                  border-2 hover:border-white focus:outline-none`}
                onClick={() => !disabled && onChoiceSelected(choice)}
                disabled={disabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="menuitem"
                tabIndex={0}
                aria-label={`Choice ${index + 1}: ${choice.text}`}
              >
                <div className="flex items-stretch">
                  {/* Left decorative element */}
                  <div className={`w-3 ${colorScheme.bg}`}></div>

                  {/* Content */}
                  <div className="flex-grow p-3 bg-black">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colorScheme.bg} mr-2 flex items-center justify-center`}>
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-white lcars-text">{choice.text}</span>
                    </div>
                  </div>

                  {/* Right decorative element */}
                  <div
                    className={`w-16 ${colorScheme.bg} ${colorScheme.hover} flex items-center justify-center transition-all`}
                  >
                    <span className={`font-mono text-xs ${colorScheme.text} ${colorScheme.hoverText}`}>
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Highlight effect when active (hovered or focused) */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </AnimatePresence>

      {/* Keyboard shortcuts help */}
      <div className="text-xs text-gray-400 mt-2 px-2">
        <p>
          Keyboard shortcuts: Arrow keys to navigate, Enter to select, or press 1-{Math.min(9, choices.length)} for
          quick selection
        </p>
      </div>

      {/* LCARS decorative bottom bar */}
      <div className="flex w-full">
        <div className="h-2 w-16 bg-[#ff9900] rounded-l-full"></div>
        <div className="h-2 flex-grow bg-[#cc99cc]"></div>
        <div className="h-2 w-16 bg-[#ff9900] rounded-r-full"></div>
      </div>
    </div>
  )
}
