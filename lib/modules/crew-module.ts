import React from "react"
import type { GameModule, ModuleActionResult, CrossModuleEffect, ModuleUIProps } from "../types"
import { CrewSystemUI } from "@/components/modules/crew-system-ui"

export interface CrewMember {
  id: string
  name: string
  rank: string
  department: "command" | "engineering" | "science" | "medical" | "security" | "operations"
  species: string
  skills: Record<string, number> // 0-100 skill ratings
  status: "active" | "injured" | "critical" | "deceased" | "away"
  morale: number // 0-100
  fatigue: number // 0-100, higher is more fatigued
  location: string // Current location on ship
  tasks: Array<{
    id: string
    name: string
    priority: "low" | "medium" | "high" | "critical"
    progress: number // 0-100
    timeRemaining: number // in minutes
  }>
  specialties?: string[]
  biography?: string
  personalLog?: Array<{
    stardate: string
    entry: string
  }>
}

export interface CrewState {
  captain: string // ID of captain
  officers: CrewMember[] // Senior officers
  crew: CrewMember[] // Regular crew
  awayTeam: string[] // IDs of crew on away missions
  shifts: {
    current: "alpha" | "beta" | "gamma"
    schedule: Record<string, "alpha" | "beta" | "gamma"> // crewId -> shift
  }
  departmentStatus: Record<
    string,
    {
      efficiency: number // 0-100
      staffing: number // 0-100
      morale: number // 0-100
    }
  >
  emergencies: Array<{
    id: string
    type: string
    location: string
    severity: "minor" | "major" | "critical"
    resolved: boolean
    assignedCrew: string[]
  }>
}

export class CrewModule implements GameModule {
  id = "crew"
  name = "Crew Management"
  description = "Manages crew members, skills, status, and away teams"
  private state: CrewState | null = null

