"use client"

import { motion } from "framer-motion"
import { AlertTriangle, MapPin, Clock, Activity } from "lucide-react"

interface LcarsStatusBarProps {
  stardate: string
  location: string
  alertLevel: "normal" | "yellow" | "red"
  scene: string
}

export function LcarsStatusBar({ stardate, location, alertLevel, scene }: LcarsStatusBarProps) {
  const alertColor = alertLevel === "red" ? "bg-[#cc6666]" : alertLevel === "yellow" ? "bg-[#ffcc00]" : "bg-[#66cc66]"
  const alertTextColor =
    alertLevel === "red" ? "text-[#cc6666]" : alertLevel === "yellow" ? "text-[#ffcc00]" : "text-[#66cc66]"

  return (
    <div className="flex items-center bg-black p-1 text-xs relative">
      {/* Left decorative element */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-[#ff9900] rounded-tl-full rounded-bl-full mr-1"></div>
        <div className="w-4 h-8 bg-[#cc99cc] mr-1"></div>
        <div className="w-2 h-8 bg-[#99ccff] mr-1"></div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex items-center space-x-1">
          <AlertTriangle className={`h-3 w-3 ${alertTextColor}`} />
          <motion.div
            className={`w-3 h-3 rounded-full ${alertColor}`}
            animate={{
              opacity: alertLevel !== "normal" ? [1, 0.5, 1] : 1,
              scale: alertLevel !== "normal" ? [1, 1.2, 1] : 1,
            }}
            transition={{
              repeat: alertLevel !== "normal" ? Number.POSITIVE_INFINITY : 0,
              duration: 1,
            }}
          />
          <span className="text-gray-400 lcars-text">STATUS:</span>
          <span className={`font-mono lcars-readout ${alertTextColor} font-bold`}>
            {alertLevel === "normal" ? "NORMAL" : `${alertLevel.toUpperCase()} ALERT`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-[#cc99cc]" />
          <span className="text-gray-400 lcars-text">LOCATION:</span>
          <span className="text-[#cc99cc] font-mono lcars-readout">{location}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-[#99ccff]" />
          <span className="text-gray-400 lcars-text">STARDATE:</span>
          <span className="text-[#99ccff] font-mono lcars-readout">{stardate}</span>
        </div>

        <div className="flex-1 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-[#ff9900]" />
          <span className="text-gray-400 lcars-text">CURRENT:</span>
          <span className="text-[#ff9900] font-mono lcars-readout truncate">{scene}</span>
        </div>
      </div>

      {/* Right animated elements */}
      <div className="flex space-x-1 mr-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-3 w-8 ${i === 1 ? "bg-[#cc99cc]" : i === 2 ? "bg-[#99ccff]" : "bg-[#ff9900]"} rounded-full`}
            animate={{ width: [8, 32, 8] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Right decorative element */}
      <div className="flex items-center">
        <div className="w-2 h-8 bg-[#99ccff] mr-1"></div>
        <div className="w-4 h-8 bg-[#cc99cc] mr-1"></div>
        <div className="w-8 h-8 bg-[#ff9900] rounded-tr-full rounded-br-full"></div>
      </div>

      {/* Alert bar */}
      {alertLevel !== "normal" && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 ${alertLevel === "red" ? "bg-[#cc6666]" : "bg-[#ffcc00]"}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
        />
      )}
    </div>
  )
}
