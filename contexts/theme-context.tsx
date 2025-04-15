"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type ThemeType = "lcars" | "minimalist" | "enterprise" | "voyager" | "defiant"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "lcars",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("lcars")

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("starTrekTheme") as ThemeType
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("starTrekTheme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
