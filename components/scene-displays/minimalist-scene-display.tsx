"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scene } from "@/lib/types"

interface MinimalistSceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function MinimalistSceneDisplay({ scene, onSceneDisplayed }: MinimalistSceneDisplayProps) {
  useEffect(() => {
    if (onSceneDisplayed) {
      onSceneDisplayed()
    }
  }, [scene.id, onSceneDisplayed])

  return (
    <Card className="w-full border-gray-300 shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-gray-50">
        <CardTitle className="text-gray-800 font-sans text-xl">{scene.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-gray-700 bg-white">
        <div className="space-y-2">
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
