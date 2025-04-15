"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShipSystemUI } from "@/components/modules/ship-system-ui"
import { CrewSystemUI } from "@/components/modules/crew-system-ui"
import { InventorySystemUI } from "@/components/modules/inventory-system-ui"
import { MissionSystemUI } from "@/components/modules/mission-system-ui"
import { RegistrySystemUI } from "@/components/modules/registry-system-ui"
import type { ModuleType } from "@/lib/types"
import { motion } from "framer-motion"

// Update the component props interface to match what's being passed from GameEngine
interface ModulePanelProps {
  modules: Record<string, any>
  moduleStates: Record<string, any>
  onModuleAction: (moduleId: string, action: string, payload?: any) => void
}

export function ModulePanel({ modules, moduleStates, onModuleAction }: ModulePanelProps) {
  // Extract module IDs from the modules object
  const availableModules = Object.keys(modules) as ModuleType[]

  // Set default active tab safely, checking if availableModules exists and has items
  const [activeTab, setActiveTab] = useState<string>(
    availableModules && availableModules.length > 0 ? availableModules[0] : "",
  )

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Get color for each module tab
  const getModuleColor = (moduleType: string) => {
    const colors: Record<string, string> = {
      ship: "bg-[#ff9900] hover:bg-[#ffb84d] text-black data-[state=active]:bg-[#ffb84d]",
      crew: "bg-[#cc99cc] hover:bg-[#d8b2d8] text-black data-[state=active]:bg-[#d8b2d8]",
      inventory: "bg-[#99ccff] hover:bg-[#c6e2ff] text-black data-[state=active]:bg-[#c6e2ff]",
      mission: "bg-[#ffcc00] hover:bg-[#ffdd55] text-black data-[state=active]:bg-[#ffdd55]",
      registry: "bg-[#66cc66] hover:bg-[#88ff88] text-black data-[state=active]:bg-[#88ff88]",
    }
    return colors[moduleType] || "bg-gray-500 hover:bg-gray-400 text-black data-[state=active]:bg-gray-400"
  }

  // If no modules are available, show a message
  if (!availableModules || availableModules.length === 0) {
    return (
      <div className="bg-black border-l border-[#ff9900] h-full flex flex-col items-center justify-center p-4">
        <p className="text-[#ff9900] text-lg">No modules available</p>
      </div>
    )
  }

  // Create a dispatch function for each module
  const createDispatch = (moduleId: string) => (action: string, payload?: any) => {
    onModuleAction(moduleId, action, payload)
  }

  // Render the appropriate module UI based on the active tab
  const renderModuleUI = () => {
    const moduleId = activeTab
    const moduleState = moduleStates[moduleId]
    const dispatch = createDispatch(moduleId)

    switch (moduleId) {
      case "ship":
        return <ShipSystemUI state={moduleState} dispatch={dispatch} isActive={true} />
      case "crew":
        return <CrewSystemUI state={moduleState} dispatch={dispatch} isActive={true} />
      case "inventory":
        return <InventorySystemUI state={moduleState} dispatch={dispatch} isActive={true} />
      case "mission":
        return <MissionSystemUI state={moduleState} dispatch={dispatch} isActive={true} />
      case "registry":
        return <RegistrySystemUI state={moduleState} dispatch={dispatch} isActive={true} />
      default:
        return <div className="p-4 text-[#ff9900]">Module {moduleId} not found</div>
    }
  }

  return (
    <div className="bg-black border-l border-[#ff9900] h-full flex flex-col">
      {/* LCARS decorative top bar */}
      <div className="flex w-full">
        <div className="h-2 w-16 bg-[#ff9900] rounded-tl-full"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 flex-grow bg-[#99ccff]"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 w-16 bg-[#ff9900] rounded-tr-full"></div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col flex-grow"
        orientation="vertical"
      >
        <div className="flex border-b border-[#ff9900]">
          <div className="w-8 h-8 bg-[#ff9900] rounded-br-lg"></div>
          <TabsList className="bg-transparent h-12 p-0 flex space-x-1 ml-1">
            {availableModules.map((moduleType) => (
              <motion.div key={moduleType} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <TabsTrigger
                  value={moduleType}
                  className={`px-4 py-2 rounded-t-lg lcars-button ${getModuleColor(moduleType)}`}
                >
                  {moduleType.toUpperCase()}
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>
        </div>

        <div className="flex-grow overflow-hidden">
          {availableModules.map((moduleId) => (
            <TabsContent key={moduleId} value={moduleId} className="h-full m-0 p-0">
              {activeTab === moduleId && renderModuleUI()}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* LCARS decorative bottom bar */}
      <div className="flex w-full">
        <div className="h-2 w-16 bg-[#ff9900] rounded-bl-full"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 flex-grow bg-[#99ccff]"></div>
        <div className="h-2 w-8 bg-[#cc99cc]"></div>
        <div className="h-2 w-16 bg-[#ff9900] rounded-br-full"></div>
      </div>
    </div>
  )
}
