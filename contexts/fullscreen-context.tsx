"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface FullscreenContextType {
  isFullscreen: boolean
  toggleFullscreen: () => void
}

const FullscreenContext = createContext<FullscreenContextType>({
  isFullscreen: false,
  toggleFullscreen: () => {},
})

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("starTrekFullscreen")
    if (savedPreference) {
      setIsFullscreen(savedPreference === "true")
    }
  }, [])

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("starTrekFullscreen", isFullscreen.toString())
  }, [isFullscreen])

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  return <FullscreenContext.Provider value={{ isFullscreen, toggleFullscreen }}>{children}</FullscreenContext.Provider>
}

export const useFullscreen = () => useContext(FullscreenContext)
