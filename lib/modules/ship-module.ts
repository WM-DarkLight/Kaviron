import React from "react"
import type { GameModule, ModuleUIProps, ModuleActionResult, CrossModuleEffect } from "../types"
import { ShipSystemUI } from "@/components/modules/ship-system-ui"

export interface ShipState {
  name: string
  registry: string
  class: string
  systems: {
    warpDrive: {
      status: "online" | "offline" | "damaged"
      maxWarp: number
      currentWarp: number
      efficiency: number // 0-100%
    }
    impulse: {
      status: "online" | "offline" | "damaged"
      power: number // 0-100
    }
    shields: {
      status: "online" | "offline" | "damaged"
      strength: number // 0-100
      modulation: number // Shield frequency modulation
      harmonics: string // Shield harmonics pattern
    }
    weapons: {
      phasers: {
        status: "online" | "offline" | "damaged"
        power: number // 0-100
        frequency: number // Phaser frequency
        banks: number // Number of operational phaser banks
      }
      torpedoes: {
        status: "online" | "offline" | "damaged"
        count: number
        types: Array<{
          name: string
          count: number
        }>
      }
    }
    lifeSupportSystems: {
      status: "online" | "offline" | "damaged"
      efficiency: number // 0-100%
    }
    sensors: {
      status: "online" | "offline" | "damaged"
      range: number // 0-100
      resolution: number // 0-100
      modes: {
        standard: boolean
        longRange: boolean
        tactical: boolean
        scientific: boolean
      }
    }
    transporters: {
      status: "online" | "offline" | "damaged"
      range: number // 0-100
      bufferCapacity: number // Number of patterns that can be stored
    }
    computerCore: {
      status: "online" | "offline" | "damaged"
      processingPower: number // 0-100
      dataStorage: number // 0-100
    }
  }
  power: {
    total: number
    available: number
    allocated: Record<string, number>
    emergencyReserves: number // 0-100
    warpCore: {
      status: "online" | "offline" | "ejected" | "breach"
      efficiency: number // 0-100
      temperature: number // Core temperature
      dilithiumCrystals: {
        integrity: number // 0-100
        alignment: number // 0-100
      }
    }
  }
  damage: Record<string, number> // 0-100, where 0 is destroyed and 100 is perfect condition
  position: {
    sector: string
    coordinates: [number, number, number]
    heading: {
      yaw: number
      pitch: number
    }
    speed: {
      impulse: number // 0-1 (full impulse)
      warp: number // 0-9+
    }
  }
  environment: {
    internalTemperature: number
    externalTemperature: number
    radiation: number
    gravity: number
    pressure: number
    atmosphere: {
      oxygen: number
      nitrogen: number
      carbonDioxide: number
      other: number
    }
  }
  alerts: {
    current: "none" | "yellow" | "red" | "blue"
    history: Array<{
      type: "none" | "yellow" | "red" | "blue"
      timestamp: number
      reason: string
    }>
  }
}

export class ShipModule implements GameModule {
  id = "ship"
  name = "Ship Systems"
  description = "Manages ship systems, power, damage, and navigation"
  private state: ShipState | null = null

