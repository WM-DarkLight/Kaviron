"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Save, RotateCcw, Home, HelpCircle, Volume2, VolumeX } from "lucide-react"

interface GameControlsProps {
  onSave: () => void
  onReset: () => void
  onHelp: () => void
  onExit: () => void
  isSaving?: boolean
}

export function GameControls({ onSave, onReset, onHelp, onExit, isSaving = false }: GameControlsProps) {
  const [isMuted, setIsMuted] = useState(false)

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    // Add actual mute functionality here
  }

  return (
    <div className="bg-black p-2 border-t border-[#ff9900]">
      {/* LCARS decorative top bar */}
      <div className="flex w-full mb-2">
        <div className="h-1 w-12 bg-[#cc99cc] rounded-l-full"></div>
        <div className="h-1 flex-grow bg-[#99ccff]"></div>
        <div className="h-1 w-12 bg-[#cc99cc] rounded-r-full"></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#cc99cc] border-[#cc99cc] text-black hover:bg-[#d8b2d8] hover:text-black lcars-button"
              onClick={onHelp}
            >
              <HelpCircle className="mr-1 h-4 w-4" />
              HELP
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#99ccff] border-[#99ccff] text-black hover:bg-[#c6e2ff] hover:text-black lcars-button"
              onClick={handleToggleMute}
            >
              {isMuted ? <VolumeX className="mr-1 h-4 w-4" /> : <Volume2 className="mr-1 h-4 w-4" />}
              {isMuted ? "UNMUTE" : "MUTE"}
            </Button>
          </motion.div>
        </div>

        <div className="flex space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#ffcc00] border-[#ffcc00] text-black hover:bg-[#ffdd55] hover:text-black lcars-button"
              onClick={onReset}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              RESET
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#66cc66] border-[#66cc66] text-black hover:bg-[#88ff88] hover:text-black lcars-button"
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="mr-1 h-4 w-4" />
              {isSaving ? "SAVING..." : "SAVE"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#cc6666] border-[#cc6666] text-white hover:bg-[#ff5555] hover:text-white lcars-button"
              onClick={onExit}
            >
              <Home className="mr-1 h-4 w-4" />
              EXIT
            </Button>
          </motion.div>
        </div>
      </div>

      {/* LCARS decorative bottom bar */}
      <div className="flex w-full mt-2">
        <div className="h-1 w-16 bg-[#ff9900] rounded-l-full"></div>
        <div className="h-1 flex-grow bg-[#cc99cc]"></div>
        <div className="h-1 w-16 bg-[#ff9900] rounded-r-full"></div>
      </div>
    </div>
  )
}
