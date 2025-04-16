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

  // Replace the entire return statement with this improved LCARS interface
  return (
    <div className="w-full h-screen flex flex-col bg-black overflow-hidden">
      {/* LCARS Header Bar */}
      <div className="w-full bg-black flex items-stretch h-24 relative">
        {/* Left corner element */}
        <div className="w-48 h-24 relative">
          <div className="absolute top-0 left-0 w-36 h-16 bg-[#ff9900] rounded-br-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-8 bg-[#ff9900]"></div>
        </div>

        {/* Header title section */}
        <div className="flex-grow flex flex-col justify-end">
          <div className="flex items-center mb-1">
            <h1 className="text-3xl font-bold text-[#ff9900] lcars-title tracking-wider">STAR TREK ADVENTURE</h1>
            <div className="ml-4 w-8 h-8 rounded-full bg-[#cc99cc]"></div>
            <div className="ml-2 w-16 h-8 rounded-full bg-[#99ccff]"></div>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-32 bg-[#ff9900] mr-4"></div>
            <span className="text-[#ff9900] lcars-text text-xl">EPISODE LIBRARY</span>
            <div className="h-2 w-full bg-[#ff9900] ml-4"></div>
          </div>
        </div>

        {/* Right corner element */}
        <div className="w-48 h-24 relative">
          <div className="absolute top-0 right-0 w-36 h-16 bg-[#ff9900] rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-8 bg-[#ff9900]"></div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#cc99cc]"></div>
            <div className="w-6 h-6 rounded-full bg-[#99ccff]"></div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-48 bg-black flex flex-col">
          <div className="h-32 w-full bg-[#ff9900] rounded-br-3xl"></div>

          {/* Control buttons */}
          <div className="flex flex-col space-y-3 p-3 mt-4">
            <Button
              variant="outline"
              className="border-[#99ccff] bg-[#99ccff] text-black hover:bg-[#c6e2ff] hover:text-black lcars-button h-12 justify-start pl-4"
              onClick={handleRefreshEpisodes}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              REFRESH
            </Button>

            <Button
              variant="outline"
              className="border-[#cc99cc] bg-[#cc99cc] text-black hover:bg-[#996699] hover:text-white lcars-button h-12 justify-start pl-4"
              onClick={handleImportEpisode}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              IMPORT
            </Button>

            <Button
              variant="outline"
              className="border-[#ffcc00] bg-[#ffcc00] text-black hover:bg-[#ffee00] hover:text-black lcars-button h-12 justify-start pl-4"
              onClick={handleExportEpisode}
              disabled={!selectedEpisodeId}
            >
              <Download className="mr-2 h-4 w-4" />
              EXPORT
            </Button>

            {selectedEpisodeId && !isSelectedEpisodeBuiltIn && (
              <Button
                variant="outline"
                className="border-[#cc6666] bg-[#cc6666] text-white hover:bg-[#ff5555] hover:text-white lcars-button h-12 justify-start pl-4"
                onClick={handleDeleteEpisode}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                DELETE
              </Button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            multiple
            className="hidden"
          />

          {/* Bottom decorative element */}
          <div className="mt-auto">
            <div className="h-32 w-full bg-[#ff9900] rounded-tr-3xl"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          {/* Status bar */}
          <div className="h-12 bg-black flex items-center px-4">
            <div className="w-4 h-8 bg-[#ff9900] rounded-l-full mr-2"></div>
            <h2 className="text-xl font-bold text-[#ff9900] lcars-title">EPISODE DATABASE</h2>
            <div className="flex-grow mx-4 h-2 bg-[#ff9900]"></div>
            <div className="text-sm text-[#99ccff] lcars-readout mr-2 bg-black px-2 py-1 border border-[#99ccff]">
              {isLoading ? "LOADING EPISODES..." : `${episodes.length} EPISODES AVAILABLE`}
            </div>
            <div className="w-4 h-8 bg-[#ff9900] rounded-r-full"></div>
          </div>

          {/* Import status message */}
          {importStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-4 p-2 rounded-lg text-center ${
                importStatus.success ? "bg-[#66cc66]/30 text-[#88ff88]" : "bg-[#cc6666]/30 text-[#ff5555]"
              } border-l-4 ${importStatus.success ? "border-[#66cc66]" : "border-[#cc6666]"}`}
            >
              {importStatus.message}
            </motion.div>
          )}

          {/* Episodes grid */}
          <ScrollArea className="flex-1 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-4">
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
                                <span
                                  className={`inline-block w-3 h-3 rounded-full ${getLcarsColor(index)} mr-2`}
                                ></span>
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

        {/* Right sidebar */}
        <div className="w-48 bg-black flex flex-col">
          <div className="h-32 w-full bg-[#ff9900] rounded-bl-3xl"></div>

          {/* LCARS decorative elements */}
          <div className="flex flex-col space-y-4 p-3 mt-4">
            <div className="h-8 w-full bg-[#cc99cc] rounded-l-full"></div>
            <div className="h-8 w-full bg-[#99ccff] rounded-l-full"></div>
            <div className="h-8 w-full bg-[#ffcc00] rounded-l-full"></div>
            <div className="h-8 w-full bg-[#cc6666] rounded-l-full"></div>
            <div className="h-8 w-full bg-[#66cc66] rounded-l-full"></div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto p-3 space-y-3">
            <Button
              variant="outline"
              className="border-[#66cc66] bg-[#66cc66] text-black hover:bg-[#88ff88] hover:text-black lcars-button w-full h-12"
              disabled={!hasSavedState}
              onClick={handleContinueEpisode}
            >
              <Save className="mr-2 h-4 w-4" />
              CONTINUE
            </Button>

            <Button
              className="bg-[#ff9900] text-black hover:bg-[#ffb84d] lcars-button w-full h-12"
              disabled={!selectedEpisodeId}
              onClick={handlePlayEpisode}
            >
              <Play className="mr-2 h-4 w-4" />
              PLAY EPISODE
            </Button>
          </div>

          {/* Bottom decorative element */}
          <div className="mt-4">
            <div className="h-32 w-full bg-[#ff9900] rounded-tl-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
