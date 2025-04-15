import React from "react"
import type { GameModule, ModuleActionResult, CrossModuleEffect, ModuleUIProps } from "../types"
import { InventorySystemUI } from "@/components/modules/inventory-system-ui"

export interface InventoryItem {
  id: string
  name: string
  description: string
  type: "weapon" | "tool" | "medical" | "artifact" | "resource" | "communication" | "misc"
  quantity: number
  properties?: Record<string, any> // Special properties of the item
  location?: string // Where the item is stored (e.g., "cargo bay", "engineering")
  assignedTo?: string // ID of crew member if assigned
  rarity?: "common" | "uncommon" | "rare" | "unique"
  weight?: number // Weight in kg
  size?: "tiny" | "small" | "medium" | "large" | "huge"
  usable?: boolean // Whether the item can be used
  consumable?: boolean // Whether the item is consumed on use
  durability?: {
    current: number
    max: number
  }
  effects?: Array<{
    type: string
    target: string
    value: number | string | boolean
    duration?: number // Duration in minutes
  }>
}

export interface InventoryState {
  items: InventoryItem[]
  capacity: number // Maximum number of different items
  totalItems: number // Total count of all items
  totalWeight: number // Total weight of all items
  locations: Record<
    string,
    {
      name: string
      capacity: number
      currentItems: number
      securityLevel?: "low" | "medium" | "high"
      accessibleTo?: string[] // Departments or specific crew IDs
    }
  >
  replicatorTemplates: string[] // Items that can be replicated
  replicatorEnergy: number // 0-100
}

export class InventoryModule implements GameModule {
  id = "inventory"
  name = "Inventory Management"
  description = "Manages ship inventory, equipment, and resources"
  private state: InventoryState | null = null

