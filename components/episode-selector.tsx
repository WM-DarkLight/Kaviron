"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Play, Save, Trash2, FolderPlus, RefreshCw } from "lucide-react"
import { useEpisodeLibrary } from "@/lib/use-episode-library"
import { builtInEpisodes } from "@/lib/episodes"
import type { Episode } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface EpisodeSelectorProps {
  onSelectEpisode: (episode: Episode) => void
}

export function EpisodeSelector({ onSelectEpisode }: EpisodeSelectorProps) {
  const {
    episodes,
    addEpisode,
    deleteEpisode,
    getSavedState,
    importEpisodesFromFiles,
    refreshFileSystemEpisodes,
    isLoading,
  } = useEpisodeLibrary()
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [hasSavedState, setHasSavedState] = useState<boolean>(false)
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if the selected episode has a saved state when the selection changes
  useEffect(() => {
    const checkSavedState = async () => {
      if (selectedEpisodeId) {
        const savedState = await getSavedState(selectedEpisodeId)
        setHasSavedState(savedState !== null)
      } else {
        setHasSavedState(false)
      }
    }

    checkSavedState()
  }, [selectedEpisodeId, getSavedState])

  // Handle episode selection
  const handleSelectEpisode = (episodeId: string) => {
    setSelectedEpisodeId(episodeId)
  }

  // Handle play button click
  const handlePlayEpisode = () => {
    if (!selectedEpisodeId) return

    const episode = episodes.find((ep) => ep.id === selectedEpisodeId)
    if (episode) onSelectEpisode(episode)
  }

  // Handle continue button click
  const handleContinueEpisode = () => {
    if (!selectedEpisodeId) return

    const episode = episodes.find((ep) => ep.id === selectedEpisodeId)
    if (episode) onSelectEpisode(episode)
  }

  // Handle import episode
  const handleImportEpisode = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setImportStatus({ message: "Importing episodes..." })
      const result = await importEpisodesFromFiles(Array.from(files))

      if (result.success) {
        setImportStatus({
          success: true,
          message: `Successfully imported ${result.added} episode${result.added !== 1 ? "s" : ""}.`,
        })
      } else {
        setImportStatus({
          success: false,
          message: `Failed to import episodes: ${result.errors.join(", ")}`,
        })
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Auto-clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000)
    } catch (error) {
      setImportStatus({
        success: false,
        message: `Error importing episodes: ${error}`,
      })

      // Auto-clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000)
    }
  }

  // Handle export episode
  const handleExportEpisode = () => {
    if (!selectedEpisodeId) return

    const episode = episodes.find((ep) => ep.id === selectedEpisodeId)
    if (!episode) return

    const dataStr = JSON.stringify(episode, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${episode.id}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Handle delete episode
  const handleDeleteEpisode = async () => {
    if (!selectedEpisodeId) return

    // Check if this is a built-in episode
    const isBuiltIn = builtInEpisodes.some((ep) => ep.id === selectedEpisodeId)
    if (isBuiltIn) {
      setImportStatus({
        success: false,
        message: "Cannot delete built-in episodes.",
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this episode? This action cannot be undone.")) {
      await deleteEpisode(selectedEpisodeId)
      setSelectedEpisodeId(null)
      setImportStatus({
        success: true,
        message: "Episode deleted successfully.",
      })
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  // Handle refresh episodes from file system
  const handleRefreshEpisodes = async () => {
    setIsRefreshing(true)
    setImportStatus({ message: "Refreshing episodes from file system..." })

    try {
      await refreshFileSystemEpisodes()
      setImportStatus({
        success: true,
        message: "Episodes refreshed successfully.",
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: `Error refreshing episodes: ${error}`,
      })
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  // Check if the selected episode is a built-in episode
  const isSelectedEpisodeBuiltIn = selectedEpisodeId ? builtInEpisodes.some((ep) => ep.id === selectedEpisodeId) : false

  // Determine episode source
  const getEpisodeSource = (episodeId: string) => {
    if (builtInEpisodes.some((ep) => ep.id === episodeId)) {
      return <Badge className="bg-blue-600 text-white">Built-in</Badge>
    }
    // We don't have a direct way to know if it's from file system or IndexedDB
    // This would require additional tracking in the episode object
    return null
  }

  // Get a random LCARS color for each episode card
  const getLcarsColor = (index: number) => {
    const colors = [
      "bg-[#ff9900]", // orange
      "bg-[#cc99cc]", // purple
      "bg-[#99ccff]", // blue
      "bg-[#ffcc00]", // yellow
      "bg-[#cc6666]", // red
      "bg-[#66cc66]", // green
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-screen bg-black">
      {/* Enhanced LCARS Header */}
      <header className="bg-black text-white p-4 border-t-4 border-l-4 border-r-4 border-[#ff9900] rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* LCARS decorative elements */}
            <div className="flex flex-col mr-4">
              <div className="w-16 h-12 bg-[#ff9900] rounded-tl-lg rounded-br-lg"></div>
              <div className="flex mt-1">
                <div className="w-8 h-3 bg-[#cc99cc]"></div>
                <div className="w-8 h-3 bg-[#99ccff]"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#ff9900] lcars-title">STAR TREK ADVENTURE</h1>
              <div className="flex items-center">
                <div className="h-1 w-20 bg-[#ff9900] mr-2"></div>
                <span className="text-[#ff9900] lcars-text">EPISODE LIBRARY</span>
                <div className="h-1 w-20 bg-[#ff9900] ml-2"></div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-[#99ccff] bg-[#99ccff] text-black hover:bg-[#c6e2ff] hover:text-black lcars-button"
              onClick={handleRefreshEpisodes}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              REFRESH
            </Button>
            <Button
              variant="outline"
              className="border-[#cc99cc] bg-[#cc99cc] text-black hover:bg-[#996699] hover:text-white lcars-button"
              onClick={handleImportEpisode}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              IMPORT
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              className="border-[#ffcc00] bg-[#ffcc00] text-black hover:bg-[#ffee00] hover:text-black lcars-button"
              onClick={handleExportEpisode}
              disabled={!selectedEpisodeId}
            >
              <Download className="mr-2 h-4 w-4" />
              EXPORT
            </Button>
          </div>
        </div>

        {/* LCARS decorative bar */}
        <div className="flex w-full mt-2">
          <div className="h-2 w-24 bg-[#ff9900] rounded-l-full"></div>
          <div className="h-2 w-12 bg-[#cc99cc]"></div>
          <div className="h-2 flex-grow bg-[#99ccff]"></div>
          <div className="h-2 w-12 bg-[#cc99cc]"></div>
          <div className="h-2 w-24 bg-[#ff9900] rounded-r-full"></div>
        </div>

        {/* Import status message with LCARS styling */}
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 p-2 rounded-lg text-center ${
              importStatus.success ? "bg-[#66cc66]/30 text-[#88ff88]" : "bg-[#cc6666]/30 text-[#ff5555]"
            } border-l-4 ${importStatus.success ? "border-[#66cc66]" : "border-[#cc6666]"}`}
          >
            {importStatus.message}
          </motion.div>
        )}
      </header>

      <div className="flex-grow bg-black p-4 border-l-4 border-r-4 border-[#ff9900] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-4 h-8 bg-[#ff9900] rounded-l-full mr-2"></div>
            <h2 className="text-xl font-bold text-[#ff9900] lcars-title">EPISODE DATABASE</h2>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-[#99ccff] lcars-readout mr-2">
              {isLoading ? "LOADING EPISODES..." : `${episodes.length} EPISODES AVAILABLE`}
            </div>
            <div className="w-4 h-8 bg-[#ff9900] rounded-r-full"></div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {episodes.map((episode, index) => (
              <motion.div key={episode.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`bg-black cursor-pointer transition-all overflow-hidden ${
                    selectedEpisodeId === episode.id
                      ? "border-[#ff9900] ring-2 ring-[#ff9900]"
                      : "border-gray-700 hover:border-[#ff9900]"
                  }`}
                  onClick={() => handleSelectEpisode(episode.id)}
                >
                  <div className="flex h-full">
                    {/* Left decorative bar with different colors */}
                    <div className={`w-3 ${getLcarsColor(index)}`}></div>

                    <div className="flex-grow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-[#ff9900] flex items-center">
                              <span className={`inline-block w-3 h-3 rounded-full ${getLcarsColor(index)} mr-2`}></span>
                              {episode.title}
                            </CardTitle>
                            <CardDescription className="text-[#99ccff]">
                              By {episode.author} • Stardate {episode.stardate}
                            </CardDescription>
                          </div>
                          {getEpisodeSource(episode.id) || <Badge className="bg-[#cc99cc] text-black">Episode</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        <p>{episode.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <span className="text-xs text-[#99ccff] lcars-readout">Ship: {episode.shipName}</span>
                        <div className="flex space-x-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${getLcarsColor((index + i) % 6)}`}></div>
                          ))}
                        </div>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced LCARS Footer */}
      <footer className="bg-black text-white p-4 border-b-4 border-l-4 border-r-4 border-[#ff9900] rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* LCARS decorative elements */}
            <div className="flex space-x-2">
              <div className="w-16 h-8 bg-[#ff9900] rounded-bl-lg"></div>
              <div className="w-8 h-8 bg-[#cc99cc] rounded-full"></div>
              <div className="w-24 h-8 bg-[#99ccff] rounded-lg"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            {selectedEpisodeId && !isSelectedEpisodeBuiltIn && (
              <Button
                variant="outline"
                className="border-[#cc6666] bg-[#cc6666] text-white hover:bg-[#ff5555] hover:text-white lcars-button"
                onClick={handleDeleteEpisode}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                DELETE
              </Button>
            )}
            <Button
              variant="outline"
              className="border-[#66cc66] bg-[#66cc66] text-black hover:bg-[#88ff88] hover:text-black lcars-button"
              disabled={!hasSavedState}
              onClick={handleContinueEpisode}
            >
              <Save className="mr-2 h-4 w-4" />
              CONTINUE
            </Button>
            <Button
              className="bg-[#ff9900] text-black hover:bg-[#ffb84d] lcars-button"
              disabled={!selectedEpisodeId}
              onClick={handlePlayEpisode}
            >
              <Play className="mr-2 h-4 w-4" />
              PLAY EPISODE
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
