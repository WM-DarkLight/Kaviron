"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ShipState } from "@/lib/modules/ship-module"
import type { ModuleUIProps } from "@/lib/types"
import { motion } from "framer-motion"
import { Shield, Zap, Activity, Navigation, AlertTriangle, BarChart3 } from "lucide-react"

export function ShipSystemUI({ state, dispatch, isActive }: ModuleUIProps) {
  const shipState = state as ShipState

  if (!isActive) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-500"
      case "damaged":
        return "bg-yellow-500"
      default:
        return "bg-red-500"
    }
  }

  const handleSetWarp = (warpFactor: number) => {
    dispatch("SET_WARP", warpFactor)
  }

  const handleShields = (action: "RAISE_SHIELDS" | "LOWER_SHIELDS") => {
    dispatch(action)
  }

  return (
    <div className="space-y-4 p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#f90] lcars-title">{shipState.name}</h2>
          <p className="text-gray-400 lcars-readout">
            {shipState.registry} • {shipState.class}-class
          </p>
        </div>
        <Badge className="bg-[#f90] text-black">{shipState.position.sector}</Badge>
      </div>

      {/* LCARS decorative bar */}
      <div className="flex w-full my-2">
        <div className="h-3 w-16 bg-[#f90] rounded-l-full"></div>
        <div className="h-3 w-8 bg-blue-500"></div>
        <div className="h-3 flex-grow bg-purple-500"></div>
        <div className="h-3 w-8 bg-blue-500"></div>
        <div className="h-3 w-16 bg-[#f90] rounded-r-full"></div>
      </div>

      <Tabs defaultValue="systems" className="w-full">
        <TabsList className="bg-black border border-[#f90] grid w-full grid-cols-4">
          <TabsTrigger
            value="systems"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            SYSTEMS
          </TabsTrigger>
          <TabsTrigger
            value="power"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            POWER
          </TabsTrigger>
          <TabsTrigger
            value="damage"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            DAMAGE
          </TabsTrigger>
          <TabsTrigger
            value="navigation"
            className="text-[#f90] data-[state=active]:bg-[#f90] data-[state=active]:text-black lcars-text"
          >
            NAVIGATION
          </TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4 mt-4">
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="pb-2 flex flex-row items-center">
              <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                <Activity className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">PROPULSION</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="lcars-text">WARP DRIVE</span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(shipState.systems.warpDrive.status)}`}
                    ></div>
                    <span className="lcars-readout">{shipState.systems.warpDrive.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="lcars-text">WARP FACTOR:</span>
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((warp) => (
                      <motion.button
                        key={warp}
                        onClick={() => handleSetWarp(warp)}
                        disabled={
                          shipState.systems.warpDrive.status !== "online" || warp > shipState.systems.warpDrive.maxWarp
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center lcars-button ${
                          shipState.systems.warpDrive.currentWarp === warp
                            ? "bg-[#f90] text-black"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                        } ${
                          shipState.systems.warpDrive.status !== "online" || warp > shipState.systems.warpDrive.maxWarp
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {warp}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="lcars-text">IMPULSE ENGINES</span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(shipState.systems.impulse.status)}`}
                    ></div>
                    <span className="lcars-readout">{shipState.systems.impulse.status.toUpperCase()}</span>
                  </div>
                </div>
                <Progress
                  value={shipState.systems.impulse.power}
                  className="h-2 bg-gray-700 lcars-progress"
                  indicatorClassName="bg-[#f90] lcars-progress-bar"
                />
                <div className="flex justify-between text-xs lcars-readout">
                  <span>0%</span>
                  <span>{shipState.systems.impulse.power}%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="pb-2 flex flex-row items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                <Shield className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">DEFENSIVE SYSTEMS</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="lcars-text">SHIELDS</span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(shipState.systems.shields.status)}`}
                    ></div>
                    <span className="lcars-readout">{shipState.systems.shields.status.toUpperCase()}</span>
                  </div>
                </div>
                <Progress
                  value={shipState.systems.shields.strength}
                  className="h-2 bg-gray-700 lcars-progress"
                  indicatorClassName="bg-[#f90] lcars-progress-bar"
                />
                <div className="flex justify-between">
                  <motion.button
                    onClick={() => handleShields("RAISE_SHIELDS")}
                    disabled={shipState.systems.shields.status === "online"}
                    className="bg-green-600 text-white px-3 py-1 rounded-l-full lcars-button disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="lcars-text">RAISE SHIELDS</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleShields("LOWER_SHIELDS")}
                    disabled={shipState.systems.shields.status !== "online"}
                    className="bg-red-600 text-white px-3 py-1 rounded-r-full lcars-button disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="lcars-text">LOWER SHIELDS</span>
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="pb-2 flex flex-row items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">WEAPONS</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="lcars-text">PHASERS</span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(shipState.systems.weapons.phasers.status)}`}
                    ></div>
                    <span className="lcars-readout">{shipState.systems.weapons.phasers.status.toUpperCase()}</span>
                  </div>
                </div>
                <Progress
                  value={shipState.systems.weapons.phasers.power}
                  className="h-2 bg-gray-700 lcars-progress"
                  indicatorClassName="bg-red-500 lcars-progress-bar"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="lcars-text">PHOTON TORPEDOES</span>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(shipState.systems.weapons.torpedoes.status)}`}
                    ></div>
                    <span className="lcars-readout">{shipState.systems.weapons.torpedoes.count} REMAINING</span>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 rounded-full ${
                        i < shipState.systems.weapons.torpedoes.count ? "bg-red-500" : "bg-gray-700"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="mt-4">
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="flex flex-row items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                <BarChart3 className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">POWER ALLOCATION</CardTitle>
                <CardDescription className="lcars-readout">Total power: {shipState.power.total}%</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(shipState.power.allocated).map(([system, power]) => (
                <div key={system} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="capitalize lcars-text">{system.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="lcars-readout">{power}%</span>
                  </div>
                  <Progress
                    value={power}
                    className="h-2 bg-gray-700 lcars-progress"
                    indicatorClassName={`lcars-progress-bar ${
                      system === "weapons"
                        ? "bg-red-500"
                        : system === "shields"
                          ? "bg-blue-500"
                          : system === "lifeSystems"
                            ? "bg-green-500"
                            : "bg-[#f90]"
                    }`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="damage" className="mt-4">
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="flex flex-row items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <AlertTriangle className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">DAMAGE REPORT</CardTitle>
                <CardDescription className="lcars-readout">System integrity status</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(shipState.damage).map(([system, integrity]) => (
                <div key={system} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="capitalize lcars-text">{system.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span
                      className={`lcars-readout ${
                        integrity > 70 ? "text-green-500" : integrity > 30 ? "text-yellow-500" : "text-red-500"
                      }`}
                    >
                      {integrity}%
                    </span>
                  </div>
                  <Progress
                    value={integrity}
                    className="h-2 bg-gray-700 lcars-progress"
                    indicatorClassName={`lcars-progress-bar ${
                      integrity > 70 ? "bg-green-500" : integrity > 30 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="mt-4">
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="flex flex-row items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                <Navigation className="h-5 w-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-[#f90] lcars-title">NAVIGATION</CardTitle>
                <CardDescription className="lcars-readout">
                  Current position: {shipState.position.sector}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-black border border-[#f90] rounded-lg p-4 relative lcars-scanning">
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`h-${i}`} className="border-t border-[#f90]/20"></div>
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`v-${i}`} className="border-l border-[#f90]/20"></div>
                  ))}
                </div>

                {/* Coordinate system */}
                <div className="grid grid-cols-5 grid-rows-5 gap-1 h-full relative">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="border border-gray-700/50 rounded-sm"></div>
                  ))}

                  {/* Ship position */}
                  <motion.div
                    className="absolute w-6 h-6 bg-[#f90] rounded-full flex items-center justify-center"
                    style={{
                      left: `calc(${(shipState.position.coordinates[0] + 10) * 5}% - 12px)`,
                      top: `calc(${(shipState.position.coordinates[1] + 10) * 5}% - 12px)`,
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(255, 153, 0, 0.5)",
                        "0 0 15px rgba(255, 153, 0, 0.8)",
                        "0 0 0px rgba(255, 153, 0, 0.5)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <span className="text-xs text-black font-bold">NCC</span>
                  </motion.div>

                  {/* Animated scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-[#f90]/30"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>

                <div className="mt-4 text-center">
                  <div className="inline-block bg-black border border-[#f90] px-4 py-1 rounded-full">
                    <span className="lcars-readout text-[#f90]">
                      COORDINATES: [{shipState.position.coordinates.join(", ")}]
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