  initialize(config?: any): InventoryState {
    // Default inventory configuration
    const defaultInventory: InventoryState = {
      items: [
        {
          id: "phaser-type2",
          name: "Type-2 Phaser",
          description: "Standard Starfleet hand phaser with multiple settings from stun to kill.",
          type: "weapon",
          quantity: 25,
          properties: {
            settings: ["stun", "kill", "heat", "disintegrate"],
            powerLevel: 100,
            maxRange: 50, // meters
            accuracy: 95,
          },
          location: "weapons locker",
          rarity: "common",
          weight: 0.3,
          size: "small",
          usable: true,
          durability: {
            current: 100,
            max: 100,
          },
          effects: [
            {
              type: "damage",
              target: "organic",
              value: 50,
            },
            {
              type: "stun",
              target: "organic",
              value: 30,
              duration: 10,
            },
          ],
        },
        {
          id: "tricorder",
          name: "Tricorder",
          description: "Multipurpose scientific analysis and scanning device.",
          type: "tool",
          quantity: 15,
          properties: {
            scanRange: 100,
            accuracy: 95,
            modes: ["biological", "geological", "meteorological", "physical"],
          },
          location: "science lab",
          rarity: "common",
          weight: 0.5,
          size: "small",
          usable: true,
          durability: {
            current: 100,
            max: 100,
          },
        },
        {
          id: "medical-kit",
          name: "Medical Kit",
          description: "Standard medical field kit with basic supplies and diagnostic tools.",
          type: "medical",
          quantity: 10,
          properties: {
            treatments: ["wounds", "burns", "infections", "basic surgery"],
            charges: 20,
          },
          location: "sickbay",
          rarity: "common",
          weight: 2.0,
          size: "medium",
          usable: true,
          consumable: true,
          effects: [
            {
              type: "heal",
              target: "organic",
              value: 30,
            },
          ],
        },
        {
          id: "communicator",
          name: "Communicator Badge",
          description: "Standard Starfleet communicator for ship-to-person and person-to-person communication.",
          type: "communication",
          quantity: 50,
          properties: {
            range: "planetary",
            encryption: "standard",
            tracking: true,
          },
          location: "quartermaster",
          rarity: "common",
          weight: 0.05,
          size: "tiny",
          usable: true,
        },
        {
          id: "pattern-enhancer",
          name: "Transporter Pattern Enhancer",
          description: "Device that improves transporter signal in difficult environments.",
          type: "tool",
          quantity: 9, // Sets of 3
          properties: {
            range: 500,
            reliability: 90,
          },
          location: "transporter room",
          rarity: "uncommon",
          weight: 1.5,
          size: "medium",
          usable: true,
        },
        {
          id: "dilithium-crystal",
          name: "Dilithium Crystal",
          description: "Rare mineral used to regulate matter/antimatter reactions in warp cores.",
          type: "resource",
          quantity: 3,
          properties: {
            purity: 98.7,
            stability: 99.2,
            halfLife: 1.5, // years
          },
          location: "engineering secure storage",
          rarity: "rare",
          weight: 5.0,
          size: "small",
        },
        {
          id: "emergency-ration",
          name: "Emergency Ration Pack",
          description: "Concentrated food supplies for emergency situations.",
          type: "resource",
          quantity: 100,
          properties: {
            calories: 3000,
            servings: 1,
            shelfLife: 10, // years
          },
          location: "cargo bay",
          rarity: "common",
          weight: 0.5,
          size: "small",
          usable: true,
          consumable: true,
          effects: [
            {
              type: "nutrition",
              target: "organic",
              value: 100,
            },
          ],
        },
        {
          id: "class-3-probe",
          name: "Class 3 Probe",
          description: "Standard long-range sensor probe for scientific and tactical reconnaissance.",
          type: "tool",
          quantity: 12,
          properties: {
            range: 5000000, // km
            sensors: ["subspace", "graviton", "electromagnetic"],
            transmissionPower: 95,
          },
          location: "shuttle bay",
          rarity: "uncommon",
          weight: 150,
          size: "large",
          usable: true,
          consumable: true,
        },
      ],
      capacity: 1000,
      totalItems: 224, // Sum of all quantities
      totalWeight: 362.5, // Total weight in kg
      locations: {
        "weapons locker": {
          name: "Weapons Locker",
          capacity: 100,
          currentItems: 25,
          securityLevel: "high",
          accessibleTo: ["security", "command"],
        },
        "science lab": {
          name: "Science Lab",
          capacity: 200,
          currentItems: 15,
          securityLevel: "medium",
          accessibleTo: ["science", "command"],
        },
        sickbay: {
          name: "Sickbay",
          capacity: 150,
          currentItems: 10,
          securityLevel: "medium",
          accessibleTo: ["medical", "command"],
        },
        quartermaster: {
          name: "Quartermaster's Office",
          capacity: 300,
          currentItems: 50,
          securityLevel: "low",
          accessibleTo: ["operations", "command"],
        },
        "transporter room": {
          name: "Transporter Room",
          capacity: 50,
          currentItems: 9,
          securityLevel: "medium",
          accessibleTo: ["operations", "engineering", "command"],
        },
        "engineering secure storage": {
          name: "Engineering Secure Storage",
          capacity: 100,
          currentItems: 3,
          securityLevel: "high",
          accessibleTo: ["engineering", "command"],
        },
        "cargo bay": {
          name: "Main Cargo Bay",
          capacity: 5000,
          currentItems: 100,
          securityLevel: "low",
        },
        "shuttle bay": {
          name: "Shuttle Bay",
          capacity: 1000,
          currentItems: 12,
          securityLevel: "medium",
          accessibleTo: ["operations", "command"],
        },
        "personal equipment": {
          name: "Personal Equipment",
          capacity: 500,
          currentItems: 0,
          securityLevel: "low",
        },
      },
      replicatorTemplates: ["emergency-ration", "communicator", "uniform", "water", "basic-tools"],
      replicatorEnergy: 100,
    }

    this.state = { ...defaultInventory, ...config }
    return this.state
  }

  getState(): InventoryState | null {
    return this.state
  }

  setState(state: InventoryState): void {
    this.state = state
  }

