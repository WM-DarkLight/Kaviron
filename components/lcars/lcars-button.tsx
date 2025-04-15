"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LcarsButtonProps {
  children: React.ReactNode
  color?: "orange" | "blue" | "purple" | "yellow" | "red" | "green" | "beige"
  onClick: () => void
  isActive?: boolean
  className?: string
  fullWidth?: boolean
  size?: "sm" | "md" | "lg"
  leftCap?: boolean
  rightCap?: boolean
}

export function LcarsButton({
  children,
  color = "orange",
  onClick,
  isActive = false,
  className,
  fullWidth = false,
  size = "md",
  leftCap = true,
  rightCap = true,
}: LcarsButtonProps) {
  const colorClasses = {
    orange: "bg-[#f90] hover:bg-[#ffb84d] text-black",
    blue: "bg-blue-500 hover:bg-blue-400 text-white",
    purple: "bg-purple-500 hover:bg-purple-400 text-white",
    yellow: "bg-yellow-500 hover:bg-yellow-400 text-black",
    red: "bg-red-500 hover:bg-red-400 text-white",
    green: "bg-green-500 hover:bg-green-400 text-white",
    beige: "bg-[#f7cf94] hover:bg-[#f9ddb4] text-black",
  }

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  }

  const capClasses = `${leftCap ? "rounded-l-full" : ""} ${rightCap ? "rounded-r-full" : ""}`

  return (
    <motion.button
      className={cn(
        "lcars-button flex items-center px-4 font-medium transition-colors",
        colorClasses[color],
        sizeClasses[size],
        capClasses,
        fullWidth ? "w-full justify-center" : "justify-between",
        isActive ? "ring-2 ring-white" : "",
        className,
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}
