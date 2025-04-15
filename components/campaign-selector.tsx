"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Save, Trash2, FolderPlus, BookOpen, RefreshCw } from "lucide-react"
import { useCampaignLibrary } from "@/lib/use-campaign-library"
import { useEpisodeLibrary } from "@/lib/use-episode-library"
import { builtInCampaigns } from "@/lib/campaigns"
import type { Campaign, Episode, GameState } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface CampaignSelectorProps {
  onStartCampaign: (campaign: Campaign, episode: Episode, gameState: GameState) => void
}

export function CampaignSelector({ onStartCampaign }: CampaignSelectorProps) {
  const {
    campaigns,
    isLoading,
    getCampaignProgress,
    saveCampaignProgress,
    importCampaignsFromFiles,
    getNextEpisodeInCampaign,
    prepareEpisodeInitialState,
    deleteCampaign,
    refreshFileSystemCampaigns,
  } = useCampaignLibrary()
  const { getEpisodeById } = useEpisodeLibrary()
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(false)
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check if the selected campaign has saved progress when the selection changes
  useEffect(() => {
    const checkSavedProgress = async () => {
      if (selectedCampaignId) {
        const progress = await getCampaignProgress(selectedCampaignId)
        setHasSavedProgress(progress !== null)
      } else {
        setHasSavedProgress(false)
      }
    }

    checkSavedProgress()
  }, [selectedCampaignId, getCampaignProgress])

  // Handle campaign selection
  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
  }

  // Handle start campaign button click
  const handleStartCampaign = async () => {
    if (!selectedCampaignId) return

    const selectedCampaign = campaigns.find((camp) => camp.id === selectedCampaignId)
    if (!selectedCampaign) return

    // Get the first episode in the campaign
    const firstEpisode = selectedCampaign.episodes.find((ep) => ep.order === 1)
    if (!firstEpisode) {
      setImportStatus({
        success: false,
        message: "Campaign has no starting episode.",
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    const episode = getEpisodeById(firstEpisode.episodeId)
    if (!episode) {
      setImportStatus({
        success: false,
        message: `Episode ${firstEpisode.episodeId} not found. Make sure all campaign episodes are installed.`,
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    // Create initial game state
    const initialGameState: GameState = {
      flags: {},
      variables: {},
      moduleStates: {},
    }

    // Apply any initial state modifications from the campaign episode
    const gameState = prepareEpisodeInitialState(selectedCampaignId, firstEpisode.episodeId, initialGameState)

    // Save initial campaign progress
    await saveCampaignProgress(selectedCampaignId, firstEpisode.episodeId, [], gameState)

    // Start the campaign
    onStartCampaign(selectedCampaign, episode, gameState)
  }

  // Handle continue campaign button click
  const handleContinueCampaign = async () => {
    if (!selectedCampaignId) return

    const selectedCampaign = campaigns.find((camp) => camp.id === selectedCampaignId)
    if (!selectedCampaign) return

    // Get saved progress
    const progress = await getCampaignProgress(selectedCampaignId)
    if (!progress) {
      setImportStatus({
        success: false,
        message: "No saved progress found.",
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    // Ensure completedEpisodes is always an array
    const completedEpisodes = progress.completedEpisodes || []

    // If we have a current episode, load it
    if (progress.currentEpisodeId) {
      const episode = getEpisodeById(progress.currentEpisodeId)
      if (!episode) {
        setImportStatus({
          success: false,
          message: `Episode ${progress.currentEpisodeId} not found. Make sure all campaign episodes are installed.`,
        })
        setTimeout(() => setImportStatus(null), 3000)
        return
      }

      // Continue with the saved game state
      onStartCampaign(selectedCampaign, episode, progress.gameState)
    } else {
      // Try to determine the next episode based on completed episodes and game state
      const lastCompletedEpisode = completedEpisodes.length > 0 ? completedEpisodes[completedEpisodes.length - 1] : null

      const nextEpisode = await getNextEpisodeInCampaign(selectedCampaignId, lastCompletedEpisode, progress.gameState)

      if (!nextEpisode) {
        setImportStatus({
          success: false,
          message: "Could not determine the next episode in the campaign.",
        })
        setTimeout(() => setImportStatus(null), 3000)
        return
      }

      // Update progress with the new current episode
      await saveCampaignProgress(selectedCampaignId, nextEpisode.id, completedEpisodes, progress.gameState)

      // Start the next episode
      onStartCampaign(selectedCampaign, nextEpisode, progress.gameState)
    }
  }

  // Handle import campaign
  const handleImportCampaign = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setImportStatus({ message: "Importing campaigns..." })
      const result = await importCampaignsFromFiles(Array.from(files))

      if (result.success) {
        setImportStatus({
          success: true,
          message: `Successfully imported ${result.added} campaign${result.added !== 1 ? "s" : ""}.`,
        })
      } else {
        setImportStatus({
          success: false,
          message: `Failed to import campaigns: ${result.errors.join(", ")}`,
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
        message: `Error importing campaigns: ${error}`,
      })

      // Auto-clear status after 5 seconds
      setTimeout(() => setImportStatus(null), 5000)
    }
  }

  // Handle export campaign
  const handleExportCampaign = () => {
    if (!selectedCampaignId) return

    const campaign = campaigns.find((camp) => camp.id === selectedCampaignId)
    if (!campaign) return

    const dataStr = JSON.stringify(campaign, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${campaign.id}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    if (!selectedCampaignId) return

    // Check if this is a built-in campaign
    const isBuiltIn = builtInCampaigns.some((camp) => camp.id === selectedCampaignId)
    if (isBuiltIn) {
      setImportStatus({
        success: false,
        message: "Cannot delete built-in campaigns.",
      })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }

    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      await deleteCampaign(selectedCampaignId)
      setSelectedCampaignId(null)
      setImportStatus({
        success: true,
        message: "Campaign deleted successfully.",
      })
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  // Handle refresh campaigns from file system
  const handleRefreshCampaigns = async () => {
    setIsRefreshing(true)
    setImportStatus({ message: "Refreshing campaigns from file system..." })

    try {
      await refreshFileSystemCampaigns()
      setImportStatus({
        success: true,
        message: "Campaigns refreshed successfully.",
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: `Error refreshing campaigns: ${error}`,
      })
    } finally {
      setIsRefreshing(false)
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  // Check if the selected campaign is a built-in campaign
  const isSelectedCampaignBuiltIn = selectedCampaignId
    ? builtInCampaigns.some((camp) => camp.id === selectedCampaignId)
    : false

  // Determine campaign source
  const getCampaignSource = (campaignId: string) => {
    if (builtInCampaigns.some((camp) => camp.id === campaignId)) {
      return <Badge className="bg-[#3366cc] text-white">Built-in</Badge>
    }
    return null
  }

  // Get a random LCARS color for each campaign card
  const getLcarsColor = (index: number) => {
    const colors = [
      "bg-[#cc99cc]", // purple
      "bg-[#99ccff]", // blue
      "bg-[#ffcc00]", // yellow
      "bg-[#cc6666]", // red
      "bg-[#66cc66]", // green
      "bg-[#ff9900]", // orange
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
              <div className="w-16 h-12 bg-[#cc99cc] rounded-tl-lg rounded-br-lg"></div>
              <div className="flex mt-1">
                <div className="w-8 h-3 bg-[#ff9900]"></div>
                <div className="w-8 h-3 bg-[#99ccff]"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#ff9900] lcars-title">STAR TREK CAMPAIGN</h1>
              <div className="flex items-center">
                <div className="h-1 w-20 bg-[#cc99cc] mr-2"></div>
                <span className="text-[#cc99cc] lcars-text">MISSION SELECTOR</span>
                <div className="h-1 w-20 bg-[#cc99cc] ml-2"></div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-[#99ccff] bg-[#99ccff] text-black hover:bg-[#c6e2ff] hover:text-black lcars-button"
              onClick={handleRefreshCampaigns}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              REFRESH
            </Button>
            <Button
              variant="outline"
              className="border-[#cc99cc] bg-[#cc99cc] text-black hover:bg-[#996699] hover:text-white lcars-button"
              onClick={handleImportCampaign}
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
              onClick={handleExportCampaign}
              disabled={!selectedCampaignId}
            >
              <Download className="mr-2 h-4 w-4" />
              EXPORT
            </Button>
          </div>
        </div>

        {/* LCARS decorative bar */}
        <div className="flex w-full mt-2">
          <div className="h-2 w-24 bg-[#cc99cc] rounded-l-full"></div>
          <div className="h-2 w-12 bg-[#ff9900]"></div>
          <div className="h-2 flex-grow bg-[#99ccff]"></div>
          <div className="h-2 w-12 bg-[#ff9900]"></div>
          <div className="h-2 w-24 bg-[#cc99cc] rounded-r-full"></div>
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
            <div className="w-4 h-8 bg-[#cc99cc] rounded-l-full mr-2"></div>
            <h2 className="text-xl font-bold text-[#cc99cc] lcars-title">CAMPAIGN DATABASE</h2>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-[#99ccff] lcars-readout mr-2">
              {isLoading ? "LOADING CAMPAIGNS..." : `${campaigns.length} CAMPAIGNS AVAILABLE`}
            </div>
            <div className="w-4 h-8 bg-[#cc99cc] rounded-r-full"></div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {campaigns.map((campaign, index) => (
              <motion.div key={campaign.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`bg-black cursor-pointer transition-all overflow-hidden ${
                    selectedCampaignId === campaign.id
                      ? "border-[#cc99cc] ring-2 ring-[#cc99cc]"
                      : "border-gray-700 hover:border-[#cc99cc]"
                  }`}
                  onClick={() => handleSelectCampaign(campaign.id)}
                >
                  <div className="flex h-full">
                    {/* Left decorative bar with different colors */}
                    <div className={`w-3 ${getLcarsColor(index)}`}></div>

                    <div className="flex-grow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-[#cc99cc] flex items-center">
                              <span className={`inline-block w-3 h-3 rounded-full ${getLcarsColor(index)} mr-2`}></span>
                              {campaign.title}
                            </CardTitle>
                            <CardDescription className="text-[#99ccff]">By {campaign.author}</CardDescription>
                          </div>
                          {getCampaignSource(campaign.id) || (
                            <Badge className="bg-[#ff9900] text-black">Campaign</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        <p>{campaign.description}</p>
                        <div className="mt-2">
                          <Badge className="bg-[#cc99cc] text-black">{campaign.episodes.length} Episodes</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <span className="text-xs text-[#99ccff] lcars-readout">
                          {campaign.version ? `Version ${campaign.version}` : ""}
                        </span>
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
              <div className="w-16 h-8 bg-[#cc99cc] rounded-bl-lg"></div>
              <div className="w-8 h-8 bg-[#ff9900] rounded-full"></div>
              <div className="w-24 h-8 bg-[#99ccff] rounded-lg"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            {selectedCampaignId && !isSelectedCampaignBuiltIn && (
              <Button
                variant="outline"
                className="border-[#cc6666] bg-[#cc6666] text-white hover:bg-[#ff5555] hover:text-white lcars-button"
                onClick={handleDeleteCampaign}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                DELETE
              </Button>
            )}
            <Button
              variant="outline"
              className="border-[#66cc66] bg-[#66cc66] text-black hover:bg-[#88ff88] hover:text-black lcars-button"
              disabled={!hasSavedProgress}
              onClick={handleContinueCampaign}
            >
              <Save className="mr-2 h-4 w-4" />
              CONTINUE
            </Button>
            <Button
              className="bg-[#cc99cc] text-black hover:bg-[#996699] hover:text-white lcars-button"
              disabled={!selectedCampaignId}
              onClick={handleStartCampaign}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              START CAMPAIGN
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
