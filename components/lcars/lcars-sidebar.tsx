"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LcarsButton } from "./lcars-button"
import { Home, Rocket, Users, Briefcase, Database, Settings, Shield, Activity, Zap, Radio, Cpu } from "lucide-react"
import { getAvailableModules } from "@/lib/modules/module-registry"
import { useEffect, useState } from "react"
import type { GameModule } from "@/lib/types"

interface LcarsSidebarProps {
  isOpen: boolean
  activeModule: string | null
  onModuleSelect: (moduleId: string | null) => void
  requiredModules: string[]
}

export function LcarsSidebar({ isOpen, activeModule, onModuleSelect, requiredModules }: LcarsSidebarProps) {
  const [modules, setModules] = useState<Record<string, GameModule>>({})

  useEffect(() => {
    const availableModules = getAvailableModules()
    const filteredModules: Record<string, GameModule> = {}

    requiredModules.forEach((moduleId) => {
      if (availableModules[moduleId]) {
        filteredModules[moduleId] = availableModules[moduleId]
      }
    })

    setModules(filteredModules)
  }, [requiredModules])

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case "ship":
        return <Rocket className="h-5 w-5" />
      case "crew":
        return <Users className="h-5 w-5" />
      case "inventory":
        return <Briefcase className="h-5 w-5" />
      case "mission":
        return <Activity className="h-5 w-5" />
      case "registry":
        return <Database className="h-5 w-5" />
      case "tactical":
        return <Shield className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const getModuleColor = (moduleId: string) => {
    switch (moduleId) {
      case "ship":
        return "blue"
      case "crew":
        return "purple"
      case "inventory":
        return "yellow"
      case "mission":
        return "red"
      case "registry":
        return "green"
      case "tactical":
        return "orange"
      default:
        return "orange"
    }
  }

  const sidebarVariants = {
    open: { width: "240px", opacity: 1 },
    closed: { width: "0px", opacity: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bg-black overflow-hidden border-r border-[#f90]"
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full py-2 px-2 space-y-2">
            {/* Top section with decorative elements */}
            <div className="flex space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#f90] rounded-tl-2xl rounded-bl-2xl"></div>
              <div className="flex flex-col space-y-1 flex-1">
                <div className="h-4 bg-blue-500 rounded-tr-full"></div>
                <div className="h-4 bg-purple-500"></div>
              </div>
            </div>

            {/* Main view button with animation */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <LcarsButton
                color="orange"
                onClick={() => onModuleSelect(null)}
                isActive={activeModule === null}
                className="mb-4"
                fullWidth
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="lcars-text">MAIN VIEW</span>
              </LcarsButton>
            </motion.div>

            {/* Decorative element */}
            <div className="flex space-x-1 my-2">
              <motion.div
                className="h-2 w-1/3 bg-blue-500 rounded-l-full"
                animate={{ width: ["33%", "50%", "33%"] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="h-2 w-1/3 bg-purple-500"
                animate={{ width: ["33%", "20%", "33%"] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="h-2 w-1/3 bg-green-500 rounded-r-full"
                animate={{ width: ["33%", "30%", "33%"] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {Object.entries(modules).map(([moduleId, module]) => (
                <motion.div key={moduleId} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <LcarsButton
                    color={getModuleColor(moduleId)}
                    onClick={() => onModuleSelect(moduleId)}
                    isActive={activeModule === moduleId}
                    fullWidth
                  >
                    {getModuleIcon(moduleId)}
                    <span className="ml-2 lcars-text uppercase">{module.name}</span>
                  </LcarsButton>
                </motion.div>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="flex space-x-2 my-2">
              <div className="w-16 h-4 bg-[#f90] rounded-l-full"></div>
              <div className="w-8 h-4 bg-blue-500"></div>
              <div className="flex-1 h-4 bg-purple-500 rounded-r-full"></div>
            </div>

            {/* Decorative icons */}
            <div className="flex justify-around mb-2">
              <motion.div
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
              >
                <Zap className="h-4 w-4 text-black" />
              </motion.div>
              <motion.div
                className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
              >
                <Radio className="h-4 w-4 text-black" />
              </motion.div>
              <motion.div
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
              >
                <Cpu className="h-4 w-4 text-black" />
              </motion.div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-2 px-2 lcars-text">LCARS ACCESS</div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <LcarsButton color="beige" onClick={() => {}} fullWidth>
                  <Settings className="h-5 w-5 mr-2" />
                  <span className="lcars-text">SETTINGS</span>
                </LcarsButton>
              </motion.div>
            </div>

            {/* Bottom decorative elements */}
            <div className="flex space-x-2 mt-2">
              <div className="w-12 h-12 bg-[#f90] rounded-tr-2xl rounded-br-2xl"></div>
              <div className="flex flex-col space-y-2 flex-1">
                <div className="h-5 bg-blue-500"></div>
                <div className="h-5 bg-purple-500 rounded-bl-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
