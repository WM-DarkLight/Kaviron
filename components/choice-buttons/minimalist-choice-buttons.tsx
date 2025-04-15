"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import type { Choice } from "@/lib/types"

interface MinimalistChoiceButtonsProps {
  choices: Choice[]
  onChoiceSelected: (choice: Choice) => void
  disabled?: boolean
}

export function MinimalistChoiceButtons({ choices, onChoiceSelected, disabled = false }: MinimalistChoiceButtonsProps) {
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
            "bg-gray-100 text-gray-900 border border-gray-300",
            "hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
            focusedIndex === index && "bg-gray-200 ring-2 ring-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-pressed={focusedIndex === index}
        >
          <div className="flex items-center">
            <span>
              {index + 1}. {choice.text}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
