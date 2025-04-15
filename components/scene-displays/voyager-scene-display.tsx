"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scene } from "@/lib/types"

interface VoyagerSceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function VoyagerSceneDisplay({ scene, onSceneDisplayed }: VoyagerSceneDisplayProps) {
  useEffect(() => {
    if (onSceneDisplayed) {
      onSceneDisplayed()
    }
  }, [scene.id, onSceneDisplayed])

  return (
    <Card className="w-full bg-purple-950 border-purple-400 shadow-lg shadow-purple-900/20">
      <CardHeader className="border-b border-purple-400 bg-purple-900">
        <CardTitle className="text-purple-100 font-trek text-xl">{scene.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-purple-100 bg-gradient-to-br from-purple-950 to-indigo-950">
        <div className="space-y-2 font-light">
          {scene.text.map((paragraph, index) => (
            <p key={index} className="mb-2">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
