"use client"

import { useState, useEffect, useCallback } from "react"
import { builtInCampaigns, isValidCampaign } from "./campaigns"
import { openDB } from "./indexed-db"
import type { Campaign, CampaignProgress, GameState, Episode } from "./types"
import { useEpisodeLibrary } from "./use-episode-library"

interface UserCampaign {
  id: string
  content: Campaign
  dateAdded: number
}

export function useCampaignLibrary() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(builtInCampaigns)
  const [isLoading, setIsLoading] = useState(true)
  const { episodes, getEpisodeById } = useEpisodeLibrary()

  // Load campaigns from both file system and IndexedDB on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true)

        // Start with built-in campaigns
        let combinedCampaigns = [...builtInCampaigns]

        // 1. Try to load campaigns from the file system (public/campaigns folder)
        try {
          const response = await fetch("/api/campaigns")
          if (response.ok) {
            const data = await response.json()
            const fileSystemCampaigns = data.campaigns || []

            // Create a map of existing campaigns by ID
            const campaignMap = new Map(combinedCampaigns.map((camp) => [camp.id, camp]))

            // Add file system campaigns, replacing any with the same ID
            fileSystemCampaigns.forEach((campaign: Campaign) => {
              campaignMap.set(campaign.id, campaign)
            })

            // Convert map back to array
            combinedCampaigns = Array.from(campaignMap.values())
          }
        } catch (error) {
          console.warn("Failed to load campaigns from file system:", error)
          // Continue with other sources even if this fails
        }

        // 2. Load campaigns from IndexedDB
        const db = await openDB()

        // Load user campaigns from IndexedDB
        const userCampaignsStore = db.transaction("userCampaigns", "readonly").objectStore("userCampaigns")
        const userCampaigns = await userCampaignsStore.getAll()

        if (userCampaigns.length > 0) {
          // Create a map of existing campaigns by ID
          const campaignMap = new Map(combinedCampaigns.map((camp) => [camp.id, camp]))

          // Add user campaigns from IndexedDB, replacing any with the same ID
          userCampaigns.forEach((uc: UserCampaign) => {
            campaignMap.set(uc.id, uc.content)
          })

          // Convert map back to array
          combinedCampaigns = Array.from(campaignMap.values())
        }

        // Update state with all campaigns
        setCampaigns(combinedCampaigns)
      } catch (error) {
        console.error("Failed to load campaigns:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  // Get a campaign by ID
  const getCampaignById = useCallback(
    (campaignId: string): Campaign | undefined => {
      return campaigns.find((campaign) => campaign.id === campaignId)
    },
    [campaigns],
  )

  // Add a new campaign to the library
  const addCampaign = async (campaign: Campaign) => {
    try {
      // Check if campaign with same ID already exists
      const existingIndex = campaigns.findIndex((camp) => camp.id === campaign.id)

      const db = await openDB()

      // Determine if this is a built-in campaign being updated or a user campaign
      const isBuiltIn = builtInCampaigns.some((camp) => camp.id === campaign.id)

      if (isBuiltIn) {
        // Update in the campaigns store
        const tx = db.transaction("campaigns", "readwrite")
        const store = tx.objectStore("campaigns")

        if (existingIndex >= 0) {
          await store.put(campaign)
        } else {
          await store.add(campaign)
        }

        await tx.done
      } else {
        // Store in the userCampaigns store
        const tx = db.transaction("userCampaigns", "readwrite")
        const store = tx.objectStore("userCampaigns")

        const userCampaign: UserCampaign = {
          id: campaign.id,
          content: campaign,
          dateAdded: Date.now(),
        }

        if (existingIndex >= 0) {
          await store.put(userCampaign)
        } else {
          await store.add(userCampaign)
        }

        await tx.done
      }

      // Update state
      if (existingIndex >= 0) {
        setCampaigns((prev) => prev.map((camp) => (camp.id === campaign.id ? campaign : camp)))
      } else {
        setCampaigns((prev) => [...prev, campaign])
      }
    } catch (error) {
      console.error("Failed to add campaign:", error)
    }
  }

  // Import campaigns from files
  const importCampaignsFromFiles = async (files: File[]) => {
    const newCampaigns: Campaign[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (isValidCampaign(data)) {
          newCampaigns.push(data)
        } else {
          errors.push(`${file.name} is not a valid campaign file`)
        }
      } catch (error) {
        errors.push(`Error reading ${file.name}: ${error}`)
      }
    }

    // Add all valid campaigns
    for (const campaign of newCampaigns) {
      await addCampaign(campaign)
    }

    return {
      success: newCampaigns.length > 0,
      added: newCampaigns.length,
      errors,
    }
  }

  // Delete a campaign from the library
  const deleteCampaign = async (campaignId: string) => {
    try {
      const db = await openDB()

      // Check if this is a built-in campaign
      const isBuiltIn = builtInCampaigns.some((camp) => camp.id === campaignId)

      if (isBuiltIn) {
        // We don't actually delete built-in campaigns, just hide them
        console.warn("Cannot delete built-in campaigns")
        return
      }

      // Delete from userCampaigns store
      const tx = db.transaction("userCampaigns", "readwrite")
      await tx.objectStore("userCampaigns").delete(campaignId)

      // Also delete any saved progress for this campaign
      const progressTx = db.transaction("campaignProgress", "readwrite")
      await progressTx.objectStore("campaignProgress").delete(campaignId)

      setCampaigns((prev) => prev.filter((camp) => camp.id !== campaignId))

      await tx.done
      await progressTx.done
    } catch (error) {
      console.error("Failed to delete campaign:", error)
    }
  }

  // Save campaign progress
  const saveCampaignProgress = useCallback(
    async (
      campaignId: string,
      currentEpisodeId: string | null,
      completedEpisodes: string[] = [],
      gameState: GameState,
    ) => {
      try {
        const campaignProgress: CampaignProgress = {
          campaignId,
          currentEpisodeId,
          completedEpisodes: completedEpisodes || [], // Ensure it's always an array
          gameState,
          timestamp: Date.now(),
        }

        const db = await openDB()
        const tx = db.transaction("campaignProgress", "readwrite")
        await tx.objectStore("campaignProgress").put(campaignProgress)
        await tx.done
      } catch (error) {
        console.error("Failed to save campaign progress:", error)
      }
    },
    [],
  )

  // Load campaign progress
  const getCampaignProgress = async (campaignId: string): Promise<CampaignProgress | null> => {
    try {
      const db = await openDB()
      const tx = db.transaction("campaignProgress", "readonly")
      const progress = await tx.objectStore("campaignProgress").get(campaignId)
      return progress || null
    } catch (error) {
      console.error("Failed to load campaign progress:", error)
      return null
    }
  }

  // Get the next episode in a campaign based on current progress and game state
  const getNextEpisodeInCampaign = useCallback(
    async (campaignId: string, currentEpisodeId: string | null, gameState: GameState): Promise<Episode | null> => {
      const campaign = getCampaignById(campaignId)
      if (!campaign) return null

      // If no current episode, return the first episode
      if (!currentEpisodeId) {
        const firstEpisode = campaign.episodes.find((ep) => ep.order === 1)
        if (!firstEpisode) return null

        return getEpisodeById(firstEpisode.episodeId)
      }

      // Get all possible next episodes (those that have the current episode as a prerequisite)
      const possibleNextEpisodes = campaign.episodes.filter((ep) => {
        // If no condition is specified, this episode is not a direct follow-up
        if (!ep.condition) return false

        // Check if this episode follows the current one
        if (ep.condition.previousEpisodeId !== currentEpisodeId) return false

        // Check flag conditions if specified
        if (ep.condition.flags) {
          for (const [flag, value] of Object.entries(ep.condition.flags)) {
            if (gameState.flags[flag] !== value) return false
          }
        }

        // Check variable conditions if specified
        if (ep.condition.variables) {
          for (const [variable, condition] of Object.entries(ep.condition.variables)) {
            const currentValue = gameState.variables[variable]

            if (typeof condition === "object") {
              if (condition.gt !== undefined && !(currentValue > condition.gt)) return false
              if (condition.lt !== undefined && !(currentValue < condition.lt)) return false
              if (condition.gte !== undefined && !(currentValue >= condition.gte)) return false
              if (condition.lte !== undefined && !(currentValue <= condition.lte)) return false
              if (condition.eq !== undefined && !(currentValue === condition.eq)) return false
              if (condition.neq !== undefined && !(currentValue !== condition.neq)) return false
            } else if (currentValue !== condition) {
              return false
            }
          }
        }

        return true
      })

      // Sort by order to get the most appropriate next episode
      possibleNextEpisodes.sort((a, b) => a.order - b.order)

      // Return the first matching episode
      if (possibleNextEpisodes.length > 0) {
        return getEpisodeById(possibleNextEpisodes[0].episodeId)
      }

      return null
    },
    [campaigns, getEpisodeById, getCampaignById],
  )

  // Prepare initial game state for an episode in a campaign
  const prepareEpisodeInitialState = useCallback(
    (campaignId: string, episodeId: string, baseGameState: GameState): GameState => {
      const campaign = getCampaignById(campaignId)
      if (!campaign) return baseGameState

      const campaignEpisode = campaign.episodes.find((ep) => ep.episodeId === episodeId)
      if (!campaignEpisode || !campaignEpisode.initialState) return baseGameState

      // Create a new game state by merging the base state with the episode's initial state
      const newGameState: GameState = {
        flags: { ...baseGameState.flags, ...campaignEpisode.initialState.flags },
        variables: { ...baseGameState.variables, ...campaignEpisode.initialState.variables },
        moduleStates: { ...baseGameState.moduleStates },
      }

      // Merge module states if provided
      if (campaignEpisode.initialState.moduleStates) {
        for (const [moduleId, moduleState] of Object.entries(campaignEpisode.initialState.moduleStates)) {
          newGameState.moduleStates[moduleId] = {
            ...newGameState.moduleStates[moduleId],
            ...moduleState,
          }
        }
      }

      return newGameState
    },
    [getCampaignById],
  )

  // Refresh campaigns from file system
  const refreshFileSystemCampaigns = async () => {
    try {
      setIsLoading(true)

      // Fetch campaigns from file system
      const response = await fetch("/api/campaigns")
      if (response.ok) {
        const data = await response.json()
        const fileSystemCampaigns = data.campaigns || []

        // Create a map of existing campaigns by ID
        const campaignMap = new Map(campaigns.map((camp) => [camp.id, camp]))

        // Add file system campaigns, replacing any with the same ID
        fileSystemCampaigns.forEach((campaign: Campaign) => {
          campaignMap.set(campaign.id, campaign)
        })

        // Convert map back to array
        const updatedCampaigns = Array.from(campaignMap.values())
        setCampaigns(updatedCampaigns)
      }
    } catch (error) {
      console.error("Failed to refresh campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    campaigns,
    isLoading,
    getCampaignById,
    addCampaign,
    deleteCampaign,
    saveCampaignProgress,
    getCampaignProgress,
    importCampaignsFromFiles,
    getNextEpisodeInCampaign,
    prepareEpisodeInitialState,
    refreshFileSystemCampaigns,
  }
}
