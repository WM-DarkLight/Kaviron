"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LcarsHeader } from "./lcars-header"
import { LcarsSidebar } from "./lcars-sidebar"
import { LcarsPanel } from "./lcars-panel"
import { LcarsFooter } from "./lcars-footer"
import { LcarsStatusBar } from "./lcars-status-bar"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Episode, GameState } from "@/lib/types"

interface LcarsLayoutProps {
  episode: Episode
  gameState: GameState
  currentSceneId: string
  children: React.ReactNode
  activeModule: string | null
  onModuleChange: (moduleId: string | null) => void
  onSave: () => void
  onExit: () => void
}

export function LcarsLayout({
  episode,
  gameState,
  currentSceneId,
  children,
  activeModule,
  onModuleChange,
  onSave,
  onExit,
}: LcarsLayoutProps) {
  const [alertLevel, setAlertLevel] = useState<"normal" | "yellow" | "red">("normal")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Update alert level based on game state
  useEffect(() => {
    if (gameState.flags.redAlert) {
      setAlertLevel("red")
    } else if (gameState.flags.yellowAlert) {
      setAlertLevel("yellow")
    } else {
      setAlertLevel("normal")
    }
  }, [gameState.flags.redAlert, gameState.flags.yellowAlert])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div
      className={`flex flex-col h-screen w-full transition-colors duration-500 ${
        alertLevel === "red" ? "bg-red-950" : alertLevel === "yellow" ? "bg-amber-950" : "bg-black"
      }`}
    >
      <LcarsHeader
        title={episode.title}
        stardate={episode.stardate}
        shipName={episode.shipName}
        alertLevel={alertLevel}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        <LcarsSidebar
          isOpen={sidebarOpen}
          activeModule={activeModule}
          onModuleSelect={onModuleChange}
          requiredModules={episode.requiredModules || []}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <LcarsStatusBar
            stardate={episode.stardate}
            location={gameState.moduleStates?.ship?.position?.sector || "Unknown"}
            alertLevel={alertLevel}
            scene={episode.scenes[currentSceneId]?.title || ""}
          />

          <LcarsPanel>{children}</LcarsPanel>
        </div>
      </div>

      <LcarsFooter onSave={onSave} onExit={onExit} />
    </div>
  )
}