  initialize(config?: any): CrewState {
    // Default crew configuration
    const defaultCrew: CrewState = {
      captain: "picard",
      officers: [
        {
          id: "picard",
          name: "Jean-Luc Picard",
          rank: "Captain",
          department: "command",
          species: "Human",
          skills: {
            leadership: 95,
            diplomacy: 90,
            tactics: 85,
            archaeology: 80,
            administration: 88,
            literature: 85,
          },
          status: "active",
          morale: 90,
          fatigue: 10,
          location: "bridge",
          tasks: [],
          specialties: ["Diplomacy", "Ancient Civilizations", "Shakespeare"],
          biography:
            "Born in La Barre, France. Former captain of the USS Stargazer. Assimilated by the Borg in 2366 and later recovered.",
        },
        {
          id: "riker",
          name: "William Riker",
          rank: "Commander",
          department: "command",
          species: "Human",
          skills: {
            leadership: 85,
            tactics: 80,
            piloting: 75,
            diplomacy: 70,
            poker: 95,
            trombone: 80,
          },
          status: "active",
          morale: 85,
          fatigue: 15,
          location: "bridge",
          tasks: [],
          specialties: ["Tactical Operations", "Away Team Command", "Jazz Music"],
          biography:
            "Born in Alaska. Served on the USS Potemkin. Turned down multiple commands to remain First Officer of the Enterprise.",
        },
        {
          id: "data",
          name: "Data",
          rank: "Lieutenant Commander",
          department: "operations",
          species: "Android",
          skills: {
            computing: 100,
            science: 95,
            engineering: 90,
            tactics: 85,
            strength: 100,
            violin: 90,
            painting: 85,
          },
          status: "active",
          morale: 100, // Data doesn't have emotions, but for gameplay purposes
          fatigue: 0, // Data doesn't get tired
          location: "bridge",
          tasks: [],
          specialties: ["Cybernetics", "Multiple Scientific Disciplines", "Creative Arts"],
          biography: "Created by Dr. Noonian Soong. Possesses a positronic brain. Strives to understand humanity.",
        },
        {
          id: "laforge",
          name: "Geordi La Forge",
          rank: "Lieutenant Commander",
          department: "engineering",
          species: "Human",
          skills: {
            engineering: 95,
            warpTheory: 90,
            problemSolving: 85,
            sensors: 90,
            computerSystems: 88,
            holodeck: 75,
          },
          status: "active",
          morale: 85,
          fatigue: 20,
          location: "engineering",
          tasks: [],
          specialties: ["Warp Propulsion Systems", "VISOR Technology", "Starship Design"],
          biography: "Born blind, uses a VISOR to see. Former helmsman before becoming Chief Engineer.",
        },
        {
          id: "worf",
          name: "Worf",
          rank: "Lieutenant",
          department: "security",
          species: "Klingon",
          skills: {
            combat: 95,
            tactics: 90,
            security: 95,
            strengthAndEndurance: 90,
            klingonCulture: 100,
            martialArts: 95,
          },
          status: "active",
          morale: 80,
          fatigue: 10,
          location: "bridge",
          tasks: [],
          specialties: ["Hand-to-hand Combat", "Klingon Culture", "Security Protocols"],
          biography: "Orphaned Klingon raised by humans. First Klingon in Starfleet. Son of Mogh.",
        },
        {
          id: "crusher",
          name: "Beverly Crusher",
          rank: "Commander",
          department: "medical",
          species: "Human",
          skills: {
            medicine: 95,
            biology: 90,
            research: 85,
            leadership: 80,
            dance: 85,
            emergency: 92,
          },
          status: "active",
          morale: 85,
          fatigue: 25,
          location: "sickbay",
          tasks: [],
          specialties: ["Surgery", "Virology", "Dance"],
          biography:
            "Widow of Jack Crusher. Mother of Wesley Crusher. Briefly left the Enterprise to head Starfleet Medical.",
        },
        {
          id: "troi",
          name: "Deanna Troi",
          rank: "Commander",
          department: "medical",
          species: "Betazoid/Human",
          skills: {
            counseling: 95,
            empathy: 95,
            diplomacy: 85,
            psychology: 90,
            culturalStudies: 80,
            piloting: 40,
          },
          status: "active",
          morale: 90,
          fatigue: 15,
          location: "bridge",
          tasks: [],
          specialties: ["Empathic Abilities", "Psychology", "Diplomatic Relations"],
          biography:
            "Half-Betazoid, half-Human. Empathic abilities allow her to sense emotions. Daughter of Lwaxana Troi.",
        },
      ],
      crew: [], // Would contain many more crew members in a real implementation
      awayTeam: [],
      shifts: {
        current: "alpha",
        schedule: {
          picard: "alpha",
          riker: "alpha",
          data: "alpha",
          laforge: "alpha",
          worf: "alpha",
          crusher: "alpha",
          troi: "alpha",
        },
      },
      departmentStatus: {
        command: {
          efficiency: 90,
          staffing: 100,
          morale: 85,
        },
        engineering: {
          efficiency: 95,
          staffing: 90,
          morale: 80,
        },
        science: {
          efficiency: 95,
          staffing: 85,
          morale: 90,
        },
        medical: {
          efficiency: 90,
          staffing: 85,
          morale: 85,
        },
        security: {
          efficiency: 95,
          staffing: 90,
          morale: 80,
        },
        operations: {
          efficiency: 100,
          staffing: 95,
          morale: 90,
        },
      },
      emergencies: [],
    }

    this.state = { ...defaultCrew, ...config }
    return this.state
  }

  getState(): CrewState | null {
    return this.state
  }

  setState(state: CrewState): void {
    this.state = state
  }

