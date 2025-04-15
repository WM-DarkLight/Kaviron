"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import type { Campaign } from "@/lib/types"

interface CampaignProgressProps {
  campaign: Campaign
  currentEpisodeId: string
  completedEpisodes: string[]
}

export function CampaignProgress({ campaign, currentEpisodeId, completedEpisodes }: CampaignProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate progress percentage
  const totalEpisodes = campaign.episodes.length
  const completedCount = completedEpisodes.length
  const progressPercentage = Math.round((completedCount / totalEpisodes) * 100)

  // Sort episodes by order
  const sortedEpisodes = [...campaign.episodes].sort((a, b) => a.order - b.order)

  // Get a color for each episode based on its status
  const getEpisodeColor = (episodeId: string, index: number) => {
    const isCompleted = completedEpisodes.includes(episodeId)
    const isCurrent = episodeId === currentEpisodeId

    if (isCompleted) return "bg-[#66cc66]" // green
    if (isCurrent) return "bg-[#ff9900]" // orange

    // For upcoming episodes, cycle through colors
    const colors = ["bg-[#99ccff]", "bg-[#cc99cc]", "bg-[#ffcc00]", "bg-[#cc6666]"]
    return colors[index % colors.length]
  }

  return (
    <Card className="bg-black border-[#cc99cc] mb-4 overflow-hidden">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#cc99cc] rounded-full flex items-center justify-center mr-2">
            <BookOpen className="h-5 w-5 text-black" />
          </div>
          <CardTitle className="text-[#cc99cc] text-lg lcars-title">CAMPAIGN: {campaign.title}</CardTitle>
        </div>
        <div className="flex items-center">
          <Badge className="bg-[#99ccff] text-black mr-2 lcars-text">
            {completedCount}/{totalEpisodes} EPISODES
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#cc99cc]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#cc99cc]" />
          )}
        </div>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <CardContent className="pt-0">
          {/* LCARS decorative bar */}
          <div className="flex w-full mb-2">
            <div className="h-2 w-16 bg-[#cc99cc] rounded-l-full"></div>
            <div className="h-2 w-8 bg-[#ff9900]"></div>
            <div className="h-2 flex-grow bg-[#99ccff]"></div>
            <div className="h-2 w-8 bg-[#ff9900]"></div>
            <div className="h-2 w-16 bg-[#cc99cc] rounded-r-full"></div>
          </div>

          <Progress value={progressPercentage} className="h-3 mb-4 bg-gray-700" indicatorClassName="bg-[#cc99cc]" />

          <div className="space-y-2">
            {sortedEpisodes.map((episode, index) => {
              const isCompleted = completedEpisodes.includes(episode.episodeId)
              const isCurrent = episode.episodeId === currentEpisodeId
              const episodeColor = getEpisodeColor(episode.episodeId, index)

              return (
                <div
                  key={episode.episodeId}
                  className={`p-2 rounded-md flex items-center ${
                    isCurrent
                      ? "bg-[#ff9900]/20 border border-[#ff9900]"
                      : isCompleted
                        ? "bg-[#66cc66]/20 border border-[#66cc66]"
                        : "bg-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${episodeColor}`}></div>
                    <div className="flex-grow">
                      <p
                        className={`text-sm ${
                          isCurrent ? "text-[#ff9900] font-bold" : isCompleted ? "text-[#66cc66]" : "text-gray-300"
                        } lcars-text`}
                      >
                        {episode.title}
                      </p>
                      {episode.description && (
                        <p className="text-xs text-gray-400 lcars-readout">{episode.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Episode status indicator */}
                  <div className="ml-2">
                    {isCompleted && <Badge className="bg-[#66cc66] text-black">COMPLETED</Badge>}
                    {isCurrent && <Badge className="bg-[#ff9900] text-black">CURRENT</Badge>}
                    {!isCompleted && !isCurrent && <Badge className="bg-gray-600 text-white">PENDING</Badge>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* LCARS decorative bar */}
          <div className="flex w-full mt-4">
            <div className="h-2 w-12 bg-[#cc99cc] rounded-l-full"></div>
            <div className="h-2 flex-grow bg-[#99ccff]"></div>
            <div className="h-2 w-12 bg-[#cc99cc] rounded-r-full"></div>
          </div>
        </CardContent>
      </motion.div>
    </Card>
  )
}
