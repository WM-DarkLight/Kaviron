"use client"

import { useState } from "react"
import { GameEngine } from "@/components/game-engine"
import { EpisodeSelector } from "@/components/episode-selector"
import { EpisodeGuide } from "@/components/episode-guide"
import { CampaignSelector } from "@/components/campaign-selector"
import { CampaignProgress } from "@/components/campaign-progress"
import { CampaignCompletion } from "@/components/campaign-completion"
import type { Episode, GameState, Campaign } from "@/lib/types"
import { useEpisodeLibrary } from "@/lib/use-episode-library"
import { useCampaignLibrary } from "@/lib/use-campaign-library"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  // Episode state
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [currentSceneId, setCurrentSceneId] = useState<string>("start")
  const [gameState, setGameState] = useState<GameState | null>(null)

  // Campaign state
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [completedEpisodes, setCompletedEpisodes] = useState<string[]>([])
  const [campaignCompleted, setCampaignCompleted] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<"episodes" | "campaigns">("episodes")

  const { getSavedState } = useEpisodeLibrary()
  const { getCampaignProgress, saveCampaignProgress, getNextEpisodeInCampaign, prepareEpisodeInitialState } =
    useCampaignLibrary()

  const handleSelectEpisode = async (episode: Episode) => {
    // Check if there's a saved state for this episode
    const savedState = await getSavedState(episode.id)

    if (savedState) {
      setCurrentSceneId(savedState.currentSceneId)
      setGameState(savedState.gameState)
    } else {
      setCurrentSceneId("start")
      setGameState(null)
    }

    setSelectedEpisode(episode)
    setActiveCampaign(null) // Clear any active campaign
  }

  const handleStartCampaign = (campaign: Campaign, episode: Episode, initialGameState: GameState) => {
    setActiveCampaign(campaign)
    setSelectedEpisode(episode)
    setCurrentSceneId("start")
    setGameState(initialGameState)
    setCampaignCompleted(false)
  }

  const handleExitGame = async () => {
    if (activeCampaign && selectedEpisode) {
      // If we're in a campaign, check if this episode is complete
      // We consider an episode complete if the player has reached a scene with no choices
      const currentScene = selectedEpisode.scenes[currentSceneId]
      if (currentScene && currentScene.choices.length === 0) {
        // This is an ending scene, mark the episode as completed
        const updatedCompletedEpisodes = [...completedEpisodes, selectedEpisode.id]
        setCompletedEpisodes(updatedCompletedEpisodes)

        // Save campaign progress
        await saveCampaignProgress(
          activeCampaign.id,
          null, // Clear current episode since it's completed
          updatedCompletedEpisodes,
          gameState || { flags: {}, variables: {}, moduleStates: {} },
        )

        // Check if there's a next episode
        const nextEpisode = await getNextEpisodeInCampaign(
          activeCampaign.id,
          selectedEpisode.id,
          gameState || { flags: {}, variables: {}, moduleStates: {} },
        )

        if (nextEpisode) {
          // Prepare initial state for the next episode
          const nextGameState = prepareEpisodeInitialState(
            activeCampaign.id,
            nextEpisode.id,
            gameState || { flags: {}, variables: {}, moduleStates: {} },
          )

          // Update campaign progress with the next episode
          await saveCampaignProgress(activeCampaign.id, nextEpisode.id, updatedCompletedEpisodes, nextGameState)

          // Load the next episode
          setSelectedEpisode(nextEpisode)
          setCurrentSceneId("start")
          setGameState(nextGameState)
          return // Don't exit to menu, continue with next episode
        } else {
          // No more episodes, campaign is complete
          setCampaignCompleted(true)
          return // Show completion screen instead of exiting
        }
      } else {
        // Episode not complete, just save current progress
        await saveCampaignProgress(
          activeCampaign.id,
          selectedEpisode.id,
          completedEpisodes,
          gameState || { flags: {}, variables: {}, moduleStates: {} },
        )
      }
    }

    // Exit to menu
    setSelectedEpisode(null)
    setCampaignCompleted(false)
  }

  const handleReturnToMenu = () => {
    setSelectedEpisode(null)
    setActiveCampaign(null)
    setCampaignCompleted(false)
  }

  return (
    <main className="flex min-h-screen flex-col bg-black">
      {selectedEpisode ? (
        <>
          {activeCampaign && (
            <CampaignProgress
              campaign={activeCampaign}
              currentEpisodeId={selectedEpisode.id}
              completedEpisodes={completedEpisodes}
            />
          )}
          <GameEngine
            episode={selectedEpisode}
            initialSceneId={currentSceneId}
            initialGameState={gameState || undefined}
            onExitGame={handleExitGame}
          />
          {campaignCompleted && activeCampaign && (
            <CampaignCompletion campaign={activeCampaign} onReturnToMenu={handleReturnToMenu} />
          )}
        </>
      ) : (
        <>
          <div className="w-full max-w-4xl mx-auto mb-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "episodes" | "campaigns")}>
              <TabsList className="bg-black border border-[#f90] grid w-full grid-cols-2">
                <TabsTrigger
                  value="episodes"
                  className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
                >
                  SINGLE EPISODES
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
                >
                  CAMPAIGNS
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === "episodes" ? (
            <>
              <EpisodeSelector onSelectEpisode={handleSelectEpisode} />
              <EpisodeGuide />
            </>
          ) : (
            <CampaignSelector onStartCampaign={handleStartCampaign} />
          )}
        </>
      )}
    </main>
  )
}
