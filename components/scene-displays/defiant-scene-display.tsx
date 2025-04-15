"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scene } from "@/lib/types"

interface DefiantSceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function DefiantSceneDisplay({ scene, onSceneDisplayed }: DefiantSceneDisplayProps) {
  useEffect(() => {
    if (onSceneDisplayed) {
      onSceneDisplayed()
    }
  }, [scene.id, onSceneDisplayed])

  return (
    <Card className="w-full bg-red-950 border-red-500 shadow-lg shadow-red-900/20">
      <CardHeader className="border-b border-red-500 bg-red-900">
        <CardTitle className="text-red-100 font-trek text-xl">{scene.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-red-100 bg-gradient-to-br from-red-950 to-gray-900">
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
