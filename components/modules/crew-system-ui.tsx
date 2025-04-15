"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Users, User, UserCheck, Heart, Smile } from "lucide-react"
import type { CrewState, CrewMember } from "@/lib/modules/crew-module"
import type { ModuleUIProps } from "@/lib/types"

export function CrewSystemUI({ state, dispatch, isActive }: ModuleUIProps) {
  const crewState = state as CrewState
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null)

  if (!isActive) return null

  const allCrew = [...crewState.officers, ...crewState.crew]
  const selectedCrew = allCrew.find((crew) => crew.id === selectedCrewId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "away":
        return "bg-blue-500"
      case "injured":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      case "deceased":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "command":
        return "bg-red-700"
      case "engineering":
        return "bg-yellow-600"
      case "science":
        return "bg-blue-600"
      case "medical":
        return "bg-green-600"
      case "security":
        return "bg-red-500"
      case "operations":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleFormAwayTeam = (crewId: string) => {
    dispatch("FORM_AWAY_TEAM", { crewIds: [crewId] })
  }

  const handleReturnAwayTeam = () => {
    dispatch("RETURN_AWAY_TEAM", { location: "bridge" })
  }

  const handleHealCrew = (crewId: string) => {
    dispatch("HEAL_CREW", { crewId })
  }

  const handleBoostMorale = (crewId: string) => {
    dispatch("BOOST_MORALE", { crewId, amount: 10 })
  }

  const renderCrewList = (crewMembers: CrewMember[]) => (
    <div className="space-y-2">
      {crewMembers.map((crew) => (
        <motion.div
          key={crew.id}
          onClick={() => setSelectedCrewId(crew.id)}
          className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
            selectedCrewId === crew.id ? "border-[#f90] bg-black" : "border-gray-700 bg-gray-900 hover:border-gray-500"
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(crew.status)}`}></div>
            <div>
              <div className="font-medium lcars-text">{crew.name}</div>
              <div className="text-sm text-gray-400 lcars-readout">{crew.rank}</div>
            </div>
          </div>
          <Badge className={`${getDepartmentColor(crew.department)} text-white lcars-text uppercase`}>
            {crew.department}
          </Badge>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4 p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#f90] rounded-full flex items-center justify-center mr-3">
            <Users className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-[#f90] lcars-title">CREW MANAGEMENT</h2>
        </div>

        {/* LCARS decorative element */}
        <div className="flex space-x-2">
          <div className="h-4 w-16 bg-blue-500 rounded-l-full"></div>
          <div className="h-4 w-8 bg-purple-500"></div>
          <div className="h-4 w-12 bg-[#f90] rounded-r-full"></div>
        </div>
      </div>

      <Tabs defaultValue="officers" className="w-full">
        <TabsList className="bg-black border border-[#f90] grid w-full grid-cols-3">
          <TabsTrigger
            value="officers"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            SENIOR OFFICERS
          </TabsTrigger>
          <TabsTrigger
            value="crew"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            CREW
          </TabsTrigger>
          <TabsTrigger
            value="away"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            AWAY TEAM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="officers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>{renderCrewList(crewState.officers)}</div>

            {selectedCrew ? (
              <Card className="bg-black border-[#f90] lcars-data-display">
                <CardHeader className="flex flex-row items-center pb-2">
                  <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                    <User className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-[#f90] lcars-title">{selectedCrew.name}</CardTitle>
                    <CardDescription className="lcars-readout">
                      {selectedCrew.rank} • {selectedCrew.species}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedCrew.status)}`}></div>
                    <span className="capitalize lcars-text">{selectedCrew.status}</span>
                    <span className="text-gray-400 lcars-readout">• {selectedCrew.location}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="lcars-text">MORALE</span>
                      <span className="lcars-readout">{selectedCrew.morale}%</span>
                    </div>
                    <Progress
                      value={selectedCrew.morale}
                      className="h-2 bg-gray-700 lcars-progress"
                      indicatorClassName={`lcars-progress-bar ${
                        selectedCrew.morale > 70
                          ? "bg-green-500"
                          : selectedCrew.morale > 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 lcars-text">SKILLS</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedCrew.skills).map(([skill, level]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="capitalize lcars-text">{skill}</span>
                            <span className="lcars-readout">{level}</span>
                          </div>
                          <Progress
                            value={level}
                            className="h-1 bg-gray-700 lcars-progress"
                            indicatorClassName="bg-[#f90] lcars-progress-bar"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCrew.status === "active" && (
                      <motion.button
                        onClick={() => handleFormAwayTeam(selectedCrew.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-l-full lcars-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <UserCheck className="h-4 w-4 mr-1 inline-block" />
                        <span className="lcars-text">ASSIGN TO AWAY TEAM</span>
                      </motion.button>
                    )}

                    {(selectedCrew.status === "injured" || selectedCrew.status === "critical") && (
                      <motion.button
                        onClick={() => handleHealCrew(selectedCrew.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-l-full lcars-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className="h-4 w-4 mr-1 inline-block" />
                        <span className="lcars-text">SEND TO SICKBAY</span>
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => handleBoostMorale(selectedCrew.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-r-full lcars-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Smile className="h-4 w-4 mr-1 inline-block" />
                      <span className="lcars-text">BOOST MORALE</span>
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black border-gray-700 flex items-center justify-center">
                <CardContent className="pt-6 text-center text-gray-400">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="lcars-text">SELECT A CREW MEMBER</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="crew" className="mt-4">
          {crewState.crew.length > 0 ? (
            renderCrewList(crewState.crew)
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="pt-6 text-center text-gray-400 lcars-text">
                NO ADDITIONAL CREW MEMBERS AVAILABLE
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="away" className="mt-4">
          {crewState.awayTeam.length > 0 ? (
            <div className="space-y-4">
              <div>{renderCrewList(allCrew.filter((crew) => crewState.awayTeam.includes(crew.id)))}</div>

              <motion.button
                onClick={handleReturnAwayTeam}
                className="bg-[#f90] text-black px-4 py-2 rounded-full lcars-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="lcars-text">RETURN AWAY TEAM TO SHIP</span>
              </motion.button>
            </div>
          ) : (
            <Card className="bg-black border-gray-700">
              <CardContent className="pt-6 text-center text-gray-400 lcars-text">
                NO AWAY TEAM CURRENTLY ASSIGNED
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
