"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"

interface GameAlertProps {
  type: "info" | "warning" | "danger" | "success"
  message: string
  onDismiss: () => void
}

export function GameAlert({ type, message, onDismiss }: GameAlertProps) {
  const alertStyles = {
    info: {
      bg: "bg-[#99ccff]/80",
      border: "border-[#99ccff]",
      icon: <Info className="h-5 w-5 text-[#99ccff]" />,
      progressColor: "bg-[#99ccff]",
    },
    warning: {
      bg: "bg-[#ffcc00]/80",
      border: "border-[#ffcc00]",
      icon: <AlertCircle className="h-5 w-5 text-[#ffcc00]" />,
      progressColor: "bg-[#ffcc00]",
    },
    danger: {
      bg: "bg-[#cc6666]/80",
      border: "border-[#cc6666]",
      icon: <AlertCircle className="h-5 w-5 text-[#cc6666]" />,
      progressColor: "bg-[#cc6666]",
    },
    success: {
      bg: "bg-[#66cc66]/80",
      border: "border-[#66cc66]",
      icon: <CheckCircle className="h-5 w-5 text-[#66cc66]" />,
      progressColor: "bg-[#66cc66]",
    },
  }

  const style = alertStyles[type]

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 z-50 max-w-md ${style.bg} ${style.border} border-l-4 rounded-md shadow-lg`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
      >
        {/* LCARS decorative top bar */}
        <div className="flex w-full">
          <div className="h-1 w-16 bg-[#ff9900] rounded-tl-md"></div>
          <div className="h-1 flex-grow bg-[#cc99cc]"></div>
          <div className="h-1 w-16 bg-[#ff9900] rounded-tr-md"></div>
        </div>

        <div className="flex items-center p-4">
          <div className="flex-shrink-0 mr-3">{style.icon}</div>
          <div className="flex-1 text-white lcars-text">{message}</div>
          <motion.button
            onClick={onDismiss}
            className="ml-4 text-gray-200 hover:text-white focus:outline-none"
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Animated progress bar for auto-dismiss */}
        <motion.div
          className={`h-2 ${style.progressColor}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
        />

        {/* LCARS decorative bottom bar */}
        <div className="flex w-full">
          <div className="h-1 w-16 bg-[#ff9900] rounded-bl-md"></div>
          <div className="h-1 flex-grow bg-[#cc99cc]"></div>
          <div className="h-1 w-16 bg-[#ff9900] rounded-br-md"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
