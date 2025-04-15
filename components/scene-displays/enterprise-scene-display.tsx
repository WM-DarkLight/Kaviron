"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scene } from "@/lib/types"

interface EnterpriseSceneDisplayProps {
  scene: Scene
  onSceneDisplayed?: () => void
}

export function EnterpriseSceneDisplay({ scene, onSceneDisplayed }: EnterpriseSceneDisplayProps) {
  useEffect(() => {
    if (onSceneDisplayed) {
      onSceneDisplayed()
    }
  }, [scene.id, onSceneDisplayed])

  return (
    <Card className="w-full bg-blue-950 border-blue-400 shadow-lg shadow-blue-900/20">
      <CardHeader className="border-b border-blue-400 bg-blue-900">
        <CardTitle className="text-blue-100 font-trek text-xl">{scene.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-blue-100 bg-gradient-to-br from-blue-950 to-slate-900">
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
