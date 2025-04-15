"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import type { MissionState } from "@/lib/modules/mission-module"
import type { ModuleUIProps } from "@/lib/types"
import { CheckCircle, Circle, Clock, Activity, FileText, Target } from "lucide-react"

export function MissionSystemUI({ state, dispatch, isActive }: ModuleUIProps) {
  const missionState = state as MissionState

  if (!isActive) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500 lcars-text">IN PROGRESS</Badge>
      case "completed":
        return <Badge className="bg-green-500 lcars-text">COMPLETED</Badge>
      case "failed":
        return <Badge className="bg-red-500 lcars-text">FAILED</Badge>
      default:
        return <Badge className="bg-gray-500 lcars-text">UNKNOWN</Badge>
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4 p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#f90] rounded-full flex items-center justify-center mr-3">
            <Activity className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-[#f90] lcars-title">MISSION STATUS</h2>
        </div>

        {/* LCARS decorative element */}
        <div className="flex space-x-2">
          <div className="h-4 w-16 bg-blue-500 rounded-l-full"></div>
          <div className="h-4 w-8 bg-purple-500"></div>
          <div className="h-4 w-12 bg-[#f90] rounded-r-full"></div>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="bg-black border border-[#f90] grid w-full grid-cols-3">
          <TabsTrigger
            value="current"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            CURRENT MISSION
          </TabsTrigger>
          <TabsTrigger
            value="secondary"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            SECONDARY MISSIONS
          </TabsTrigger>
          <TabsTrigger
            value="log"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            MISSION LOG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          {missionState.currentMission ? (
            <Card className="bg-black border-[#f90] lcars-data-display">
              <CardHeader className="flex flex-row items-center pb-2">
                <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                  <Target className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-[#f90] lcars-title">{missionState.currentMission.title}</CardTitle>
                    {getStatusBadge(missionState.currentMission.status)}
                  </div>
                  <CardDescription className="lcars-readout">
                    Progress: {missionState.currentMission.progress}%
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="lcars-text">{missionState.currentMission.description}</p>

                <Progress
                  value={missionState.currentMission.progress}
                  className="h-2 bg-gray-700 lcars-progress"
                  indicatorClassName="bg-[#f90] lcars-progress-bar"
                />

                <div>
                  <h4 className="font-medium mb-2 lcars-text">OBJECTIVES</h4>
                  <div className="space-y-2">
                    {missionState.currentMission.objectives
                      .filter((obj) => !obj.hidden)
                      .map((objective) => (
                        <motion.div
                          key={objective.id}
                          className={`flex items-start space-x-2 p-2 rounded-md ${
                            objective.completed ? "bg-green-900/20" : "bg-gray-800"
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {objective.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                          )}
                          <div>
                            <p className={`lcars-text ${objective.completed ? "line-through text-gray-400" : ""}`}>
                              {objective.description}
                            </p>
                            {objective.optional && (
                              <span className="text-xs text-gray-400 lcars-readout">OPTIONAL</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="pt-6 text-center text-gray-400 lcars-text">NO ACTIVE MISSION</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="secondary" className="mt-4">
          {missionState.secondaryMissions.length > 0 ? (
            <div className="space-y-4">
              {missionState.secondaryMissions.map((mission) => (
                <Card key={mission.id} className="bg-black border-gray-700 lcars-data-display">
                  <CardHeader className="flex flex-row items-center pb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <FileText className="h-5 w-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white lcars-title">{mission.title}</CardTitle>
                        {getStatusBadge(mission.status)}
                      </div>
                      <CardDescription className="lcars-readout">Progress: {mission.progress}%</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="lcars-text">{mission.description}</p>

                    <Progress
                      value={mission.progress}
                      className="h-2 bg-gray-700 lcars-progress"
                      indicatorClassName="bg-[#f90] lcars-progress-bar"
                    />

                    <div>
                      <h4 className="font-medium mb-2 lcars-text">OBJECTIVES</h4>
                      <div className="space-y-2">
                        {mission.objectives
                          .filter((obj) => !obj.hidden)
                          .map((objective) => (
                            <div
                              key={objective.id}
                              className={`flex items-start space-x-2 p-2 rounded-md ${
                                objective.completed ? "bg-green-900/20" : "bg-gray-800"
                              }`}
                            >
                              {objective.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                              )}
                              <div>
                                <p className={`lcars-text ${objective.completed ? "line-through text-gray-400" : ""}`}>
                                  {objective.description}
                                </p>
                                {objective.optional && (
                                  <span className="text-xs text-gray-400 lcars-readout">OPTIONAL</span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="pt-6 text-center text-gray-400 lcars-text">NO SECONDARY MISSIONS</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="flex flex-row items-center pb-2">
              <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                <Clock className="h-5 w-5 text-black" />
              </div>
              <CardTitle className="text-[#f90] lcars-title">MISSION LOG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 lcars-scanning">
                {missionState.missionLog.length > 0 ? (
                  [...missionState.missionLog]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((entry, index) => (
                      <motion.div
                        key={index}
                        className="flex space-x-3 p-2 border-b border-gray-800"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="lcars-text">{entry.text}</p>
                          <p className="text-xs text-gray-400 lcars-readout">{formatTimestamp(entry.timestamp)}</p>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="text-center text-gray-400 py-8 lcars-text">NO LOG ENTRIES</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