  handleAction(action: string, payload?: any): ModuleActionResult | null {
    if (!this.state) return null

    const newState = { ...this.state }
    let alert = null
    const crossModuleEffects: CrossModuleEffect[] = []

    switch (action) {
      case "ADD_ITEM": {
        if (payload && payload.item) {
          const existingItemIndex = newState.items.findIndex((item) => item.id === payload.item.id)

          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...newState.items]
            const oldQuantity = updatedItems[existingItemIndex].quantity
            const addQuantity = payload.item.quantity || 1

            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: oldQuantity + addQuantity,
            }
            newState.items = updatedItems

            // Update location count
            const location = updatedItems[existingItemIndex].location
            if (location && newState.locations[location]) {
              newState.locations[location].currentItems += addQuantity
            }

            alert = {
              type: "success",
              message: `Added ${addQuantity} ${updatedItems[existingItemIndex].name}(s) to inventory.`,
            }
          } else {
            // Add new item
            const newItem = {
              ...payload.item,
              quantity: payload.item.quantity || 1,
            }
            newState.items.push(newItem)

            // Update location count
            const location = newItem.location
            if (location && newState.locations[location]) {
              newState.locations[location].currentItems += newItem.quantity
            }

            alert = {
              type: "success",
              message: `Added new item: ${newItem.name} to inventory.`,
            }
          }

          // Update total count and weight
          newState.totalItems = newState.items.reduce((sum, item) => sum + item.quantity, 0)
          newState.totalWeight = newState.items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)

