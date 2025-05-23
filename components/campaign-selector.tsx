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
// First, let's update the imports to include Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

  // Handle starting a specific episode from a campaign
  const handleStartSpecificEpisode = async (campaign: Campaign, episode: Episode) => {
    if (!campaign || !episode) return

    // Create initial game state
    const initialGameState: GameState = {
      flags: {},
      variables: {},
      moduleStates: {},
    }

    // Find the episode in the campaign
    const campaignEpisode = campaign.episodes.find((ep) => ep.episodeId === episode.id)

    if (campaignEpisode) {
      // Apply any initial state modifications from the campaign episode
      const gameState = prepareEpisodeInitialState(campaign.id, episode.id, initialGameState)

      // Save campaign progress with this episode as current
      await saveCampaignProgress(campaign.id, episode.id, [], gameState)

      // Start the episode
      onStartCampaign(campaign, episode, gameState)
    } else {
      setImportStatus({
        success: false,
        message: `Episode ${episode.id} is not part of this campaign.`,
      })
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  // Replace the entire return statement with this improved LCARS interface
  return (
    <div className="w-full h-screen flex flex-col bg-black overflow-hidden">
      {/* LCARS Header Bar */}
      <div className="w-full bg-black flex items-stretch h-24 relative">
        {/* Left corner element */}
        <div className="w-48 h-24 relative">
          <div className="absolute top-0 left-0 w-36 h-16 bg-[#cc99cc] rounded-br-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-8 bg-[#cc99cc]"></div>
        </div>

        {/* Header title section */}
        <div className="flex-grow flex flex-col justify-end">
          <div className="flex items-center mb-1">
            <h1 className="text-3xl font-bold text-[#ff9900] lcars-title tracking-wider">STAR TREK CAMPAIGN</h1>
            <div className="ml-4 w-8 h-8 rounded-full bg-[#ff9900]"></div>
            <div className="ml-2 w-16 h-8 rounded-full bg-[#99ccff]"></div>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-32 bg-[#cc99cc] mr-4"></div>
            <span className="text-[#cc99cc] lcars-text text-xl">MISSION SELECTOR</span>
            <div className="h-2 w-full bg-[#cc99cc] ml-4"></div>
          </div>
        </div>

        {/* Right corner element */}
        <div className="w-48 h-24 relative">
          <div className="absolute top-0 right-0 w-36 h-16 bg-[#cc99cc] rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-8 bg-[#cc99cc]"></div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#ff9900]"></div>
            <div className="w-6 h-6 rounded-full bg-[#99ccff]"></div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-48 bg-black flex flex-col">
          <div className="h-32 w-full bg-[#cc99cc] rounded-br-3xl"></div>

          {/* Control buttons */}
          <div className="flex flex-col space-y-3 p-3 mt-4">
            <Button
              variant="outline"
              className="border-[#99ccff] bg-[#99ccff] text-black hover:bg-[#c6e2ff] hover:text-black lcars-button h-12 justify-start pl-4"
              onClick={handleRefreshCampaigns}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              REFRESH
            </Button>

            <Button
              variant="outline"
              className="border-[#ff9900] bg-[#ff9900] text-black hover:bg-[#ffb84d] hover:text-black lcars-button h-12 justify-start pl-4"
              onClick={handleImportCampaign}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              IMPORT
            </Button>

            <Button
              variant="outline"
              className="border-[#ffcc00] bg-[#ffcc00] text-black hover:bg-[#ffee00] hover:text-black lcars-button h-12 justify-start pl-4"
              onClick={handleExportCampaign}
              disabled={!selectedCampaignId}
            >
              <Download className="mr-2 h-4 w-4" />
              EXPORT
            </Button>

            {selectedCampaignId && !isSelectedCampaignBuiltIn && (
              <Button
                variant="outline"
                className="border-[#cc6666] bg-[#cc6666] text-white hover:bg-[#ff5555] hover:text-white lcars-button h-12 justify-start pl-4"
                onClick={handleDeleteCampaign}
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
            <div className="h-32 w-full bg-[#cc99cc] rounded-tr-3xl"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          {/* Status bar */}
          <div className="h-12 bg-black flex items-center px-4">
            <div className="w-4 h-8 bg-[#cc99cc] rounded-l-full mr-2"></div>
            <h2 className="text-xl font-bold text-[#cc99cc] lcars-title">CAMPAIGN DATABASE</h2>
            <div className="flex-grow mx-4 h-2 bg-[#cc99cc]"></div>
            <div className="text-sm text-[#99ccff] lcars-readout mr-2 bg-black px-2 py-1 border border-[#99ccff]">
              {isLoading ? "LOADING CAMPAIGNS..." : `${campaigns.length} CAMPAIGNS AVAILABLE`}
            </div>
            <div className="w-4 h-8 bg-[#cc99cc] rounded-r-full"></div>
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

          {/* Tabs for Campaigns and Episodes */}
          <Tabs defaultValue="campaigns" className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="bg-black border border-[#cc99cc] grid w-[400px] grid-cols-2">
                <TabsTrigger
                  value="campaigns"
                  className="data-[state=active]:bg-[#cc99cc] data-[state=active]:text-black"
                >
                  CAMPAIGNS
                </TabsTrigger>
                <TabsTrigger
                  value="episodes"
                  className="data-[state=active]:bg-[#cc99cc] data-[state=active]:text-black"
                  disabled={!selectedCampaignId}
                >
                  EPISODES
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="flex-1 overflow-hidden">
              <ScrollArea className="flex-1 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-4">
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
                                    <span
                                      className={`inline-block w-3 h-3 rounded-full ${getLcarsColor(index)} mr-2`}
                                    ></span>
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
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${getLcarsColor((index + i) % 6)}`}
                                  ></div>
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
            </TabsContent>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="flex-1 overflow-hidden">
              {selectedCampaignId && (
                <ScrollArea className="flex-1 px-4">
                  <div className="py-4">
                    {(() => {
                      const selectedCampaign = campaigns.find((camp) => camp.id === selectedCampaignId)
                      if (!selectedCampaign) return <p className="text-[#cc6666]">No campaign selected</p>

                      // Sort episodes by order
                      const sortedEpisodes = [...selectedCampaign.episodes].sort((a, b) => a.order - b.order)

                      return (
                        <Accordion type="single" collapsible className="w-full">
                          {sortedEpisodes.map((episode, index) => {
                            const episodeData = getEpisodeById(episode.episodeId)
                            return (
                              <AccordionItem
                                key={episode.episodeId}
                                value={episode.episodeId}
                                className="border-b border-[#cc99cc]/30"
                              >
                                <AccordionTrigger className="hover:text-[#cc99cc] py-4">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-6 h-6 rounded-full ${getLcarsColor(index)} flex items-center justify-center text-black font-bold mr-3`}
                                    >
                                      {episode.order}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[#cc99cc]">{episode.title}</div>
                                      <div className="text-xs text-[#99ccff]">
                                        {episodeData ? `Stardate: ${episodeData.stardate}` : "Episode not installed"}
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-9 pr-4">
                                  <div className="bg-black/50 p-3 rounded-lg border border-[#cc99cc]/30">
                                    <p className="text-gray-300 mb-3">
                                      {episode.description || episodeData?.description || "No description available"}
                                    </p>

                                    {episodeData ? (
                                      <Button
                                        className="bg-[#ff9900] text-black hover:bg-[#ffb84d] hover:text-black"
                                        onClick={() => handleStartSpecificEpisode(selectedCampaign, episodeData)}
                                      >
                                        Start Episode
                                      </Button>
                                    ) : (
                                      <div className="text-[#cc6666] text-sm">
                                        This episode is not installed. Please make sure all campaign episodes are
                                        available.
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      )
                    })()}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="w-48 bg-black flex flex-col">
          <div className="h-32 w-full bg-[#cc99cc] rounded-bl-3xl"></div>

          {/* LCARS decorative elements */}
          <div className="flex flex-col space-y-4 p-3 mt-4">
            <div className="h-8 w-full bg-[#ff9900] rounded-l-full"></div>
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
              disabled={!hasSavedProgress}
              onClick={handleContinueCampaign}
            >
              <Save className="mr-2 h-4 w-4" />
              CONTINUE
            </Button>

            <Button
              className="bg-[#cc99cc] text-black hover:bg-[#996699] hover:text-white lcars-button w-full h-12"
              disabled={!selectedCampaignId}
              onClick={handleStartCampaign}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              START CAMPAIGN
            </Button>
          </div>

          {/* Bottom decorative element */}
          <div className="mt-4">
            <div className="h-32 w-full bg-[#cc99cc] rounded-tl-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
