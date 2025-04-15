import React from "react"
import type { GameModule, ModuleUIProps } from "../types"
import { MissionSystemUI } from "@/components/modules/mission-system-ui"

export interface MissionObjective {
  id: string
  description: string
  completed: boolean
  optional: boolean
  hidden: boolean // Whether this objective is revealed to the player yet
}

export interface MissionLog {
  timestamp: number
  text: string
}

export interface MissionState {
  currentMission: {
    id: string
    title: string
    description: string
    status: "active" | "completed" | "failed"
    objectives: MissionObjective[]
    progress: number // 0-100
  } | null
  secondaryMissions: Array<{
    id: string
    title: string
    description: string
    status: "active" | "completed" | "failed"
    objectives: MissionObjective[]
    progress: number // 0-100
  }>
  missionLog: MissionLog[]
}

export class MissionModule implements GameModule {
  id = "mission"
  name = "Mission System"
  description = "Manages mission objectives, progress, and logs"
  private state: MissionState | null = null

  initialize(config?: any): MissionState {
    // Default mission configuration
    const defaultMission: MissionState = {
      currentMission: null,
      secondaryMissions: [],
      missionLog: [],
    }

    this.state = { ...defaultMission, ...config }
    return this.state
  }

  getState(): MissionState | null {
    return this.state
  }

  setState(state: MissionState): void {
    this.state = state
  }

