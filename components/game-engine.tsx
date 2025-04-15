"use client"

import { useState, useEffect, useRef } from "react"
import { LcarsLayout } from "./lcars/lcars-layout"
import { ModulePanel } from "./module-panel"
import { GameAlert } from "./game-alert"
import { useEpisodeLibrary } from "@/lib/use-episode-library"
import { getAvailableModules, initializeModules } from "@/lib/modules/module-registry"
import type { Episode, Scene, GameState, Choice, GameModule } from "@/lib/types"
import { ThemedSceneDisplay } from "@/components/themed-scene-display"
import { ThemedChoiceButtons } from "@/components/themed-choice-buttons"

interface GameEngineProps {
  episode: Episode
  initialSceneId?: string
  initialGameState?: GameState
  onExitGame: () => void
}

export function GameEngine({ episode, initialSceneId = "start", initialGameState, onExitGame }: GameEngineProps) {
  const [currentSceneId, setCurrentSceneId] = useState<string>(initialSceneId)
  const [gameState, setGameState] = useState<GameState>(
    initialGameState || {
      flags: {},
      variables: {},
      moduleStates: {},
    },
  )
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeModules, setActiveModules] = useState<Record<string, GameModule>>({})
  const [alert, setAlert] = useState<{ type: "info" | "warning" | "danger" | "success"; message: string } | null>(null)
  const [moduleInteractions, setModuleInteractions] = useState<
    Array<{ moduleId: string; action: string; result: any }>
  >([])
  const { saveGameState } = useEpisodeLibrary()
  const modulesInitializedRef = useRef<boolean>(false)
  const [sceneDisplayed, setSceneDisplayed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Get the current scene based on the scene ID
  const currentScene = episode.scenes[currentSceneId]

  // Initialize modules when the episode loads
  useEffect(() => {
    if (modulesInitializedRef.current) return

    const availableModules = getAvailableModules()
    const requiredModules = episode.requiredModules || []

    // Filter only the modules required by this episode
    const filteredModules: Record<string, GameModule> = {}
    requiredModules.forEach((moduleId) => {
      if (availableModules[moduleId]) {
        filteredModules[moduleId] = availableModules[moduleId]
      }
    })

    setActiveModules(filteredModules)

    // Initialize module states if they don't exist
    if (!gameState.moduleStates || Object.keys(gameState.moduleStates).length === 0) {
      const initializedModuleStates = initializeModules(requiredModules, episode.moduleConfig)

      setGameState((prev) => ({
        ...prev,
        moduleStates: initializedModuleStates,
      }))
    }

    modulesInitializedRef.current = true
  }, [episode.requiredModules, episode.moduleConfig, gameState.moduleStates])

  // Auto-save when scene changes
  useEffect(() => {
    saveGameState(episode.id, currentSceneId, gameState)
  }, [currentSceneId, gameState, episode.id, saveGameState])

  // Process cross-module effects
  const processCrossModuleEffects = (effects: Array<{ moduleId: string; action: string; payload?: any }>) => {
    const updatedModuleStates = { ...gameState.moduleStates }
    const interactions: Array<{ moduleId: string; action: string; result: any }> = []

    effects.forEach((effect) => {
      const module = activeModules[effect.moduleId]
      if (module) {
        const actionResult = module.handleAction(effect.action, effect.payload)

        // Record the interaction
        interactions.push({
          moduleId: effect.moduleId,
          action: effect.action,
          result: actionResult,
        })

        // Update module state if returned
        if (actionResult && actionResult.state) {
          updatedModuleStates[effect.moduleId] = actionResult.state
        }

        // Show alert if returned
        if (actionResult && actionResult.alert) {
          setAlert(actionResult.alert)
          // Auto-dismiss alert after 5 seconds
          setTimeout(() => setAlert(null), 5000)
        }

        // Process nested cross-module effects
        if (actionResult && actionResult.crossModuleEffects) {
          processCrossModuleEffects(actionResult.crossModuleEffects)
        }
      }
    })

    // Update game state with all module state changes
    setGameState((prev) => ({
      ...prev,
      moduleStates: updatedModuleStates,
    }))

    // Add to module interactions history
    setModuleInteractions((prev) => [...prev, ...interactions])
  }

  // Handle player choice
  const handleChoice = (choice: Choice) => {
    // Update flags if specified
    if (choice.setFlags) {
      setGameState((prev) => ({
        ...prev,
        flags: { ...prev.flags, ...choice.setFlags },
      }))
    }

    // Update variables if specified
    if (choice.setVariables) {
      setGameState((prev) => ({
        ...prev,
        variables: { ...prev.variables, ...choice.setVariables },
      }))
    }

    // Handle module actions if specified
    if (choice.moduleActions && choice.moduleActions.length > 0) {
      const updatedModuleStates = { ...gameState.moduleStates }
      let alertToShow = null
      const interactions: Array<{ moduleId: string; action: string; result: any }> = []
      const crossModuleEffects: Array<{ moduleId: string; action: string; payload?: any }> = []

      choice.moduleActions.forEach((moduleAction) => {
        const module = activeModules[moduleAction.module]
        if (module) {
          const actionResult = module.handleAction(moduleAction.action, moduleAction.payload)

          // Record the interaction
          interactions.push({
            moduleId: moduleAction.module,
            action: moduleAction.action,
            result: actionResult,
          })

          // Check if the action returned a state update
          if (actionResult && actionResult.state) {
            updatedModuleStates[moduleAction.module] = actionResult.state
          }

          // Check if the action returned an alert
          if (actionResult && actionResult.alert) {
            alertToShow = actionResult.alert
          }

          // Collect cross-module effects
          if (actionResult && actionResult.crossModuleEffects) {
            crossModuleEffects.push(...actionResult.crossModuleEffects)
          }
        }
      })

      setGameState((prev) => ({
        ...prev,
        moduleStates: updatedModuleStates,
      }))

      // Add to module interactions history
      setModuleInteractions((prev) => [...prev, ...interactions])

      // Show alert if one was returned
      if (alertToShow) {
        setAlert(alertToShow)
        // Auto-dismiss alert after 5 seconds
        setTimeout(() => setAlert(null), 5000)
      }

      // Process any cross-module effects
      if (crossModuleEffects.length > 0) {
        processCrossModuleEffects(crossModuleEffects)
      }
    }

    // Navigate to the next scene
    setCurrentSceneId(choice.nextScene)
    setSceneDisplayed(false)
    setIsTransitioning(true)
  }

  // Filter choices based on conditions
  const getAvailableChoices = (scene: Scene) => {
    return scene.choices.filter((choice) => {
      // If there's no condition, the choice is always available
      if (!choice.condition) return true

      // Check flag conditions
      if (choice.condition.flags) {
        for (const [flag, value] of Object.entries(choice.condition.flags)) {
          if (gameState.flags[flag] !== value) return false
        }
      }

      // Check variable conditions
      if (choice.condition.variables) {
        for (const [variable, condition] of Object.entries(choice.condition.variables)) {
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

      // Check module conditions
      if (choice.condition.moduleConditions) {
        for (const moduleCondition of choice.condition.moduleConditions) {
          const module = activeModules[moduleCondition.module]
          if (!module) return false

          const conditionMet = module.checkCondition(moduleCondition.condition, moduleCondition.params)

          if (!conditionMet) return false
        }
      }

      return true
    })
  }

  // Handle save game
  const handleSaveGame = () => {
    saveGameState(episode.id, currentSceneId, gameState)
    setAlert({
      type: "success",
      message: "Game saved successfully!",
    })
    setTimeout(() => setAlert(null), 3000)
  }

  // Handle module action
  const handleModuleAction = (moduleId: string, action: string, payload?: any) => {
    const module = activeModules[moduleId]
    if (module) {
      const actionResult = module.handleAction(action, payload)

      // Record the interaction
      setModuleInteractions((prev) => [
        ...prev,
        {
          moduleId,
          action,
          result: actionResult,
        },
      ])

      if (actionResult) {
        // Update module state if returned
        if (actionResult.state) {
          setGameState((prev) => ({
            ...prev,
            moduleStates: {
              ...prev.moduleStates,
              [moduleId]: actionResult.state,
            },
          }))
        }

        // Show alert if returned
        if (actionResult.alert) {
          setAlert(actionResult.alert)
          setTimeout(() => setAlert(null), 5000)
        }

        // Handle cross-module effects
        if (actionResult.crossModuleEffects && actionResult.crossModuleEffects.length > 0) {
          processCrossModuleEffects(actionResult.crossModuleEffects)
        }
      }
    }
  }

  // Handle module change
  const handleModuleChange = (moduleId: string | null) => {
    setActiveModule(moduleId)
  }

  // Handle alert dismissal
  const handleDismissAlert = () => {
    setAlert(null)
  }

  const handleSceneDisplayed = () => {
    setSceneDisplayed(true)
    setIsTransitioning(false)
  }

  const handleChoiceSelected = (choice: Choice) => {
    handleChoice(choice)
  }

  if (!currentScene) {
    return <div className="text-white">Error: Scene not found</div>
  }

  const availableChoices = getAvailableChoices(currentScene)

  return (
    <LcarsLayout
      episode={episode}
      gameState={gameState}
      currentSceneId={currentSceneId}
      activeModule={activeModule}
      onModuleChange={handleModuleChange}
      onSave={handleSaveGame}
      onExit={onExitGame}
    >
      {alert && <GameAlert type={alert.type} message={alert.message} onDismiss={handleDismissAlert} />}

      {activeModule ? (
        <ModulePanel
          modules={{ [activeModule]: activeModules[activeModule] }}
          moduleStates={gameState.moduleStates}
          onModuleAction={handleModuleAction}
        />
      ) : (
        <div className="p-4">
          <ThemedSceneDisplay scene={currentScene} onSceneDisplayed={handleSceneDisplayed} />
          <div className="mt-6">
            <ThemedChoiceButtons
              choices={currentScene.choices}
              onChoiceSelected={handleChoiceSelected}
              disabled={!sceneDisplayed || isTransitioning}
            />
          </div>
        </div>
      )}
    </LcarsLayout>
  )
}
