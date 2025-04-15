import type React from "react"
export interface Episode {
  id: string
  title: string
  author: string
  description: string
  stardate: string
  shipName: string
  scenes: { [sceneId: string]: Scene }
  requiredModules?: string[]
  moduleConfig?: Record<string, any>
}

export interface Scene {
  id: string
  title: string
  text: string[]
  choices: Choice[]
}

export interface Choice {
  text: string
  nextScene: string
  setFlags?: { [flag: string]: boolean }
  setVariables?: { [variable: string]: any }
  moduleActions?: ModuleAction[]
  condition?: Condition
}

export interface ModuleAction {
  module: string
  action: string
  payload?: any
}

export interface Condition {
  flags?: { [flag: string]: boolean }
  variables?: { [variable: string]: any | ConditionRange }
  moduleConditions?: ModuleCondition[]
}

export interface ConditionRange {
  gt?: number
  lt?: number
  gte?: number
  lte?: number
  eq?: number
  neq?: number
}

export interface ModuleCondition {
  module: string
  condition: string
  params?: any
}

export interface GameState {
  flags: { [flag: string]: boolean }
  variables: { [variable: string]: any }
  moduleStates: { [moduleId: string]: any }
}

export interface Campaign {
  id: string
  title: string
  author: string
  description: string
  version?: string
  episodes: CampaignEpisode[]
}

export interface CampaignEpisode {
  episodeId: string
  title: string
  description: string
  order: number
  condition?: Condition
  initialState?: Partial<GameState>
}

export interface CampaignProgress {
  campaignId: string
  currentEpisodeId: string | null
  completedEpisodes: string[]
  gameState: GameState
  timestamp: number
}

export interface GameModule {
  id: string
  name: string
  description: string
  initialize(config?: any): any
  getState(): any | null
  setState(state: any): void
  handleAction(action: string, payload?: any): ModuleActionResult | null
  checkCondition(condition: string, params?: any): boolean
  getUI(props: ModuleUIProps): React.ReactNode
}

export interface ModuleUIProps {
  state: any
  dispatch: (action: string, payload?: any) => void
  isActive: boolean
}

export interface ModuleActionResult {
  state?: any
  alert?: {
    type: "info" | "warning" | "danger" | "success"
    message: string
  }
  crossModuleEffects?: CrossModuleEffect[]
}

export interface CrossModuleEffect {
  moduleId: string
  action: string
  payload?: any
}

export interface ModuleRegistry {
  [moduleId: string]: GameModule
}

export type ModuleType = "ship" | "crew" | "inventory" | "mission" | "registry"
