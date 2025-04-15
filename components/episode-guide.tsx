"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ChevronDown, Download, Folder } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function EpisodeGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const handleExportTemplate = () => {
    const template = {
      id: "your-episode-id",
      title: "Your Episode Title",
      author: "Your Name",
      description: "A brief description of your episode.",
      stardate: "12345.6",
      shipName: "USS YourShip NCC-1234",
      scenes: {
        start: {
          id: "start",
          title: "Starting Location",
          text: [
            "This is the first paragraph of your episode.",
            "This is the second paragraph. You can add as many as you need.",
          ],
          choices: [
            {
              text: "This is the first choice the player can make.",
              nextScene: "scene-two",
            },
            {
              text: "This is the second choice.",
              nextScene: "scene-three",
            },
          ],
        },
        "scene-two": {
          id: "scene-two",
          title: "Second Scene",
          text: ["This is the content of your second scene."],
          choices: [
            {
              text: "Go back to start",
              nextScene: "start",
            },
          ],
        },
        "scene-three": {
          id: "scene-three",
          title: "Third Scene",
          text: ["This is the content of your third scene."],
          choices: [
            {
              text: "Go back to start",
              nextScene: "start",
            },
          ],
        },
      },
    }

    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", "episode-template.json")
    linkElement.click()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          className="rounded-full w-12 h-12 bg-[#cc99cc] text-black hover:bg-[#d8b2d8] border-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 w-96"
          >
            <Card className="bg-black border-[#cc99cc] shadow-lg">
              {/* LCARS decorative top bar */}
              <div className="flex w-full">
                <div className="h-3 w-16 bg-[#cc99cc] rounded-tl-lg"></div>
                <div className="h-3 w-8 bg-[#ff9900]"></div>
                <div className="h-3 flex-grow bg-[#99ccff]"></div>
                <div className="h-3 w-8 bg-[#ff9900]"></div>
                <div className="h-3 w-16 bg-[#cc99cc] rounded-tr-lg"></div>
              </div>

              <CardHeader>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#cc99cc] rounded-full mr-2"></div>
                  <CardTitle className="text-[#cc99cc] lcars-text">EPISODE CREATION GUIDE</CardTitle>
                </div>
                <CardDescription className="text-gray-400">Learn how to create your own episodes</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Episodes are JSON files with a specific structure. You can create your own episodes in two ways:
                </p>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#ff9900] rounded-full mr-2"></div>
                    <h3 className="font-bold text-[#ff9900] lcars-text">METHOD 1: FILE SYSTEM</h3>
                  </div>
                  <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                    <li>Create a JSON file with your episode content</li>
                    <li>
                      Place the file in the <code className="bg-gray-800 px-1 rounded">public/episodes</code> folder
                    </li>
                    <li>Click "Refresh Episodes" in the UI to load your episode</li>
                    <li>Your episode will appear in the episode library</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#99ccff] rounded-full mr-2"></div>
                    <h3 className="font-bold text-[#99ccff] lcars-text">METHOD 2: IMPORT VIA UI</h3>
                  </div>
                  <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                    <li>Download the template below</li>
                    <li>Edit the JSON file with your own content</li>
                    <li>Click "Import Episodes" to add your episode to the game</li>
                  </ol>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="border-[#ff9900] text-[#ff9900] hover:bg-[#ff9900] hover:text-black"
                    onClick={handleExportTemplate}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>

                  <Button
                    variant="outline"
                    className="border-[#99ccff] text-[#99ccff] hover:bg-[#99ccff] hover:text-black"
                    onClick={() => window.open("/episodes", "_blank")}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Open Episodes Folder
                  </Button>
                </div>
              </CardContent>

              {/* LCARS decorative bottom bar */}
              <div className="flex w-full">
                <div className="h-3 w-16 bg-[#cc99cc] rounded-bl-lg"></div>
                <div className="h-3 w-8 bg-[#ff9900]"></div>
                <div className="h-3 flex-grow bg-[#99ccff]"></div>
                <div className="h-3 w-8 bg-[#ff9900]"></div>
                <div className="h-3 w-16 bg-[#cc99cc] rounded-br-lg"></div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
