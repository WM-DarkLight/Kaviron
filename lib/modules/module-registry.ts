import type { GameModule, ModuleRegistry } from "../types"
import { ShipModule } from "./ship-module"
import { CrewModule } from "./crew-module"
import { InventoryModule } from "./inventory-module"
import { MissionModule } from "./mission-module"
import { RegistryModule } from "./registry-module"

// Register all available modules
const availableModules: ModuleRegistry = {
  ship: new ShipModule(),
  crew: new CrewModule(),
  inventory: new InventoryModule(),
  mission: new MissionModule(),
  registry: new RegistryModule(),
}

export function getAvailableModules(): ModuleRegistry {
  return availableModules
}

export function getModule(moduleId: string): GameModule | undefined {
  return availableModules[moduleId]
}

export function initializeModules(
  requiredModules: string[] = [],
  moduleConfig: Record<string, any> = {},
): Record<string, any> {
  const initializedModuleStates: Record<string, any> = {}

  // Initialize only the required modules
  requiredModules.forEach((moduleId) => {
    const module = availableModules[moduleId]
    if (module) {
      const config = moduleConfig[moduleId] || {}
      initializedModuleStates[moduleId] = module.initialize(config)
    }
  })

  return initializedModuleStates
}
