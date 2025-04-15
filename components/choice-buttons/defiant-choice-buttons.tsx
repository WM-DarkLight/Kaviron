"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import type { Choice } from "@/lib/types"

interface DefiantChoiceButtonsProps {
  choices: Choice[]
  onChoiceSelected: (choice: Choice) => void
  disabled?: boolean
}

export function DefiantChoiceButtons({ choices, onChoiceSelected, disabled = false }: DefiantChoiceButtonsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, choices.length)
  }, [choices])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        setFocusedIndex((prev) => {
          const newIndex = prev !== null ? Math.max(0, prev - 1) : choices.length - 1
          buttonRefs.current[newIndex]?.focus()
          return newIndex
        })
        break
      case "ArrowDown":
        e.preventDefault()
        setFocusedIndex((prev) => {
          const newIndex = prev !== null ? Math.min(choices.length - 1, prev + 1) : 0
          buttonRefs.current[newIndex]?.focus()
          return newIndex
        })
        break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!disabled) {
          onChoiceSelected(choices[index])
        }
        break
    }
  }

  return (
    <div className="flex flex-col space-y-2 w-full max-w-2xl mx-auto mt-4">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          ref={(el) => (buttonRefs.current[index] = el)}
          onClick={() => !disabled && onChoiceSelected(choice)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={cn(
            "text-left px-4 py-3 rounded-md transition-colors",
            "bg-red-900 text-white border-l-4 border-red-500",
            "hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50",
            focusedIndex === index && "bg-red-800 ring-2 ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-pressed={focusedIndex === index}
        >
          <div className="flex items-center">
            <div className="mr-2 w-2 h-2 rounded-full bg-red-500"></div>
            <span>{choice.text}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
