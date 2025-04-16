"use client"

import { Menu, Database, Activity, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { FullscreenToggle } from "@/components/fullscreen-toggle"

interface LcarsHeaderProps {
  title: string
  stardate: string
  shipName: string
  alertLevel: "normal" | "yellow" | "red"
  onToggleSidebar: () => void
}

export function LcarsHeader({ title, stardate, shipName, alertLevel, onToggleSidebar }: LcarsHeaderProps) {
  const alertColor = alertLevel === "red" ? "bg-red-500" : alertLevel === "yellow" ? "bg-amber-500" : "bg-[#f90]"

  return (
    <header className="bg-black text-white p-2 relative">
      <div className="flex items-center">
        {/* Left elbow with more decorative elements */}
        <div className="flex flex-col">
          <motion.div
            className={`w-14 h-12 ${alertColor} rounded-tl-3xl mr-3 flex items-center justify-center cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
          >
            <Menu className="h-6 w-6 text-black" />
          </motion.div>
          <div className="flex">
            <div className={`w-6 h-6 ${alertColor} rounded-bl-3xl`}></div>
            <div className={`w-8 h-6 ${alertColor}`}></div>
          </div>
        </div>

        {/* Header content with more decorative elements */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-3">
                <h1 className="text-xl font-bold text-[#f90] lcars-title">{title}</h1>
                <div className="flex space-x-2">
                  <motion.div
                    className="h-1.5 w-10 bg-[#f90] rounded-full"
                    animate={{ width: [10, 40, 10] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="h-1.5 w-6 bg-blue-500 rounded-full"
                    animate={{ width: [6, 24, 6] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                  />
                  <motion.div
                    className="h-1.5 w-8 bg-purple-500 rounded-full"
                    animate={{ width: [8, 32, 8] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, ease: "easeInOut", delay: 1 }}
                  />
                </div>
              </div>

              {/* Decorative icons */}
              <div className="flex space-x-2">
                <motion.div
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Database className="h-4 w-4 text-black" />
                </motion.div>
                <motion.div
                  className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Activity className="h-4 w-4 text-black" />
                </motion.div>
                <motion.div
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Shield className="h-4 w-4 text-black" />
                </motion.div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <div className="ml-2">
                <FullscreenToggle />
              </div>
              <div className="flex space-x-4">
                <div className="text-right bg-black border border-[#f90] px-3 py-1 rounded-lg">
                  <div className="text-xs text-gray-400">STARDATE</div>
                  <div className="text-[#f90] font-mono text-sm lcars-readout">{stardate}</div>
                </div>
                <div className="text-right bg-black border border-[#f90] px-3 py-1 rounded-lg">
                  <div className="text-xs text-gray-400">VESSEL</div>
                  <div className="text-[#f90] font-mono text-sm lcars-readout">{shipName}</div>
                </div>

                {alertLevel !== "normal" && (
                  <motion.div
                    className={`text-right px-3 py-1 rounded-lg border ${alertLevel === "red" ? "border-red-500" : "border-amber-500"}`}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  >
                    <div className="text-sm text-gray-400">ALERT</div>
                    <div
                      className={`font-mono lcars-readout ${alertLevel === "red" ? "text-red-500" : "text-amber-500"}`}
                    >
                      {alertLevel.toUpperCase()} ALERT
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar with more vibrant colors */}
          <div className="flex mt-2">
            <div className={`h-4 w-32 ${alertColor} rounded-l-full`}></div>
            <div className="h-4 w-16 bg-blue-500 ml-2"></div>
            <div className="h-4 w-24 bg-purple-500 ml-2"></div>
            <div className="h-4 w-20 bg-green-500 ml-2"></div>
            <motion.div
              className="h-4 flex-grow bg-[#f90] ml-2 rounded-r-full"
              animate={{
                backgroundColor: ["#ff9900", "#ffb84d", "#ff9900"],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </div>
      </div>

      {/* Alert bar with enhanced animation */}
      {alertLevel !== "normal" && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 ${alertLevel === "red" ? "bg-red-500" : "bg-amber-500"}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
        />
      )}
    </header>
  )
}
