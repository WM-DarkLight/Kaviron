import React from "react"
import type { GameModule, ModuleUIProps } from "../types"
import { RegistrySystemUI } from "@/components/modules/registry-system-ui"

export interface RegistryEntry {
  id: string
  name: string
  category: "species" | "starship" | "planet" | "technology" | "artifact" | "person" | "event"
  description: string
  details: Record<string, any>
  imageUrl?: string
  discovered: boolean // Whether this entry has been discovered by the player
  classified?: boolean // Whether this entry contains classified information
}

export interface RegistryState {
  entries: RegistryEntry[]
  lastAccessed?: string // ID of last accessed entry
}

export class RegistryModule implements GameModule {
  id = "registry"
  name = "Federation Database"
  description = "Access to the Federation database of species, technology, and more"
  private state: RegistryState | null = null

  initialize(config?: any): RegistryState {
    // Default registry configuration
    const defaultRegistry: RegistryState = {
      entries: [
        {
          id: "human",
          name: "Human",
          category: "species",
          description: "Native to Earth, humans are founding members of the United Federation of Planets.",
          details: {
            homeworld: "Earth",
            quadrant: "Alpha",
            biology: "Carbon-based humanoid",
            lifespan: "120 years",
            government: "United Earth Government",
          },
          discovered: true,
        },
        {
          id: "vulcan",
          name: "Vulcan",
          category: "species",
          description:
            "Founding members of the Federation known for their logical thinking and suppression of emotions.",
          details: {
            homeworld: "Vulcan",
            quadrant: "Alpha",
            biology: "Carbon-based humanoid with copper-based blood",
            lifespan: "200+ years",
            government: "Vulcan High Command",
          },
          discovered: true,
        },
        {
          id: "klingon",
          name: "Klingon",
          category: "species",
          description: "Warrior species with a strong sense of honor and tradition.",
          details: {
            homeworld: "Qo'noS",
            quadrant: "Beta",
            biology: "Carbon-based humanoid with redundant organ systems",
            lifespan: "150 years",
            government: "Klingon High Council",
          },
          discovered: true,
        },
        {
          id: "romulan",
          name: "Romulan",
          category: "species",
          description: "Secretive and cunning species that split from Vulcan society thousands of years ago.",
          details: {
            homeworld: "Romulus",
            quadrant: "Beta",
            biology: "Carbon-based humanoid with copper-based blood",
            lifespan: "200+ years",
            government: "Romulan Star Empire",
          },
          discovered: true,
        },
        {
          id: "enterprise-d",
          name: "USS Enterprise NCC-1701-D",
          category: "starship",
          description: "Galaxy-class starship and flagship of the Federation.",
          details: {
            class: "Galaxy",
            registry: "NCC-1701-D",
            crew: "1,014",
            launched: "2363",
            status: "Active",
            captain: "Jean-Luc Picard",
          },
          discovered: true,
        },
        {
          id: "warp-drive",
          name: "Warp Drive",
          category: "technology",
          description: "Propulsion system that allows faster-than-light travel.",
          details: {
            inventor: "Zefram Cochrane",
            year: "2063",
            principle: "Creates a subspace bubble that distorts spacetime",
            maxSpeed: "Warp 9.975 (Federation standard)",
          },
          discovered: true,
        },
      ],
    }

    this.state = { ...defaultRegistry, ...config }
    return this.state
  }

  getState(): RegistryState | null {
    return this.state
  }

  setState(state: RegistryState): void {
    this.state = state
  }

  handleAction(action: string, payload?: any): any {
    if (!this.state) return null

    const newState = { ...this.state }

    switch (action) {
      case "ADD_ENTRY":
        if (payload && payload.entry) {
          // Check if entry already exists
          const existingIndex = newState.entries.findIndex((entry) => entry.id === payload.entry.id)

          if (existingIndex >= 0) {
            // Update existing entry
            newState.entries[existingIndex] = {
              ...newState.entries[existingIndex],
              ...payload.entry,
            }
          } else {
            // Add new entry
            newState.entries.push(payload.entry)
          }
        }
        break

      case "DISCOVER_ENTRY":
        if (payload && payload.entryId) {
          const entryIndex = newState.entries.findIndex((entry) => entry.id === payload.entryId)

          if (entryIndex >= 0) {
            newState.entries[entryIndex] = {
              ...newState.entries[entryIndex],
              discovered: true,
            }
          }
        }
        break

      case "ACCESS_ENTRY":
        if (payload && payload.entryId) {
          newState.lastAccessed = payload.entryId
        }
        break

      case "UPDATE_ENTRY":
        if (payload && payload.entryId && payload.updates) {
          const entryIndex = newState.entries.findIndex((entry) => entry.id === payload.entryId)

          if (entryIndex >= 0) {
            newState.entries[entryIndex] = {
              ...newState.entries[entryIndex],
              ...payload.updates,
            }
          }
        }
        break

      case "DECLASSIFY_ENTRY":
        if (payload && payload.entryId) {
          const entryIndex = newState.entries.findIndex((entry) => entry.id === payload.entryId)

          if (entryIndex >= 0 && newState.entries[entryIndex].classified) {
            newState.entries[entryIndex] = {
              ...newState.entries[entryIndex],
              classified: false,
            }
          }
        }
        break

      default:
        return null
    }

    this.state = newState
    return newState
  }

  checkCondition(condition: string, params?: any): boolean {
    if (!this.state) return false

    switch (condition) {
      case "ENTRY_DISCOVERED":
        if (params && params.entryId) {
          const entry = this.state.entries.find((entry) => entry.id === params.entryId)
          return entry ? entry.discovered : false
        }
        return false

      case "ENTRY_EXISTS":
        return params && this.state.entries.some((entry) => entry.id === params.entryId)

      case "ENTRY_CLASSIFIED":
        if (params && params.entryId) {
          const entry = this.state.entries.find((entry) => entry.id === params.entryId)
          return entry ? !!entry.classified : false
        }
        return false

      case "HAS_ENTRIES_IN_CATEGORY":
        if (params && params.category) {
          return this.state.entries.some((entry) => entry.category === params.category && entry.discovered)
        }
        return false

      default:
        return false
    }
  }

  getUI(props: ModuleUIProps): React.ReactNode {
    // Use createElement instead of JSX since this is a .ts file
    return React.createElement(RegistrySystemUI, {
      state: props.state,
      dispatch: props.dispatch,
      isActive: props.isActive,
    })
  }
}