  initialize(config?: any): ShipState {
    // Default ship configuration
    const defaultShip: ShipState = {
      name: config?.name || "USS Enterprise",
      registry: config?.registry || "NCC-1701-D",
      class: config?.class || "Galaxy",
      systems: {
        warpDrive: {
          status: "online",
          maxWarp: 9,
          currentWarp: 0,
          efficiency: 100,
        },
        impulse: {
          status: "online",
          power: 100,
        },
        shields: {
          status: "online",
          strength: 100,
          modulation: 147.28,
          harmonics: "Alpha",
        },
        weapons: {
          phasers: {
            status: "online",
            power: 100,
            frequency: 1.02,
            banks: 10,
          },
          torpedoes: {
            status: "online",
            count: 250,
            types: [
              { name: "Photon", count: 200 },
              { name: "Quantum", count: 50 },
            ],
          },
        },
        lifeSupportSystems: {
          status: "online",
          efficiency: 100,
        },
        sensors: {
          status: "online",
          range: 100,
          resolution: 100,
          modes: {
            standard: true,
            longRange: true,
            tactical: true,
            scientific: true,
          },
        },
        transporters: {
          status: "online",
          range: 40000, // 40,000 km
          bufferCapacity: 8,
        },
        computerCore: {
          status: "online",
          processingPower: 100,
          dataStorage: 100,
        },
      },
      power: {
        total: 100,
        available: 20,
        allocated: {
          warpDrive: 30,
          impulse: 10,
          shields: 20,
          weapons: 10,
          lifeSupportSystems: 5,
          sensors: 3,
          transporters: 2,
          computerCore: 0,
        },
        emergencyReserves: 100,
        warpCore: {
          status: "online",
          efficiency: 100,
          temperature: 3.2, // Millions of degrees Kelvin
          dilithiumCrystals: {
            integrity: 100,
            alignment: 100,
          },
        },
      },
      damage: {
        hull: 100,
        warpDrive: 100,
        impulse: 100,
        shields: 100,
        phasers: 100,
        torpedoes: 100,
        lifeSupportSystems: 100,
        sensors: 100,
        transporters: 100,
        computerCore: 100,
      },
      position: {
        sector: config?.sector || "Alpha Quadrant",
        coordinates: config?.coordinates || [0, 0, 0],
        heading: {
          yaw: 0,
          pitch: 0,
        },
        speed: {
          impulse: 0,
          warp: 0,
        },
      },
      environment: {
        internalTemperature: 21, // Celsius
        externalTemperature: -270.45, // Space temperature
        radiation: 0.1, // Background radiation
        gravity: 1, // Earth standard
        pressure: 1, // Earth standard atmosphere
        atmosphere: {
          oxygen: 21,
          nitrogen: 78,
          carbonDioxide: 0.04,
          other: 0.96,
        },
      },
      alerts: {
        current: "none",
        history: [],
      },
    }

    this.state = { ...defaultShip, ...config }

    // Calculate available power
    if (this.state) {
      const allocatedPower = Object.values(this.state.power.allocated).reduce((sum, val) => sum + val, 0)
      this.state.power.available = this.state.power.total - allocatedPower
    }

    return this.state
  }

  getState(): ShipState | null {
    return this.state
  }

  setState(state: ShipState): void {
    this.state = state
  }

