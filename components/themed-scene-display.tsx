"use client"

import { useTheme } from "@/contexts/theme-context"
import { SceneDisplay } from "@/components/scene-display"
import { MinimalistSceneDisplay } from "@/components/scene-displays/minimalist-scene-display"
import { EnterpriseSceneDisplay } from "@/components/scene-displays/enterprise-scene-display"
import { VoyagerSceneDisplay } from "@/components/scene-displays/voyager-scene-display"
import { DefiantSceneDisplay } from "@/components/scene-displays/defiant-scene-display"
import type { Scene } from "@/lib/types"

interface ThemedSceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function ThemedSceneDisplay({ scene, onSceneDisplayed }: ThemedSceneDisplayProps) {
  const { theme } = useTheme()

  switch (theme) {
    case "minimalist":
      return <MinimalistSceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
    case "enterprise":
      return <EnterpriseSceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
    case "voyager":
      return <VoyagerSceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
    case "defiant":
      return <DefiantSceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
    case "lcars":
    default:
      return <SceneDisplay scene={scene} onSceneDisplayed={onSceneDisplayed} />
  }
}
