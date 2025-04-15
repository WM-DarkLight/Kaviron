"use client"

import { useState, useEffect, useCallback } from "react"
import { builtInEpisodes, isValidEpisode } from "./episodes"
import { openDB } from "./indexed-db"
import type { Episode, GameState } from "./types"

interface SavedState {
  episodeId: string
  currentSceneId: string
  gameState: GameState
  timestamp: number
}

interface UserEpisode {
  id: string
  content: Episode
  dateAdded: number
}

export function useEpisodeLibrary() {
  const [episodes, setEpisodes] = useState<Episode[]>(builtInEpisodes)
  const [isLoading, setIsLoading] = useState(true)

  // Load episodes from both file system and IndexedDB on component mount
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        setIsLoading(true)

        // Start with built-in episodes
        let combinedEpisodes = [...builtInEpisodes]

        // 1. Try to load episodes from the file system (public/episodes folder)
        try {
          const response = await fetch("/api/episodes")
          if (response.ok) {
            const data = await response.json()
            const fileSystemEpisodes = data.episodes || []

            // Create a map of existing episodes by ID
            const episodeMap = new Map(combinedEpisodes.map((ep) => [ep.id, ep]))

            // Add file system episodes, replacing any with the same ID
            fileSystemEpisodes.forEach((episode: Episode) => {
              episodeMap.set(episode.id, episode)
            })

            // Convert map back to array
            combinedEpisodes = Array.from(episodeMap.values())
          }
        } catch (error) {
          console.warn("Failed to load episodes from file system:", error)
          // Continue with other sources even if this fails
        }

        // 2. Load episodes from IndexedDB
        const db = await openDB()

        // Load user episodes from IndexedDB
        const userEpisodesStore = db.transaction("userEpisodes", "readonly").objectStore("userEpisodes")
        const userEpisodes = await userEpisodesStore.getAll()

        if (userEpisodes.length > 0) {
          // Create a map of existing episodes by ID
          const episodeMap = new Map(combinedEpisodes.map((ep) => [ep.id, ep]))

          // Add user episodes from IndexedDB, replacing any with the same ID
          userEpisodes.forEach((ue: UserEpisode) => {
            episodeMap.set(ue.id, ue.content)
          })

          // Convert map back to array
          combinedEpisodes = Array.from(episodeMap.values())
        }

        // Update state with all episodes
        setEpisodes(combinedEpisodes)
      } catch (error) {
        console.error("Failed to load episodes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisodes()
  }, [])

  // Get an episode by ID
  const getEpisodeById = useCallback(
    (episodeId: string): Episode | undefined => {
      return episodes.find((ep) => ep.id === episodeId)
    },
    [episodes],
  )

  // Add a new episode to the library
  const addEpisode = async (episode: Episode) => {
    try {
      // Check if episode with same ID already exists
      const existingIndex = episodes.findIndex((ep) => ep.id === episode.id)

      const db = await openDB()

      // Determine if this is a built-in episode being updated or a user episode
      const isBuiltIn = builtInEpisodes.some((ep) => ep.id === episode.id)

      if (isBuiltIn) {
        // Update in the episodes store
        const tx = db.transaction("episodes", "readwrite")
        const store = tx.objectStore("episodes")

        if (existingIndex >= 0) {
          await store.put(episode)
        } else {
          await store.add(episode)
        }

        await tx.done
      } else {
        // Store in the userEpisodes store
        const tx = db.transaction("userEpisodes", "readwrite")
        const store = tx.objectStore("userEpisodes")

        const userEpisode: UserEpisode = {
          id: episode.id,
          content: episode,
          dateAdded: Date.now(),
        }

        if (existingIndex >= 0) {
          await store.put(userEpisode)
        } else {
          await store.add(userEpisode)
        }

        await tx.done
      }

      // Update state
      if (existingIndex >= 0) {
        setEpisodes((prev) => prev.map((ep) => (ep.id === episode.id ? episode : ep)))
      } else {
        setEpisodes((prev) => [...prev, episode])
      }
    } catch (error) {
      console.error("Failed to add episode:", error)
    }
  }

  // Import episodes from files
  const importEpisodesFromFiles = async (files: File[]) => {
    const newEpisodes: Episode[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (isValidEpisode(data)) {
          newEpisodes.push(data)
        } else {
          errors.push(`${file.name} is not a valid episode file`)
        }
      } catch (error) {
        errors.push(`Error reading ${file.name}: ${error}`)
      }
    }

    // Add all valid episodes
    for (const episode of newEpisodes) {
      await addEpisode(episode)
    }

    return {
      success: newEpisodes.length > 0,
      added: newEpisodes.length,
      errors,
    }
  }

  // Delete an episode from the library
  const deleteEpisode = async (episodeId: string) => {
    try {
      const db = await openDB()

      // Check if this is a built-in episode
      const isBuiltIn = builtInEpisodes.some((ep) => ep.id === episodeId)

      if (isBuiltIn) {
        // We don't actually delete built-in episodes, just hide them
        console.warn("Cannot delete built-in episodes")
        return
      }

      // Delete from userEpisodes store
      const tx = db.transaction("userEpisodes", "readwrite")
      await tx.objectStore("userEpisodes").delete(episodeId)

      // Also delete any saved states for this episode
      const savedStateTx = db.transaction("savedStates", "readwrite")
      const savedStateStore = savedStateTx.objectStore("savedStates")
      const savedStateIndex = savedStateStore.index("episodeId")
      const savedStateKeys = await savedStateIndex.getAllKeys(episodeId)

      for (const key of savedStateKeys) {
        await savedStateStore.delete(key)
      }

      setEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId))

      await tx.done
      await savedStateTx.done
    } catch (error) {
      console.error("Failed to delete episode:", error)
    }
  }

  // Refresh episodes from file system
  const refreshFileSystemEpisodes = async () => {
    try {
      setIsLoading(true)

      // Fetch episodes from file system
      const response = await fetch("/api/episodes")
      if (response.ok) {
        const data = await response.json()
        const fileSystemEpisodes = data.episodes || []

        // Create a map of existing episodes by ID
        const episodeMap = new Map(episodes.map((ep) => [ep.id, ep]))

        // Add file system episodes, replacing any with the same ID
        fileSystemEpisodes.forEach((episode: Episode) => {
          episodeMap.set(episode.id, episode)
        })

        // Convert map back to array
        const updatedEpisodes = Array.from(episodeMap.values())
        setEpisodes(updatedEpisodes)
      }
    } catch (error) {
      console.error("Failed to refresh episodes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save game state
  const saveGameState = useCallback(async (episodeId: string, currentSceneId: string, gameState: GameState) => {
    try {
      const savedState: SavedState = {
        episodeId,
        currentSceneId,
        gameState,
        timestamp: Date.now(),
      }

      const db = await openDB()
      const tx = db.transaction("savedStates", "readwrite")
      await tx.objectStore("savedStates").put(savedState)
      await tx.done
    } catch (error) {
      console.error("Failed to save game state:", error)
    }
  }, [])

  // Load saved game state
  const getSavedState = async (episodeId: string): Promise<SavedState | null> => {
    try {
      const db = await openDB()
      const tx = db.transaction("savedStates", "readonly")
      const index = tx.objectStore("savedStates").index("episodeId")
      const savedStates = await index.getAll(episodeId)

      // Check if savedStates exists and is an array
      if (!savedStates || !Array.isArray(savedStates) || savedStates.length === 0) {
        return null
      }

      // Make sure we have a valid array before sorting
      const validStates = Array.isArray(savedStates) ? savedStates : [savedStates]

      // Return the most recent saved state
      return validStates.sort((a, b) => b.timestamp - a.timestamp)[0]
    } catch (error) {
      console.error("Failed to load saved game state:", error)
      return null
    }
  }

  return {
    episodes,
    isLoading,
    getEpisodeById,
    addEpisode,
    deleteEpisode,
    saveGameState,
    getSavedState,
    importEpisodesFromFiles,
    refreshFileSystemEpisodes,
  }
}