  handleAction(action: string, payload?: any): ModuleActionResult | null {
    if (!this.state) return null

    const newState = { ...this.state }
    let alert = null
    const crossModuleEffects: CrossModuleEffect[] = []

    switch (action) {
      case "SET_WARP": {
        if (payload >= 0 && payload <= newState.systems.warpDrive.maxWarp) {
          const previousWarp = newState.systems.warpDrive.currentWarp
          newState.systems.warpDrive.currentWarp = payload
          newState.position.speed.warp = payload

          // Adjust power consumption based on warp factor
          if (payload > 0) {
            // Warp power consumption follows a cubic curve (warp^3)
            const powerNeeded = Math.min(30 + Math.pow(payload, 3), 80)

            // Check if we have enough power
            if (newState.power.available + newState.power.allocated.warpDrive < powerNeeded) {
              // Not enough power, reduce other systems
              const powerShortage = powerNeeded - (newState.power.available + newState.power.allocated.warpDrive)

              // Try to take power from weapons first
              if (newState.power.allocated.weapons >= powerShortage) {
                newState.power.allocated.weapons -= powerShortage
                alert = {
                  type: "warning",
                  message: `Power diverted from weapons to warp drive. Weapon efficiency reduced.`,
                }
              } else {
                // Take power from shields
                newState.power.allocated.shields -= powerShortage
                newState.systems.shields.strength = Math.max(50, newState.systems.shields.strength - 20)
                alert = {
                  type: "warning",
                  message: `Power diverted from shields to warp drive. Shield strength reduced to ${newState.systems.shields.strength}%.`,
                }

                // Add cross-module effect to crew morale
                crossModuleEffects.push({
                  moduleId: "crew",
                  action: "BOOST_MORALE",
                  payload: { amount: -5, reason: "Power systems strained" },
                })
              }
            }

            newState.power.allocated.warpDrive = powerNeeded
            newState.power.available =
              newState.power.total - Object.values(newState.power.allocated).reduce((sum, val) => sum + val, 0)

            // Warp engagement message
            if (previousWarp === 0) {
              alert = {
                type: "info",
                message: `Warp ${payload} engaged. Estimated arrival time: ${this.calculateETA(payload)} hours.`,
              }
            }
          } else {
            // Dropping out of warp
            if (previousWarp > 0) {
              alert = {
                type: "info",
                message: "Dropping out of warp. Returning to impulse power.",
              }

              // Reduce warp drive power consumption
              newState.power.available += newState.power.allocated.warpDrive - 10
              newState.power.allocated.warpDrive = 10
            }
          }

          // Stress on the engines at high warp
          if (payload > 8) {
            const stressChance = (payload - 8) * 15 // 15% chance per warp factor above 8
            if (Math.random() * 100 < stressChance) {
              newState.damage.warpDrive -= Math.floor(Math.random() * 5) + 1

              if (newState.damage.warpDrive < 70) {
                newState.systems.warpDrive.status = "damaged"
                alert = {
                  type: "danger",
                  message: "Warning: Warp drive showing signs of stress. Recommend reducing speed.",
                }

                // Add cross-module effect to engineering crew
                crossModuleEffects.push({
                  moduleId: "crew",
                  action: "ASSIGN_TASK",
                  payload: {
                    task: "Warp Drive Maintenance",
                    department: "engineering",
                    priority: "high",
                  },
                })
              }
            }
          }
        }
        break
      }

      case "RAISE_SHIELDS": {
        if (newState.systems.shields.status !== "online") {
          newState.systems.shields.status = "online"

          // Allocate power to shields
          if (newState.power.allocated.shields < 20) {
            const additionalPower = 20 - newState.power.allocated.shields

            if (newState.power.available >= additionalPower) {
              newState.power.available -= additionalPower
              newState.power.allocated.shields = 20
            } else {
              // Not enough power, take from other systems
              const powerShortage = additionalPower - newState.power.available
              newState.power.available = 0
              newState.power.allocated.shields += newState.power.available

              // Take power from sensors
              if (newState.power.allocated.sensors >= powerShortage) {
                newState.power.allocated.sensors -= powerShortage
                alert = {
                  type: "warning",
                  message: "Power diverted from sensors to shields. Sensor range reduced.",
                }
              } else {
                // Take power from weapons
                newState.power.allocated.weapons -= powerShortage
                alert = {
                  type: "warning",
                  message: "Power diverted from weapons to shields. Weapon efficiency reduced.",
                }
              }
            }
          }

          // Add shield raising to alert history
          newState.alerts.history.push({
            type: newState.alerts.current,
            timestamp: Date.now(),
            reason: "Shields raised",
          })

          alert = alert || {
            type: "info",
            message: "Shields raised. Shield strength at " + newState.systems.shields.strength + "%.",
          }
        }
        break
      }

      case "LOWER_SHIELDS": {
        if (newState.systems.shields.status === "online") {
          newState.systems.shields.status = "offline"

          // Free up power from shields
          newState.power.available += newState.power.allocated.shields
          newState.power.allocated.shields = 5 // Keep minimal power for quick reactivation

          // Add shield lowering to alert history
          newState.alerts.history.push({
            type: newState.alerts.current,
            timestamp: Date.now(),
            reason: "Shields lowered",
          })

          alert = {
            type: "info",
            message: "Shields lowered. Power redistributed to available reserves.",
          }
        }
        break
      }

      case "FIRE_PHASERS": {
        // Check if phasers are online
        if (newState.systems.weapons.phasers.status !== "online") {
          alert = {
            type: "danger",
            message: "Unable to fire phasers. Phaser banks are offline.",
          }
          break
        }

        // Check if we have enough power
        if (newState.power.allocated.weapons < 10) {
          alert = {
            type: "danger",
            message: "Insufficient power to weapons systems. Unable to fire phasers.",
          }
          break
        }

        // Fire phasers
        const targetInfo = payload?.target ? ` at ${payload.target}` : ""
        alert = {
          type: "info",
          message: `Firing phasers${targetInfo}. Frequency: ${newState.systems.weapons.phasers.frequency} TeraHz.`,
        }

        // Chance of phaser banks overheating
        if (Math.random() * 100 < 5) {
          newState.damage.phasers -= Math.floor(Math.random() * 5) + 1

          if (newState.damage.phasers < 70) {
            alert = {
              type: "warning",
              message: "Phaser bank 3 overheating. Recommend reducing fire rate.",
            }
          }
        }

        // Reduce phaser power slightly after firing
        newState.systems.weapons.phasers.power = Math.max(80, newState.systems.weapons.phasers.power - 5)
        break
      }

      case "FIRE_TORPEDOES": {
        if (newState.systems.weapons.torpedoes.status !== "online") {
          alert = {
            type: "danger",
            message: "Torpedo launchers offline. Unable to fire.",
          }
          break
        }

        if (newState.systems.weapons.torpedoes.count <= 0) {
          alert = {
            type: "danger",
            message: "No torpedoes remaining. Unable to fire.",
          }
          break
        }

        // Determine torpedo type
        const torpedoType = payload?.type || "Photon"
        const torpedoTypeIndex = newState.systems.weapons.torpedoes.types.findIndex((t) => t.name === torpedoType)

        if (torpedoTypeIndex === -1 || newState.systems.weapons.torpedoes.types[torpedoTypeIndex].count <= 0) {
          alert = {
            type: "danger",
            message: `No ${torpedoType} torpedoes remaining. Unable to fire.`,
          }
          break
        }

        // Fire torpedo
        newState.systems.weapons.torpedoes.count -= 1
        newState.systems.weapons.torpedoes.types[torpedoTypeIndex].count -= 1

        const targetInfo = payload?.target ? ` at ${payload.target}` : ""
        alert = {
          type: "info",
          message: `${torpedoType} torpedo fired${targetInfo}. ${newState.systems.weapons.torpedoes.types[torpedoTypeIndex].count} ${torpedoType} torpedoes remaining.`,
        }
        break
      }

      case "TAKE_DAMAGE": {
        if (payload && payload.system && newState.damage[payload.system] !== undefined) {
          const damageAmount = payload.amount || Math.floor(Math.random() * 20) + 10
          newState.damage[payload.system] = Math.max(0, newState.damage[payload.system] - damageAmount)

          // If damage is severe, change system status
          if (newState.damage[payload.system] < 30) {
            // Find the correct system path and update its status
            if (payload.system === "warpDrive") {
              newState.systems.warpDrive.status = "damaged"
              if (newState.systems.warpDrive.currentWarp > 0) {
                // Force drop to impulse if warp drive is severely damaged
                newState.systems.warpDrive.currentWarp = 0
                newState.position.speed.warp = 0
                alert = {
                  type: "danger",
                  message: "Warp drive critically damaged! Dropping to impulse power.",
                }

                // Add cross-module effect to crew
                crossModuleEffects.push({
                  moduleId: "crew",
                  action: "INJURE_CREW",
                  payload: {
                    department: "engineering",
                    severity: "minor",
                    count: Math.floor(Math.random() * 3) + 1,
                  },
                })
              }
            } else if (payload.system === "impulse") {
              newState.systems.impulse.status = "damaged"
              newState.systems.impulse.power = Math.max(30, newState.systems.impulse.power - 30)
            } else if (payload.system === "shields") {
              newState.systems.shields.status = "damaged"
              newState.systems.shields.strength = Math.max(20, newState.systems.shields.strength - 40)
              alert = {
                type: "danger",
                message: `Shields critically damaged! Shield strength at ${newState.systems.shields.strength}%.`,
              }
            } else if (payload.system === "phasers") {
              newState.systems.weapons.phasers.status = "damaged"
              newState.systems.weapons.phasers.power = Math.max(30, newState.systems.weapons.phasers.power - 40)
            } else if (payload.system === "torpedoes") {
              newState.systems.weapons.torpedoes.status = "damaged"
            } else if (payload.system === "lifeSupportSystems") {
              newState.systems.lifeSupportSystems.status = "damaged"
              newState.systems.lifeSupportSystems.efficiency = Math.max(
                50,
                newState.systems.lifeSupportSystems.efficiency - 30,
              )

              // Life support damage affects crew
              crossModuleEffects.push({
                moduleId: "crew",
                action: "BOOST_MORALE",
                payload: { amount: -15, reason: "Life support systems damaged" },
              })

              alert = {
                type: "danger",
                message:
                  "Life support systems damaged! Efficiency at " +
                  newState.systems.lifeSupportSystems.efficiency +
                  "%.",
              }
            }
          } else if (newState.damage[payload.system] < 70) {
            // Moderate damage
            if (payload.system === "shields") {
              newState.systems.shields.strength = Math.max(60, newState.systems.shields.strength - 20)
              alert = {
                type: "warning",
                message: `Shields damaged. Shield strength at ${newState.systems.shields.strength}%.`,
              }
            } else if (payload.system === "warpDrive") {
              newState.systems.warpDrive.efficiency = Math.max(70, newState.systems.warpDrive.efficiency - 15)
              alert = {
                type: "warning",
                message: `Warp drive damaged. Efficiency at ${newState.systems.warpDrive.efficiency}%.`,
              }
            }
          }

          // Hull breach check for severe hull damage
          if (payload.system === "hull" && newState.damage.hull < 40) {
            alert = {
              type: "danger",
              message: "Warning: Hull integrity compromised. Possible hull breach detected.",
            }

            // Hull breach affects crew
            crossModuleEffects.push({
              moduleId: "crew",
              action: "EMERGENCY_STATIONS",
              payload: { emergency: "hull breach", location: payload.location || "unknown" },
            })
          }
        }
        break
      }

      case "REPAIR_SYSTEM": {
        if (payload && payload.system && newState.damage[payload.system] !== undefined) {
          const repairAmount = payload.amount || 10
          newState.damage[payload.system] = Math.min(100, newState.damage[payload.system] + repairAmount)

          // If repaired enough, restore system status
          if (newState.damage[payload.system] >= 70) {
            if (payload.system === "warpDrive") {
              newState.systems.warpDrive.status = "online"
              newState.systems.warpDrive.efficiency = Math.min(100, newState.systems.warpDrive.efficiency + 15)
              alert = {
                type: "success",
                message: "Warp drive repaired and back online.",
              }
            } else if (payload.system === "impulse") {
              newState.systems.impulse.status = "online"
              alert = {
                type: "success",
                message: "Impulse engines repaired and back online.",
              }
            } else if (payload.system === "shields") {
              newState.systems.shields.status = "online"
              newState.systems.shields.strength = Math.min(100, newState.systems.shields.strength + 20)
              alert = {
                type: "success",
                message: `Shields repaired. Shield strength at ${newState.systems.shields.strength}%.`,
              }
            } else if (payload.system === "phasers") {
              newState.systems.weapons.phasers.status = "online"
              alert = {
                type: "success",
                message: "Phaser banks repaired and back online.",
              }
            } else if (payload.system === "torpedoes") {
              newState.systems.weapons.torpedoes.status = "online"
              alert = {
                type: "success",
                message: "Torpedo launchers repaired and back online.",
              }
            } else if (payload.system === "lifeSupportSystems") {
              newState.systems.lifeSupportSystems.status = "online"
              newState.systems.lifeSupportSystems.efficiency = 100
              alert = {
                type: "success",
                message: "Life support systems fully repaired.",
              }

              // Improved life support boosts crew morale
              crossModuleEffects.push({
                moduleId: "crew",
                action: "BOOST_MORALE",
                payload: { amount: 10, reason: "Life support systems restored" },
              })
            }
          } else {
            alert = {
              type: "info",
              message: `${payload.system.charAt(0).toUpperCase() + payload.system.slice(1)} partially repaired. Integrity at ${newState.damage[payload.system]}%.`,
            }
          }
        }
        break
      }

      case "ALLOCATE_POWER": {
        if (
          payload &&
          payload.system &&
          newState.power.allocated[payload.system] !== undefined &&
          payload.amount >= 0
        ) {
          const currentAllocation = newState.power.allocated[payload.system]
          const requestedChange = payload.amount - currentAllocation

          if (requestedChange > 0) {
            // Requesting more power
            if (newState.power.available >= requestedChange) {
              // We have enough available power
              newState.power.allocated[payload.system] = payload.amount
              newState.power.available -= requestedChange

              alert = {
                type: "info",
                message: `Power allocation to ${payload.system} increased to ${payload.amount}%.`,
              }

              // Special effects based on system
              if (payload.system === "shields" && newState.systems.shields.status === "online") {
                newState.systems.shields.strength = Math.min(
                  100,
                  newState.systems.shields.strength + Math.floor(requestedChange / 2),
                )
              } else if (payload.system === "sensors") {
                newState.systems.sensors.range = Math.min(100, 70 + Math.floor(payload.amount / 3))
              }
            } else {
              // Not enough power available
              alert = {
                type: "warning",
                message: `Insufficient power available. Cannot allocate requested power to ${payload.system}.`,
              }
            }
          } else if (requestedChange < 0) {
            // Reducing power allocation
            newState.power.allocated[payload.system] = payload.amount
            newState.power.available += Math.abs(requestedChange)

            alert = {
              type: "info",
              message: `Power allocation to ${payload.system} reduced to ${payload.amount}%.`,
            }

            // Special effects based on system
            if (payload.system === "shields" && newState.systems.shields.status === "online") {
              newState.systems.shields.strength = Math.max(
                50,
                newState.systems.shields.strength + Math.floor(requestedChange / 2),
              )
            } else if (payload.system === "lifeSupportSystems" && payload.amount < 5) {
              alert = {
                type: "danger",
                message: "Warning: Life support systems at critical power levels.",
              }

              // Life support at critical affects crew
              crossModuleEffects.push({
                moduleId: "crew",
                action: "BOOST_MORALE",
                payload: { amount: -10, reason: "Life support power critically low" },
              })
            }
          }
        }
        break
      }

      case "SET_ALERT_STATUS": {
        if (payload && ["none", "yellow", "red", "blue"].includes(payload.status)) {
          const previousStatus = newState.alerts.current
          newState.alerts.current = payload.status

          // Add to alert history
          newState.alerts.history.push({
            type: payload.status,
            timestamp: Date.now(),
            reason: payload.reason || `Alert status changed to ${payload.status}`,
          })

          // Special handling for red alert
          if (payload.status === "red" && previousStatus !== "red") {
            // Automatically raise shields if they're not already up
            if (newState.systems.shields.status !== "online") {
              newState.systems.shields.status = "online"

              // Allocate power to shields
              const additionalPower = 20 - newState.power.allocated.shields
              if (additionalPower > 0) {
                if (newState.power.available >= additionalPower) {
                  newState.power.available -= additionalPower
                  newState.power.allocated.shields = 20
                } else {
                  // Take power from non-essential systems
                  newState.power.allocated.shields += newState.power.available
                  newState.power.available = 0
                }
              }
            }

            // Divert power to weapons
            if (newState.power.allocated.weapons < 15) {
              const additionalWeaponPower = 15 - newState.power.allocated.weapons
              if (newState.power.available >= additionalWeaponPower) {
                newState.power.available -= additionalWeaponPower
                newState.power.allocated.weapons = 15
              }
            }

            // Notify crew of red alert
            crossModuleEffects.push({
              moduleId: "crew",
              action: "BATTLE_STATIONS",
              payload: { reason: payload.reason },
            })
          }

          alert = {
            type: payload.status === "red" ? "danger" : payload.status === "yellow" ? "warning" : "info",
            message: `${payload.status.toUpperCase()} ALERT. All hands to ${payload.status === "red" ? "battle" : "alert"} stations.`,
          }
        }
        break
      }

      case "SET_POSITION": {
        if (payload) {
          if (payload.sector) {
            newState.position.sector = payload.sector
          }
          if (payload.coordinates) {
            newState.position.coordinates = payload.coordinates
          }
          if (payload.heading) {
            newState.position.heading = { ...newState.position.heading, ...payload.heading }
          }

          alert = {
            type: "info",
            message: `Position updated. Current sector: ${newState.position.sector}.`,
          }
        }
        break
      }

      case "MODULATE_SHIELDS": {
        if (payload && payload.frequency) {
          newState.systems.shields.modulation = payload.frequency

          if (payload.harmonics) {
            newState.systems.shields.harmonics = payload.harmonics
          }

          alert = {
            type: "info",
            message: `Shield frequency modulated to ${payload.frequency} ${payload.harmonics ? `with ${payload.harmonics} harmonics` : ""}.`,
          }
        }
        break
      }

      case "EJECT_WARP_CORE": {
        // This is a critical emergency action
        newState.power.warpCore.status = "ejected"

        // Lose all warp capability
        newState.systems.warpDrive.status = "offline"
        newState.systems.warpDrive.currentWarp = 0
        newState.position.speed.warp = 0

        // Massive power loss
        const warpPower = newState.power.allocated.warpDrive
        newState.power.total -= 70
        newState.power.allocated.warpDrive = 0

        // Redistribute remaining power
        const essentialSystems = ["lifeSupportSystems", "impulse", "shields"]
        essentialSystems.forEach((system) => {
          if (newState.power.allocated[system] < 10) {
            const additionalPower = Math.min(10 - newState.power.allocated[system], warpPower / 3)
            newState.power.allocated[system] += additionalPower
          }
        })

        // Recalculate available power
        newState.power.available =
          newState.power.total - Object.values(newState.power.allocated).reduce((sum, val) => sum + val, 0)

        // Major ship event - notify crew
        crossModuleEffects.push({
          moduleId: "crew",
          action: "EMERGENCY_EVACUATION",
          payload: { area: "Engineering", reason: "Warp core ejection" },
        })

        // Add to mission log
        crossModuleEffects.push({
          moduleId: "mission",
          action: "ADD_LOG_ENTRY",
          payload: { text: "EMERGENCY: Warp core ejected. Ship operating on emergency power." },
        })

        alert = {
          type: "danger",
          message: "EMERGENCY: Warp core ejected! Ship operating on emergency power systems.",
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

    switch (condition) {
      case "WARP_AVAILABLE":
        return this.state.systems.warpDrive.status === "online"

      case "SHIELDS_UP":
        return this.state.systems.shields.status === "online"

      case "SYSTEM_DAMAGED":
        return params && this.state.damage[params.system] < (params.threshold || 70)

      case "SYSTEM_CRITICAL":
        return params && this.state.damage < 30

      case "HAS_TORPEDOES":
        if (params && params.type) {
          const torpType = this.state.systems.weapons.torpedoes.types.find((t) => t.name === params.type)
          return torpType ? torpType.count > 0 : false
        }
        return this.state.systems.weapons.torpedoes.count > 0

      case "IN_SECTOR":
        return params && this.state.position.sector === params.sector

      case "AT_WARP":
        return this.state.systems.warpDrive.currentWarp > 0

      case "POWER_AVAILABLE":
        return params && this.state.power.available >= params.amount

      case "ALERT_STATUS":
        return params && this.state.alerts.current === params.status

      case "HULL_INTEGRITY_ABOVE":
        return params && this.state.damage.hull >= params.threshold

      default:
        return false
    }
  }

  getUI(props: ModuleUIProps): React.ReactNode {
    // Use createElement instead of JSX since this is a .ts file
    return React.createElement(ShipSystemUI, {
      state: props.state,
      dispatch: props.dispatch,
      isActive: props.isActive,
    })
  }

  private calculateETA(warpFactor: number): string {
    // Using Star Trek TNG warp formula: v = w^(10/3) * c
    // This is just an approximation for gameplay purposes
    if (warpFactor <= 0) return "N/A"

    // Assume a random distance between 1-10 light years
    const distance = Math.floor(Math.random() * 10) + 1

    // Calculate time in hours
    const speed = Math.pow(warpFactor, 10 / 3)
    const timeInHours = (distance / speed) * 24

    return timeInHours.toFixed(1)
  }
}