  handleAction(action: string, payload?: any): ModuleActionResult | null {
    if (!this.state) return null

    const newState = { ...this.state }
    let alert = null
    const crossModuleEffects: CrossModuleEffect[] = []

    switch (action) {
      case "FORM_AWAY_TEAM": {
        if (payload && Array.isArray(payload.crewIds)) {
          newState.awayTeam = payload.crewIds

          // Update status of crew members
          const updateCrewStatus = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (payload.crewIds.includes(crew.id)) {
                return { ...crew, status: "away", location: "away mission" }
              }
              return crew
            })
          }

          newState.officers = updateCrewStatus(newState.officers)
          newState.crew = updateCrewStatus(newState.crew)

          // Log the away team formation
          const awayTeamMembers = [...newState.officers, ...newState.crew]
            .filter((crew) => payload.crewIds.includes(crew.id))
            .map((crew) => crew.name)
            .join(", ")

          alert = {
            type: "info",
            message: `Away team formed: ${awayTeamMembers}`,
          }

          // Add cross-module effect to mission log
          crossModuleEffects.push({
            moduleId: "mission",
            action: "ADD_LOG_ENTRY",
            payload: { text: `Away team deployed: ${awayTeamMembers}` },
          })
        }
        break
      }

      case "RETURN_AWAY_TEAM": {
        // Reset away team and update crew status
        const returnLocation = payload?.location || "bridge"

        const resetCrewStatus = (crewArray: CrewMember[]) => {
          return crewArray.map((crew) => {
            if (newState.awayTeam.includes(crew.id)) {
              return {
                ...crew,
                status: "active",
                location: returnLocation,
                fatigue: Math.min(100, crew.fatigue + 15), // Away missions are tiring
              }
            }
            return crew
          })
        }

        newState.officers = resetCrewStatus(newState.officers)
        newState.crew = resetCrewStatus(newState.crew)

        // Check if any away team members were injured
        const injuredMembers = [...newState.officers, ...newState.crew]
          .filter((crew) => newState.awayTeam.includes(crew.id) && crew.status === "injured")
          .map((crew) => crew.name)
          .join(", ")

        if (injuredMembers) {
          alert = {
            type: "warning",
            message: `Away team returned with injuries: ${injuredMembers}`,
          }

          // Add cross-module effect to mission log
          crossModuleEffects.push({
            moduleId: "mission",
            action: "ADD_LOG_ENTRY",
            payload: { text: `Away team returned with injuries: ${injuredMembers}` },
          })
        } else {
          alert = {
            type: "success",
            message: "Away team returned safely",
          }

          // Add cross-module effect to mission log
          crossModuleEffects.push({
            moduleId: "mission",
            action: "ADD_LOG_ENTRY",
            payload: { text: "Away team returned safely" },
          })
        }

        newState.awayTeam = []
        break
      }

      case "INJURE_CREW": {
        if (payload) {
          let injuredCount = 0

          // Handle injuring specific crew member
          if (payload.crewId) {
            const updateInjury = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (crew.id === payload.crewId) {
                  injuredCount++
                  return {
                    ...crew,
                    status: payload.severity === "critical" ? "critical" : "injured",
                    morale: Math.max(crew.morale - 20, 0),
                  }
                }
                return crew
              })
            }

            newState.officers = updateInjury(newState.officers)
            newState.crew = updateInjury(newState.crew)
          }
          // Handle injuring by department
          else if (payload.department) {
            const updateDepartmentInjuries = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (crew.department === payload.department && crew.status === "active") {
                  // Determine if this crew member gets injured based on count/percentage
                  const shouldInjure = payload.count
                    ? injuredCount < payload.count
                    : Math.random() < (payload.percentage || 0.3) // Default 30% chance

                  if (shouldInjure) {
                    injuredCount++
                    return {
                      ...crew,
                      status: payload.severity === "critical" ? "critical" : "injured",
                      morale: Math.max(crew.morale - 20, 0),
                    }
                  }
                }
                return crew
              })
            }

            newState.officers = updateDepartmentInjuries(newState.officers)
            newState.crew = updateDepartmentInjuries(newState.crew)
          }

          // Update department efficiency based on injuries
          if (payload.department) {
            newState.departmentStatus[payload.department].efficiency = Math.max(
              50,
              newState.departmentStatus[payload.department].efficiency - 15,
            )
          }

          // Create emergency if critical injuries
          if (payload.severity === "critical" && injuredCount > 0) {
            const emergencyId = `medical-${Date.now()}`
            newState.emergencies.push({
              id: emergencyId,
              type: "medical",
              location: payload.location || "unknown",
              severity: payload.severity === "critical" ? "critical" : "major",
              resolved: false,
              assignedCrew: [],
            })

            // Notify medical department
            crossModuleEffects.push({
              moduleId: "mission",
              action: "ADD_LOG_ENTRY",
              payload: { text: `Medical emergency: ${injuredCount} crew with ${payload.severity} injuries` },
            })

            alert = {
              type: "danger",
              message: `Medical emergency: ${injuredCount} crew with ${payload.severity} injuries`,
            }
          } else if (injuredCount > 0) {
            alert = {
              type: "warning",
              message: `${injuredCount} crew member(s) injured`,
            }
          }
        }
        break
      }

      case "HEAL_CREW": {
        if (payload && payload.crewId) {
          const updateHealing = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.id === payload.crewId) {
                return {
                  ...crew,
                  status: "active",
                  morale: Math.min(crew.morale + 10, 100),
                }
              }
              return crew
            })
          }

          newState.officers = updateHealing(newState.officers)
          newState.crew = updateHealing(newState.crew)

          // Find the healed crew member
          const healedCrew = [...newState.officers, ...newState.crew].find((crew) => crew.id === payload.crewId)

          if (healedCrew) {
            alert = {
              type: "success",
              message: `${healedCrew.name} has been treated and returned to active duty`,
            }
          }
        }
        // Heal all injured crew in a department
        else if (payload && payload.department) {
          let healedCount = 0

          const healDepartment = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.department === payload.department && (crew.status === "injured" || crew.status === "critical")) {
                healedCount++
                return {
                  ...crew,
                  status: "active",
                  morale: Math.min(crew.morale + 10, 100),
                }
              }
              return crew
            })
          }

          newState.officers = healDepartment(newState.officers)
          newState.crew = healDepartment(newState.crew)

          if (healedCount > 0) {
            alert = {
              type: "success",
              message: `${healedCount} crew members from ${payload.department} department have been treated`,
            }

            // Update department efficiency
            if (newState.departmentStatus[payload.department]) {
              newState.departmentStatus[payload.department].efficiency = Math.min(
                100,
                newState.departmentStatus[payload.department].efficiency + 10,
              )
            }
          }
        }
        break
      }

      case "BOOST_MORALE": {
        if (payload) {
          let affectedCount = 0
          const boostAmount = payload.amount || 10
          const reason = payload.reason ? ` (${payload.reason})` : ""

          // Boost specific crew member
          if (payload.crewId) {
            const updateMorale = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (crew.id === payload.crewId) {
                  affectedCount++
                  return {
                    ...crew,
                    morale: Math.min(Math.max(0, crew.morale + boostAmount), 100),
                  }
                }
                return crew
              })
            }

            newState.officers = updateMorale(newState.officers)
            newState.crew = updateMorale(newState.crew)
          }
          // Boost department
          else if (payload.department) {
            const updateDepartmentMorale = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (crew.department === payload.department) {
                  affectedCount++
                  return {
                    ...crew,
                    morale: Math.min(Math.max(0, crew.morale + boostAmount), 100),
                  }
                }
                return crew
              })
            }

            newState.officers = updateDepartmentMorale(newState.officers)
            newState.crew = updateDepartmentMorale(newState.crew)

            // Update department morale stat
            if (newState.departmentStatus[payload.department]) {
              newState.departmentStatus[payload.department].morale = Math.min(
                100,
                newState.departmentStatus[payload.department].morale + Math.floor(boostAmount / 2),
              )
            }
          }
          // Boost everyone
          else {
            const updateAllMorale = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                affectedCount++
                return {
                  ...crew,
                  morale: Math.min(Math.max(0, crew.morale + boostAmount), 100),
                }
              })
            }

            newState.officers = updateAllMorale(newState.officers)
            newState.crew = updateAllMorale(newState.crew)

            // Update all department morale stats
            Object.keys(newState.departmentStatus).forEach((dept) => {
              newState.departmentStatus[dept].morale = Math.min(
                100,
                newState.departmentStatus[dept].morale + Math.floor(boostAmount / 2),
              )
            })
          }

          if (affectedCount > 0) {
            const direction = boostAmount >= 0 ? "increased" : "decreased"

            alert = {
              type: boostAmount >= 0 ? "success" : "warning",
              message: `Crew morale ${direction} for ${affectedCount} crew members${reason}`,
            }
          }
        }
        break
      }

      case "RELOCATE_CREW": {
        if (payload && payload.crewId && payload.location) {
          const updateLocation = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.id === payload.crewId) {
                return { ...crew, location: payload.location }
              }
              return crew
            })
          }

          newState.officers = updateLocation(newState.officers)
          newState.crew = updateLocation(newState.crew)

          // Find the relocated crew member
          const relocatedCrew = [...newState.officers, ...newState.crew].find((crew) => crew.id === payload.crewId)

          if (relocatedCrew) {
            alert = {
              type: "info",
              message: `${relocatedCrew.name} relocated to ${payload.location}`,
            }
          }
        }
        break
      }

      case "ASSIGN_TASK": {
        if (payload && payload.task && payload.crewId) {
          const taskId = `task-${Date.now()}`
          const priority = payload.priority || "medium"
          const timeRemaining = payload.timeRemaining || 60 // Default 60 minutes

          const assignTask = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.id === payload.crewId) {
                // Add the new task
                return {
                  ...crew,
                  tasks: [
                    ...crew.tasks,
                    {
                      id: taskId,
                      name: payload.task,
                      priority: priority,
                      progress: 0,
                      timeRemaining: timeRemaining,
                    },
                  ],
                }
              }
              return crew
            })
          }

          newState.officers = assignTask(newState.officers)
          newState.crew = assignTask(newState.crew)

          // Find the assigned crew member
          const assignedCrew = [...newState.officers, ...newState.crew].find((crew) => crew.id === payload.crewId)

          if (assignedCrew) {
            alert = {
              type: "info",
              message: `Task "${payload.task}" assigned to ${assignedCrew.name}`,
            }
          }
        }
        // Assign task to department
        else if (payload && payload.task && payload.department) {
          const taskId = `task-${Date.now()}`
          const priority = payload.priority || "medium"
          const timeRemaining = payload.timeRemaining || 60 // Default 60 minutes

          // Find the most suitable crew member in the department
          const departmentCrew = [...newState.officers, ...newState.crew].filter(
            (crew) => crew.department === payload.department && crew.status === "active",
          )

          if (departmentCrew.length > 0) {
            // Find the crew member with the fewest tasks
            const sortedCrew = [...departmentCrew].sort((a, b) => a.tasks.length - b.tasks.length)
            const selectedCrew = sortedCrew[0]

            // Assign the task
            const assignTask = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (crew.id === selectedCrew.id) {
                  return {
                    ...crew,
                    tasks: [
                      ...crew.tasks,
                      {
                        id: taskId,
                        name: payload.task,
                        priority: priority,
                        progress: 0,
                        timeRemaining: timeRemaining,
                      },
                    ],
                  }
                }
                return crew
              })
            }

            newState.officers = assignTask(newState.officers)
            newState.crew = assignTask(newState.crew)

            alert = {
              type: "info",
              message: `Task "${payload.task}" assigned to ${selectedCrew.name} in ${payload.department}`,
            }
          } else {
            alert = {
              type: "warning",
              message: `No available crew in ${payload.department} to assign task`,
            }
          }
        }
        break
      }

      case "COMPLETE_TASK": {
        if (payload && payload.taskId && payload.crewId) {
          const completeTask = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.id === payload.crewId) {
                // Remove the completed task
                return {
                  ...crew,
                  tasks: crew.tasks.filter((task) => task.id !== payload.taskId),
                  // Completing tasks reduces fatigue slightly and boosts morale
                  fatigue: Math.max(0, crew.fatigue - 5),
                  morale: Math.min(100, crew.morale + 5),
                }
              }
              return crew
            })
          }

          newState.officers = completeTask(newState.officers)
          newState.crew = completeTask(newState.crew)

          // Find the crew member
          const crewMember = [...newState.officers, ...newState.crew].find((crew) => crew.id === payload.crewId)

          if (crewMember) {
            // Find the task name (before it was removed)
            const taskName =
              [...this.state.officers, ...this.state.crew]
                .find((crew) => crew.id === payload.crewId)
                ?.tasks.find((task) => task.id === payload.taskId)?.name || "task"

            alert = {
              type: "success",
              message: `${crewMember.name} completed "${taskName}"`,
            }
          }
        }
        break
      }

      case "CHANGE_SHIFT": {
        if (payload && payload.shift && ["alpha", "beta", "gamma"].includes(payload.shift)) {
          const previousShift = newState.shifts.current
          newState.shifts.current = payload.shift

          // Update crew fatigue based on shift change
          const updateFatigue = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              // If crew is on the new shift, they're just starting work
              if (newState.shifts.schedule[crew.id] === payload.shift) {
                return {
                  ...crew,
                  fatigue: Math.max(0, crew.fatigue - 10), // Starting shift refreshed
                }
              }
              // If crew was on the previous shift, they're ending work
              else if (newState.shifts.schedule[crew.id] === previousShift) {
                return {
                  ...crew,
                  fatigue: Math.min(100, crew.fatigue + 15), // Ending shift tired
                }
              }
              return crew
            })
          }

          newState.officers = updateFatigue(newState.officers)
          newState.crew = updateFatigue(newState.crew)

          alert = {
            type: "info",
            message: `Shift changed from ${previousShift} to ${payload.shift}`,
          }
        }
        break
      }

      case "BATTLE_STATIONS": {
        // Called during red alert

        // Move crew to battle stations
        const moveToBattleStations = (crewArray: CrewMember[]) => {
          return crewArray.map((crew) => {
            let battleStation

            // Assign battle stations based on department
            switch (crew.department) {
              case "command":
                battleStation = "bridge"
                break
              case "engineering":
                battleStation = "engineering"
                break
              case "security":
                battleStation = crew.location === "bridge" ? "bridge" : "security"
                break
              case "medical":
                battleStation = "sickbay"
                break
              default:
                battleStation = crew.location // Stay where they are
            }

            return {
              ...crew,
              location: battleStation,
              // Battle stations increases fatigue but also focus
              fatigue: Math.min(100, crew.fatigue + 10),
            }
          })
        }

        newState.officers = moveToBattleStations(newState.officers)
        newState.crew = moveToBattleStations(newState.crew)

        // Increase department efficiency for security and tactical
        if (newState.departmentStatus.security) {
          newState.departmentStatus.security.efficiency = Math.min(
            100,
            newState.departmentStatus.security.efficiency + 10,
          )
        }

        alert = {
          type: "danger",
          message: "All hands to battle stations!",
        }

        break
      }

      case "EMERGENCY_STATIONS": {
        if (payload && payload.emergency) {
          const emergencyId = `emergency-${Date.now()}`
          const location = payload.location || "unknown"

          // Create a new emergency
          newState.emergencies.push({
            id: emergencyId,
            type: payload.emergency,
            location: location,
            severity: payload.severity || "major",
            resolved: false,
            assignedCrew: [],
          })

          // Assign appropriate crew to handle the emergency
          let departmentNeeded
          switch (payload.emergency) {
            case "hull breach":
            case "structural":
              departmentNeeded = "engineering"
              break
            case "medical":
              departmentNeeded = "medical"
              break
            case "security":
            case "intruder":
              departmentNeeded = "security"
              break
            default:
              departmentNeeded = "operations"
          }

          // Find available crew from the needed department
          const availableCrew = [...newState.officers, ...newState.crew].filter(
            (crew) =>
              crew.department === departmentNeeded && crew.status === "active" && crew.location !== "away mission",
          )

          // Assign up to 3 crew members to the emergency
          const assignedCrewIds = availableCrew.slice(0, 3).map((crew) => crew.id)

          if (assignedCrewIds.length > 0) {
            // Update the emergency with assigned crew
            newState.emergencies[newState.emergencies.length - 1].assignedCrew = assignedCrewIds

            // Update crew locations
            const updateLocations = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (assignedCrewIds.includes(crew.id)) {
                  return {
                    ...crew,
                    location: location,
                    // Emergencies are stressful
                    fatigue: Math.min(100, crew.fatigue + 15),
                  }
                }
                return crew
              })
            }

            newState.officers = updateLocations(newState.officers)
            newState.crew = updateLocations(newState.crew)

            const assignedNames = assignedCrewIds
              .map((id) => [...newState.officers, ...newState.crew].find((c) => c.id === id)?.name)
              .join(", ")

            alert = {
              type: "danger",
              message: `Emergency: ${payload.emergency} in ${location}. ${assignedNames} responding.`,
            }
          } else {
            alert = {
              type: "danger",
              message: `Emergency: ${payload.emergency} in ${location}. No available crew to respond!`,
            }
          }
        }
        break
      }

      case "RESOLVE_EMERGENCY": {
        if (payload && payload.emergencyId) {
          // Find the emergency
          const emergencyIndex = newState.emergencies.findIndex((e) => e.id === payload.emergencyId)

          if (emergencyIndex >= 0) {
            // Mark as resolved
            newState.emergencies[emergencyIndex].resolved = true

            // Return assigned crew to their departments
            const assignedCrewIds = newState.emergencies[emergencyIndex].assignedCrew
            const emergencyType = newState.emergencies[emergencyIndex].type

            const returnCrew = (crewArray: CrewMember[]) => {
              return crewArray.map((crew) => {
                if (assignedCrewIds.includes(crew.id)) {
                  let returnLocation

                  // Return to appropriate location based on department
                  switch (crew.department) {
                    case "command":
                      returnLocation = "bridge"
                      break
                    case "engineering":
                      returnLocation = "engineering"
                      break
                    case "medical":
                      returnLocation = "sickbay"
                      break
                    case "security":
                      returnLocation = "security"
                      break
                    default:
                      returnLocation = "main deck"
                  }

                  return {
                    ...crew,
                    location: returnLocation,
                    // Successfully resolving emergencies boosts morale
                    morale: Math.min(100, crew.morale + 5),
                  }
                }
                return crew
              })
            }

            newState.officers = returnCrew(newState.officers)
            newState.crew = returnCrew(newState.crew)

            alert = {
              type: "success",
              message: `Emergency resolved: ${emergencyType}`,
            }
          }
        }
        break
      }

      case "REST_CREW": {
        if (payload && payload.crewId) {
          // Allow a specific crew member to rest
          const restCrew = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.id === payload.crewId) {
                return {
                  ...crew,
                  fatigue: Math.max(0, crew.fatigue - 30),
                  morale: Math.min(100, crew.morale + 5),
                }
              }
              return crew
            })
          }

          newState.officers = restCrew(newState.officers)
          newState.crew = restCrew(newState.crew)

          const restedCrew = [...newState.officers, ...newState.crew].find((c) => c.id === payload.crewId)

          if (restedCrew) {
            alert = {
              type: "info",
              message: `${restedCrew.name} has rested and recovered.`,
            }
          }
        }
        // Rest an entire department
        else if (payload && payload.department) {
          const restDepartment = (crewArray: CrewMember[]) => {
            return crewArray.map((crew) => {
              if (crew.department === payload.department) {
                return {
                  ...crew,
                  fatigue: Math.max(0, crew.fatigue - 20),
                  morale: Math.min(100, crew.morale + 3),
                }
              }
              return crew
            })
          }

          newState.officers = restDepartment(newState.officers)
          newState.crew = restDepartment(newState.crew)

          // Update department efficiency
          if (newState.departmentStatus[payload.department]) {
            newState.departmentStatus[payload.department].efficiency = Math.min(
              100,
              newState.departmentStatus[payload.department].efficiency + 5,
            )
          }

          alert = {
            type: "success",
            message: `${payload.department} department crew have been given rest rotation.`,
          }
        }
        break
      }

      default:
        return null
    }

    this.state = newState

    return {
      state: newState,
      alert: alert,
      crossModuleEffects: crossModuleEffects.length > 0 ? crossModuleEffects : undefined,
    }
  }

  checkCondition(condition: string, params?: any): boolean {
    if (!this.state) return false

    const findCrewMember = (id: string): CrewMember | undefined => {
      return [...this.state.officers, ...this.state.crew].find((crew) => crew.id === id)
    }

    switch (condition) {
      case "CREW_AVAILABLE":
        return params && findCrewMember(params.crewId)?.status === "active"

      case "CREW_INJURED":
        return params && ["injured", "critical"].includes(findCrewMember(params.crewId)?.status || "")

      case "ON_AWAY_MISSION":
        return params && this.state.awayTeam.includes(params.crewId)

      case "HAS_SKILL":
        const crewMember = params && findCrewMember(params.crewId)
        return (
          crewMember &&
          crewMember.skills[params.skill] !== undefined &&
          crewMember.skills[params.skill] >= (params.level || 0)
        )

      case "MORALE_ABOVE":
        const crew = params && findCrewMember(params.crewId)
        return crew && crew.morale >= params.level

      case "DEPARTMENT_EFFICIENCY_ABOVE":
        return (
          params &&
          this.state.departmentStatus[params.department] &&
          this.state.departmentStatus[params.department].efficiency >= params.level
        )

      case "IN_LOCATION":
        return params && findCrewMember(params.crewId)?.location === params.location

      case "DEPARTMENT_AVAILABLE":
        // Check if a department has enough active crew
        if (params && params.department) {
          const departmentCrew = [...this.state.officers, ...this.state.crew].filter(
            (crew) => crew.department === params.department && crew.status === "active",
          )
          return departmentCrew.length >= (params.count || 1)
        }
        return false

      case "HAS_EMERGENCY":
        // Check if there are active emergencies
        if (params && params.type) {
          return this.state.emergencies.some((e) => e.type === params.type && !e.resolved)
        }
        return this.state.emergencies.some((e) => !e.resolved)

      case "FATIGUE_BELOW":
        const crewForFatigue = params && findCrewMember(params.crewId)
        return crewForFatigue && crewForFatigue.fatigue < params.level

      default:
        return false
    }
  }

  getUI(props: ModuleUIProps): React.ReactNode {
    // Use createElement instead of JSX since this is a .ts file
    return React.createElement(CrewSystemUI, {
      state: props.state,
      dispatch: props.dispatch,
      isActive: props.isActive,
    })
  }
}