          // Check if we're approaching capacity
          if (newState.totalItems > newState.capacity * 0.9) {
            alert = {
              type: "warning",
              message: `Inventory at ${Math.round((newState.totalItems / newState.capacity) * 100)}% capacity.`,
            }
          }
        }
        break
      }

      case "REMOVE_ITEM": {
        if (payload && payload.itemId) {
          const existingItemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (existingItemIndex >= 0) {
            const quantity = payload.quantity || 1
            const currentItem = newState.items[existingItemIndex]
            const location = currentItem.location

            if (currentItem.quantity <= quantity) {
              // Remove item completely
              newState.items = newState.items.filter((item) => item.id !== payload.itemId)

              // Update location count
              if (location && newState.locations[location]) {
                newState.locations[location].currentItems -= currentItem.quantity
              }

              alert = {
                type: "info",
                message: `Removed all ${currentItem.name}(s) from inventory.`,
              }
            } else {
              // Reduce quantity
              const updatedItems = [...newState.items]
              updatedItems[existingItemIndex] = {
                ...currentItem,
                quantity: currentItem.quantity - quantity,
              }
              newState.items = updatedItems

              // Update location count
              if (location && newState.locations[location]) {
                newState.locations[location].currentItems -= quantity
              }

              alert = {
                type: "info",
                message: `Removed ${quantity} ${currentItem.name}(s) from inventory.`,
              }
            }

            // Update total count and weight
            newState.totalItems = newState.items.reduce((sum, item) => sum + item.quantity, 0)
            newState.totalWeight = newState.items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)
          }
        }
        break
      }

      case "ASSIGN_ITEM": {
        if (payload && payload.itemId && payload.crewId) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            // If we're assigning multiple of the same item
            if (payload.quantity && payload.quantity > 1) {
              // Create a new entry for the assigned items
              const originalItem = newState.items[itemIndex]

              if (originalItem.quantity <= payload.quantity) {
                // Assign all items
                newState.items[itemIndex] = {
                  ...originalItem,
                  assignedTo: payload.crewId,
                  location: "personal equipment",
                }

                // Update location counts
                if (originalItem.location && newState.locations[originalItem.location]) {
                  newState.locations[originalItem.location].currentItems -= originalItem.quantity
                }
                if (newState.locations["personal equipment"]) {
                  newState.locations["personal equipment"].currentItems += originalItem.quantity
                }
              } else {
                // Split the items
                newState.items[itemIndex] = {
                  ...originalItem,
                  quantity: originalItem.quantity - payload.quantity,
                }

                // Add new entry for assigned items
                newState.items.push({
                  ...originalItem,
                  quantity: payload.quantity,
                  assignedTo: payload.crewId,
                  location: "personal equipment",
                })

                // Update location counts
                if (originalItem.location && newState.locations[originalItem.location]) {
                  newState.locations[originalItem.location].currentItems -= payload.quantity
                }
                if (newState.locations["personal equipment"]) {
                  newState.locations["personal equipment"].currentItems += payload.quantity
                }
              }
            } else {
              // Just assign one item
              const originalLocation = newState.items[itemIndex].location

              newState.items[itemIndex] = {
                ...newState.items[itemIndex],
                assignedTo: payload.crewId,
                location: "personal equipment",
              }

              // Update location counts
              if (originalLocation && newState.locations[originalLocation]) {
                newState.locations[originalLocation].currentItems -= 1
              }
              if (newState.locations["personal equipment"]) {
                newState.locations["personal equipment"].currentItems += 1
              }
            }

            // Add cross-module effect to notify crew
            crossModuleEffects.push({
              moduleId: "crew",
              action: "NOTIFY_EQUIPMENT_ASSIGNMENT",
              payload: {
                crewId: payload.crewId,
                itemId: payload.itemId,
                itemName: newState.items[itemIndex].name,
              },
            })

            alert = {
              type: "success",
              message: `${newState.items[itemIndex].name} assigned to crew member.`,
            }
          }
        }
        break
      }

      case "UNASSIGN_ITEM": {
        if (payload && payload.itemId) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            const crewId = newState.items[itemIndex].assignedTo
            const newLocation = payload.location || "quartermaster"

            newState.items[itemIndex] = {
              ...newState.items[itemIndex],
              assignedTo: undefined,
              location: newLocation,
            }

            // Update location counts
            if (newState.locations["personal equipment"]) {
              newState.locations["personal equipment"].currentItems -= 1
            }
            if (newState.locations[newLocation]) {
              newState.locations[newLocation].currentItems += 1
            }

            // Add cross-module effect to notify crew
            if (crewId) {
              crossModuleEffects.push({
                moduleId: "crew",
                action: "NOTIFY_EQUIPMENT_REMOVAL",
                payload: {
                  crewId: crewId,
                  itemId: payload.itemId,
                  itemName: newState.items[itemIndex].name,
                },
              })
            }

            alert = {
              type: "info",
              message: `${newState.items[itemIndex].name} returned to ${newLocation}.`,
            }
          }
        }
        break
      }

      case "MOVE_ITEM": {
        if (payload && payload.itemId && payload.location) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            const originalLocation = newState.items[itemIndex].location
            const quantity = payload.quantity || newState.items[itemIndex].quantity

            // Check if the destination location exists and has capacity
            if (!newState.locations[payload.location]) {
              alert = {
                type: "warning",
                message: `Location ${payload.location} does not exist.`,
              }
              break
            }

            const availableCapacity =
              newState.locations[payload.location].capacity - newState.locations[payload.location].currentItems

            if (quantity > availableCapacity) {
              alert = {
                type: "warning",
                message: `Not enough space in ${payload.location}. Only ${availableCapacity} slots available.`,
              }
              break
            }

            // Check security access if applicable
            if (
              payload.crewId &&
              newState.locations[payload.location].securityLevel === "high" &&
              newState.locations[payload.location].accessibleTo &&
              !newState.locations[payload.location].accessibleTo.includes(payload.department || "")
            ) {
              alert = {
                type: "danger",
                message: `Access denied to ${payload.location}. Security clearance required.`,
              }

              // Log security violation
              crossModuleEffects.push({
                moduleId: "mission",
                action: "ADD_LOG_ENTRY",
                payload: {
                  text: `Security alert: Unauthorized access attempt to ${payload.location} by crew ID ${payload.crewId}.`,
                },
              })

              break
            }

            // If moving only part of the stack
            if (quantity < newState.items[itemIndex].quantity) {
              // Split the stack
              newState.items[itemIndex] = {
                ...newState.items[itemIndex],
                quantity: newState.items[itemIndex].quantity - quantity,
              }

              // Create new entry for moved items
              newState.items.push({
                ...newState.items[itemIndex],
                quantity: quantity,
                location: payload.location,
              })
            } else {
              // Move the entire stack
              newState.items[itemIndex] = {
                ...newState.items[itemIndex],
                location: payload.location,
              }
            }

            // Update location counts
            if (originalLocation && newState.locations[originalLocation]) {
              newState.locations[originalLocation].currentItems -= quantity
            }
            newState.locations[payload.location].currentItems += quantity

            alert = {
              type: "success",
              message: `Moved ${quantity} ${newState.items[itemIndex].name}(s) to ${payload.location}.`,
            }
          }
        }
        break
      }

      case "USE_ITEM": {
        if (payload && payload.itemId) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            const item = newState.items[itemIndex]

            // Check if item is usable
            if (!item.usable) {
              alert = {
                type: "warning",
                message: `${item.name} cannot be used directly.`,
              }
              break
            }

            // Handle consumable items
            if (payload.consume || item.consumable) {
              if (item.quantity <= 1) {
                // Remove item if used up
                newState.items = newState.items.filter((item) => item.id !== payload.itemId)

                // Update location count
                if (item.location && newState.locations[item.location]) {
                  newState.locations[item.location].currentItems -= 1
                }
              } else {
                // Reduce quantity
                newState.items[itemIndex] = {
                  ...item,
                  quantity: item.quantity - 1,
                }

                // Update location count
                if (item.location && newState.locations[item.location]) {
                  newState.locations[item.location].currentItems -= 1
                }
              }

              // Update total count and weight
              newState.totalItems = newState.items.reduce((sum, item) => sum + item.quantity, 0)
              newState.totalWeight = newState.items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)
            }

            // Handle items with durability
            if (item.durability) {
              const durabilityLoss = payload.durabilityLoss || 5
              newState.items[itemIndex] = {
                ...item,
                durability: {
                  ...item.durability,
                  current: Math.max(0, item.durability.current - durabilityLoss),
                },
              }

              // Check if item is now broken
              if (newState.items[itemIndex].durability.current === 0) {
                alert = {
                  type: "warning",
                  message: `${item.name} is now broken and needs repair.`,
                }
              }
            }

            // Handle items with charges or power levels
            if (payload.useCharge && item.properties) {
              if (item.properties.charges) {
                newState.items[itemIndex] = {
                  ...item,
                  properties: {
                    ...item.properties,
                    charges: Math.max(0, item.properties.charges - 1),
                  },
                }

                // Check if charges are depleted
                if (newState.items[itemIndex].properties.charges === 0) {
                  alert = {
                    type: "warning",
                    message: `${item.name} is depleted and needs recharging.`,
                  }
                }
              } else if (item.properties.powerLevel) {
                const powerReduction = payload.powerAmount || 10
                newState.items[itemIndex] = {
                  ...item,
                  properties: {
                    ...item.properties,
                    powerLevel: Math.max(0, item.properties.powerLevel - powerReduction),
                  },
                }

                // Check if power is depleted
                if (newState.items[itemIndex].properties.powerLevel === 0) {
                  alert = {
                    type: "warning",
                    message: `${item.name} is out of power and needs recharging.`,
                  }
                }
              }
            }

            // Apply item effects if specified
            if (item.effects && payload.target) {
              // Process each effect
              item.effects.forEach((effect) => {
                if (effect.target === payload.targetType) {
                  // Create cross-module effects based on effect type
                  if (effect.type === "heal" && payload.crewId) {
                    crossModuleEffects.push({
                      moduleId: "crew",
                      action: "HEAL_CREW",
                      payload: {
                        crewId: payload.crewId,
                        amount: effect.value,
                      },
                    })
                  } else if (effect.type === "damage" && payload.targetId) {
                    crossModuleEffects.push({
                      moduleId: "ship",
                      action: "TAKE_DAMAGE",
                      payload: {
                        system: payload.targetId,
                        amount: effect.value,
                      },
                    })
                  } else if (effect.type === "boost" && payload.crewId) {
                    crossModuleEffects.push({
                      moduleId: "crew",
                      action: "BOOST_MORALE",
                      payload: {
                        crewId: payload.crewId,
                        amount: effect.value,
                      },
                    })
                  }
                }
              })
            }

            // Special handling for specific items
            if (item.id === "tricorder" && payload.scanTarget) {
              // Add scan results to mission log
              crossModuleEffects.push({
                moduleId: "mission",
                action: "ADD_LOG_ENTRY",
                payload: {
                  text: `Tricorder scan of ${payload.scanTarget}: ${payload.scanResults || "No anomalies detected."}`,
                },
              })

              // Potentially reveal new registry entries
              if (payload.discoveryId) {
                crossModuleEffects.push({
                  moduleId: "registry",
                  action: "DISCOVER_ENTRY",
                  payload: {
                    entryId: payload.discoveryId,
                  },
                })
              }
            } else if (item.id === "class-3-probe" && payload.launchCoordinates) {
              // Log probe launch
              crossModuleEffects.push({
                moduleId: "mission",
                action: "ADD_LOG_ENTRY",
                payload: {
                  text: `Class 3 probe launched to coordinates ${payload.launchCoordinates}.`,
                },
              })

              // Potentially complete mission objectives
              if (payload.objectiveId) {
                crossModuleEffects.push({
                  moduleId: "mission",
                  action: "COMPLETE_OBJECTIVE",
                  payload: {
                    objectiveId: payload.objectiveId,
                  },
                })
              }
            }

            alert = alert || {
              type: "success",
              message: `Used ${item.name} successfully.`,
            }
          }
        }
        break
      }

      case "REPAIR_ITEM": {
        if (payload && payload.itemId) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            const item = newState.items[itemIndex]

            // Check if item has durability
            if (!item.durability) {
              alert = {
                type: "warning",
                message: `${item.name} does not have durability to repair.`,
              }
              break
            }

            // Calculate repair amount
            const repairAmount = payload.amount || item.durability.max * 0.5

            // Apply repair
            newState.items[itemIndex] = {
              ...item,
              durability: {
                ...item.durability,
                current: Math.min(item.durability.max, item.durability.current + repairAmount),
              },
            }

            // Check if fully repaired
            if (newState.items[itemIndex].durability.current === item.durability.max) {
              alert = {
                type: "success",
                message: `${item.name} fully repaired.`,
              }
            } else {
              alert = {
                type: "info",
                message: `${item.name} partially repaired (${Math.round((newState.items[itemIndex].durability.current / item.durability.max) * 100)}%).`,
              }
            }
          }
        }
        break
      }

      case "RECHARGE_ITEM": {
        if (payload && payload.itemId) {
          const itemIndex = newState.items.findIndex((item) => item.id === payload.itemId)

          if (itemIndex >= 0) {
            const item = newState.items[itemIndex]

            // Check if item has charges or power level
            if (!item.properties || (!item.properties.charges && !item.properties.powerLevel)) {
              alert = {
                type: "warning",
                message: `${item.name} cannot be recharged.`,
              }
              break
            }

            // Apply recharge
            if (item.properties.charges) {
              const maxCharges = payload.maxCharges || 20
              newState.items[itemIndex] = {
                ...item,
                properties: {
                  ...item.properties,
                  charges: maxCharges,
                },
              }

              alert = {
                type: "success",
                message: `${item.name} recharged to ${maxCharges} charges.`,
              }
            } else if (item.properties.powerLevel !== undefined) {
              newState.items[itemIndex] = {
                ...item,
                properties: {
                  ...item.properties,
                  powerLevel: 100,
                },
              }

              alert = {
                type: "success",
                message: `${item.name} power level restored to 100%.`,
              }
            }
          }
        }
        break
      }

      case "REPLICATE_ITEM": {
        if (payload && payload.itemId) {
          // Check if we have enough replicator energy
          if (newState.replicatorEnergy < 10) {
            alert = {
              type: "warning",
              message: "Insufficient replicator energy. Please wait for recharge.",
            }
            break
          }

          // Check if item is in replicator templates
          if (!newState.replicatorTemplates.includes(payload.itemId)) {
            alert = {
              type: "warning",
              message: "Item template not found in replicator database.",
            }
            break
          }

          // Find the template item
          const templateItem = newState.items.find((item) => item.id === payload.itemId)

          if (!templateItem) {
            alert = {
              type: "warning",
              message: "Item template exists but no reference item found.",
            }
            break
          }

          // Calculate energy cost based on item complexity
          const energyCost =
            payload.quantity || 1 * (templateItem.rarity === "rare" ? 30 : templateItem.rarity === "uncommon" ? 15 : 10)

          if (newState.replicatorEnergy < energyCost) {
            alert = {
              type: "warning",
              message: `Insufficient replicator energy. Required: ${energyCost}, Available: ${newState.replicatorEnergy}.`,
            }
            break
          }

          // Create the replicated item
          const quantity = payload.quantity || 1
          const location = payload.location || "replicator output"

          // Add the item to inventory
          this.handleAction("ADD_ITEM", {
            item: {
              ...templateItem,
              quantity: quantity,
              location: location,
            },
          })

          // Reduce replicator energy
          newState.replicatorEnergy -= energyCost

          alert = {
            type: "success",
            message: `Successfully replicated ${quantity} ${templateItem.name}(s).`,
          }
        }
        break
      }

      case "CREATE_LOCATION": {
        if (payload && payload.locationId && payload.name && payload.capacity) {
          // Check if location already exists
          if (newState.locations[payload.locationId]) {
            alert = {
              type: "warning",
              message: `Location ${payload.name} already exists.`,
            }
            break
          }

          // Create new location
          newState.locations[payload.locationId] = {
            name: payload.name,
            capacity: payload.capacity,
            currentItems: 0,
            securityLevel: payload.securityLevel || "low",
            accessibleTo: payload.accessibleTo,
          }

          alert = {
            type: "success",
            message: `Created new storage location: ${payload.name}.`,
          }
        }
        break
      }

      case "ANALYZE_ITEM": {
        if (payload && payload.itemId) {
          const item = newState.items.find((item) => item.id === payload.itemId)

          if (!item) {
            alert = {
              type: "warning",
              message: "Item not found in inventory.",
            }
            break
          }

          // Log analysis to mission log
          crossModuleEffects.push({
            moduleId: "mission",
            action: "ADD_LOG_ENTRY",
            payload: {
              text: `Item analysis of ${item.name}: ${payload.analysisResults || "Standard Starfleet issue."}`,
            },
          })

          // Potentially discover new information about the item
          if (payload.discoveryId) {
            crossModuleEffects.push({
              moduleId: "registry",
              action: "DISCOVER_ENTRY",
              payload: {
                entryId: payload.discoveryId,
              },
            })
          }

          alert = {
            type: "info",
            message: `Analysis of ${item.name} complete.`,
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

    switch (condition) {
      case "HAS_ITEM":
        return (
          params &&
          this.state.items.some((item) => item.id === params.itemId && item.quantity >= (params.quantity || 1))
        )

      case "ITEM_ASSIGNED":
        return params && this.state.items.some((item) => item.id === params.itemId && item.assignedTo === params.crewId)

      case "ITEM_IN_LOCATION":
        return params && this.state.items.some((item) => item.id === params.itemId && item.location === params.location)

      case "ITEM_USABLE":
        if (!params || !params.itemId) return false
        const item = this.state.items.find((item) => item.id === params.itemId)

        if (!item) return false

        if (params.checkCharges && item.properties && item.properties.charges) {
          return item.properties.charges > 0
        }

        if (params.checkPower && item.properties && item.properties.powerLevel) {
          return item.properties.powerLevel > (params.minPower || 0)
        }

        if (params.checkDurability && item.durability) {
          return item.durability.current > (params.minDurability || 0)
        }

        return item.usable === true

      case "CAN_REPLICATE":
        return (
          params &&
          this.state.replicatorTemplates.includes(params.itemId) &&
          this.state.replicatorEnergy >= (params.energyCost || 10)
        )

      case "LOCATION_HAS_SPACE":
        if (!params || !params.location) return false
        const location = this.state.locations[params.location]
        if (!location) return false

        return location.capacity - location.currentItems >= (params.quantity || 1)

      case "HAS_ACCESS_TO_LOCATION":
        if (!params || !params.location || !params.department) return false
        const loc = this.state.locations[params.location]
        if (!loc) return false

        if (loc.securityLevel === "low") return true
        if (!loc.accessibleTo) return false

        return loc.accessibleTo.includes(params.department) || loc.accessibleTo.includes(params.crewId || "")

      default:
        return false
    }
  }

  getUI(props: ModuleUIProps): React.ReactNode {
    // Use createElement instead of JSX since this is a .ts file
    return React.createElement(InventorySystemUI, {
      state: props.state,
      dispatch: props.dispatch,
      isActive: props.isActive,
    })
  }
}