  handleAction(action: string, payload?: any): any {
    if (!this.state) return null

    const newState = { ...this.state }

    switch (action) {
      case "START_MISSION":
        if (payload && payload.mission) {
          newState.currentMission = {
            ...payload.mission,
            status: "active",
            progress: 0,
          }

          // Add mission start to log
          newState.missionLog.push({
            timestamp: Date.now(),
            text: `Mission started: ${payload.mission.title}`,
          })
        }
        break

      case "START_SECONDARY_MISSION":
        if (payload && payload.mission) {
          newState.secondaryMissions.push({
            ...payload.mission,
            status: "active",
            progress: 0,
          })

          // Add mission start to log
          newState.missionLog.push({
            timestamp: Date.now(),
            text: `Secondary mission started: ${payload.mission.title}`,
          })
        }
        break

      case "COMPLETE_OBJECTIVE":
        if (payload && payload.objectiveId) {
          // Check primary mission
          if (newState.currentMission) {
            const objectiveIndex = newState.currentMission.objectives.findIndex((obj) => obj.id === payload.objectiveId)

            if (objectiveIndex >= 0) {
              // Mark objective as completed
              newState.currentMission.objectives[objectiveIndex].completed = true

              // Update mission progress
              const totalObjectives = newState.currentMission.objectives.filter((obj) => !obj.optional).length
              const completedObjectives = newState.currentMission.objectives.filter(
                (obj) => !obj.optional && obj.completed,
              ).length

              newState.currentMission.progress = Math.floor((completedObjectives / totalObjectives) * 100)

              // Check if all required objectives are completed
              const allRequiredCompleted = newState.currentMission.objectives.every(
                (obj) => obj.optional || obj.completed,
              )

              if (allRequiredCompleted) {
                newState.currentMission.status = "completed"

                // Add to mission log
                newState.missionLog.push({
                  timestamp: Date.now(),
                  text: `Mission completed: ${newState.currentMission.title}`,
                })
              }

              // Add to mission log
              newState.missionLog.push({
                timestamp: Date.now(),
                text: `Objective completed: ${newState.currentMission.objectives[objectiveIndex].description}`,
              })

              break
            }
          }

          // Check secondary missions
          for (let i = 0; i < newState.secondaryMissions.length; i++) {
            const mission = newState.secondaryMissions[i]
            const objectiveIndex = mission.objectives.findIndex((obj) => obj.id === payload.objectiveId)

            if (objectiveIndex >= 0) {
              // Mark objective as completed
              newState.secondaryMissions[i].objectives[objectiveIndex].completed = true

              // Update mission progress
              const totalObjectives = mission.objectives.filter((obj) => !obj.optional).length
              const completedObjectives = mission.objectives.filter((obj) => !obj.optional && obj.completed).length

              newState.secondaryMissions[i].progress = Math.floor((completedObjectives / totalObjectives) * 100)

              // Check if all required objectives are completed
              const allRequiredCompleted = mission.objectives.every((obj) => obj.optional || obj.completed)

              if (allRequiredCompleted) {
                newState.secondaryMissions[i].status = "completed"

                // Add to mission log
                newState.missionLog.push({
                  timestamp: Date.now(),
                  text: `Secondary mission completed: ${mission.title}`,
                })
              }

              // Add to mission log
              newState.missionLog.push({
                timestamp: Date.now(),
                text: `Objective completed: ${mission.objectives[objectiveIndex].description}`,
              })

              break
            }
          }
        }
        break

      case "FAIL_MISSION":
        if (payload && payload.missionId) {
          // Check primary mission
          if (newState.currentMission && newState.currentMission.id === payload.missionId) {
            newState.currentMission.status = "failed"

            // Add to mission log
            newState.missionLog.push({
              timestamp: Date.now(),
              text: `Mission failed: ${newState.currentMission.title}`,
            })
          } else {
            // Check secondary missions
            const missionIndex = newState.secondaryMissions.findIndex((mission) => mission.id === payload.missionId)

            if (missionIndex >= 0) {
              newState.secondaryMissions[missionIndex].status = "failed"

              // Add to mission log
              newState.missionLog.push({
                timestamp: Date.now(),
                text: `Secondary mission failed: ${newState.secondaryMissions[missionIndex].title}`,
              })
            }
          }
        }
        break

      case "REVEAL_OBJECTIVE":
        if (payload && payload.objectiveId) {
          // Check primary mission
          if (newState.currentMission) {
            const objectiveIndex = newState.currentMission.objectives.findIndex((obj) => obj.id === payload.objectiveId)

            if (objectiveIndex >= 0) {
              newState.currentMission.objectives[objectiveIndex].hidden = false

              // Add to mission log
              newState.missionLog.push({
                timestamp: Date.now(),
                text: `New objective: ${newState.currentMission.objectives[objectiveIndex].description}`,
              })

              break
            }
          }

          // Check secondary missions
          for (let i = 0; i < newState.secondaryMissions.length; i++) {
            const mission = newState.secondaryMissions[i]
            const objectiveIndex = mission.objectives.findIndex((obj) => obj.id === payload.objectiveId)

            if (objectiveIndex >= 0) {
              newState.secondaryMissions[i].objectives[objectiveIndex].hidden = false

              // Add to mission log
              newState.missionLog.push({
                timestamp: Date.now(),
                text: `New secondary objective: ${mission.objectives[objectiveIndex].description}`,
              })

              break
            }
          }
        }
        break

      case "ADD_LOG_ENTRY":
        if (payload && payload.text) {
          newState.missionLog.push({
            timestamp: Date.now(),
            text: payload.text,
          })
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
      case "MISSION_ACTIVE":
        if (params && params.missionId) {
          if (this.state.currentMission && this.state.currentMission.id === params.missionId) {
            return this.state.currentMission.status === "active"
          }

          return this.state.secondaryMissions.some(
            (mission) => mission.id === params.missionId && mission.status === "active",
          )
        }
        return false

      case "MISSION_COMPLETED":
        if (params && params.missionId) {
          if (this.state.currentMission && this.state.currentMission.id === params.missionId) {
            return this.state.currentMission.status === "completed"
          }

          return this.state.secondaryMissions.some(
            (mission) => mission.id === params.missionId && mission.status === "completed",
          )
        }
        return false

      case "OBJECTIVE_COMPLETED":
        if (params && params.objectiveId) {
          // Check primary mission
          if (this.state.currentMission) {
            const objective = this.state.currentMission.objectives.find((obj) => obj.id === params.objectiveId)

            if (objective) {
              return objective.completed
            }
          }

          // Check secondary missions
          for (const mission of this.state.secondaryMissions) {
            const objective = mission.objectives.find((obj) => obj.id === params.objectiveId)

            if (objective) {
              return objective.completed
            }
          }
        }
        return false

      case "MISSION_PROGRESS_ABOVE":
        if (params && params.missionId && params.threshold !== undefined) {
          if (this.state.currentMission && this.state.currentMission.id === params.missionId) {
            return this.state.currentMission.progress >= params.threshold
          }

          const mission = this.state.secondaryMissions.find((mission) => mission.id === params.missionId)

          return mission ? mission.progress >= params.threshold : false
        }
        return false

      default:
        return false
    }
  }

  getUI(props: ModuleUIProps): React.ReactNode {
    // Use createElement instead of JSX since this is a .ts file
    return React.createElement(MissionSystemUI, {
      state: props.state,
      dispatch: props.dispatch,
      isActive: props.isActive,
    })
  }
}
