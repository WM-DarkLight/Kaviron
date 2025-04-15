"use client"

import { useState } from "react"
import { useTheme, type ThemeType } from "@/contexts/theme-context"

interface ThemeOption {
  id: ThemeType
  name: string
  description: string
  color: string
}

const themeOptions: ThemeOption[] = [
  {
    id: "lcars",
    name: "LCARS",
    description: "Classic LCARS interface with animations",
    color: "#ff9900",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean interface without animations",
    color: "#ffffff",
  },
  {
    id: "enterprise",
    name: "Enterprise-D",
    description: "TNG era interface with blue accents",
    color: "#99ccff",
  },
  {
    id: "voyager",
    name: "Voyager",
    description: "Voyager era interface with purple accents",
    color: "#cc99cc",
  },
  {
    id: "defiant",
    name: "Defiant",
    description: "DS9 era interface with red accents",
    color: "#cc0000",
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-black border border-gray-700 hover:border-white"
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: themeOptions.find((t) => t.id === theme)?.color }}
        />
        <span>Theme: {themeOptions.find((t) => t.id === theme)?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-black border border-gray-700 rounded-md shadow-lg z-50">
          <div className="p-2">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left p-2 rounded-md flex items-center space-x-2 ${
                  theme === option.id ? "bg-gray-800" : "hover:bg-gray-900"
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: option.color }} />
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-400">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
