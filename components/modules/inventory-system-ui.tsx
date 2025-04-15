"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Briefcase, Search, Package, Zap, Box, Shield, Stethoscope, Radio, Cpu, Archive } from "lucide-react"
import type { InventoryState } from "@/lib/modules/inventory-module"
import type { ModuleUIProps } from "@/lib/types"

export function InventorySystemUI({ state, dispatch, isActive }: ModuleUIProps) {
  const inventoryState = state as InventoryState
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)

  if (!isActive) return null

  const selectedItem = inventoryState.items.find((item) => item.id === selectedItemId)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "weapon":
        return "bg-red-600"
      case "tool":
        return "bg-blue-600"
      case "medical":
        return "bg-green-600"
      case "artifact":
        return "bg-purple-600"
      case "resource":
        return "bg-yellow-600"
      case "communication":
        return "bg-cyan-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "weapon":
        return <Shield className="h-5 w-5" />
      case "tool":
        return <Zap className="h-5 w-5" />
      case "medical":
        return <Stethoscope className="h-5 w-5" />
      case "artifact":
        return <Cpu className="h-5 w-5" />
      case "resource":
        return <Box className="h-5 w-5" />
      case "communication":
        return <Radio className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const handleUseItem = (itemId: string) => {
    dispatch("USE_ITEM", { itemId, consume: true })
  }

  const handleMoveItem = (itemId: string, location: string) => {
    dispatch("MOVE_ITEM", { itemId, location })
  }

  const filteredItems = inventoryState.items.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === null || item.type === filterType

    return matchesSearch && matchesType
  })

  // Get unique item types for filter
  const itemTypes = Array.from(new Set(inventoryState.items.map((item) => item.type)))

  return (
    <div className="space-y-4 p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#f90] rounded-full flex items-center justify-center mr-3">
            <Briefcase className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-[#f90] lcars-title">INVENTORY</h2>
        </div>
        <Badge className="bg-[#f90] text-black lcars-readout">
          {inventoryState.totalItems} / {inventoryState.capacity}
        </Badge>
      </div>

      {/* LCARS decorative bar */}
      <div className="flex w-full my-2">
        <div className="h-3 w-16 bg-[#f90] rounded-l-full"></div>
        <div className="h-3 w-8 bg-blue-500"></div>
        <div className="h-3 flex-grow bg-purple-500"></div>
        <div className="h-3 w-8 bg-blue-500"></div>
        <div className="h-3 w-16 bg-[#f90] rounded-r-full"></div>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border-gray-700 focus:border-[#f90] focus:ring-[#f90] pl-10 lcars-text"
          />
        </div>

        <select
          value={filterType || ""}
          onChange={(e) => setFilterType(e.target.value === "" ? null : e.target.value)}
          className="bg-black border-gray-700 rounded-md px-3 py-2 focus:border-[#f90] focus:ring-[#f90] lcars-text"
        >
          <option value="">All Types</option>
          {itemTypes.map((type) => (
            <option key={type} value={type} className="lcars-text">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 lcars-scanning">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedItemId === item.id
                    ? "border-[#f90] bg-black"
                    : "border-gray-700 bg-gray-900 hover:border-gray-500"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium lcars-text">{item.name}</div>
                    <div className="text-sm text-gray-400 lcars-readout">QTY: {item.quantity}</div>
                  </div>
                  <Badge className={`${getTypeColor(item.type)} text-white lcars-text uppercase`}>{item.type}</Badge>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8 lcars-text">NO ITEMS MATCH YOUR SEARCH</div>
          )}
        </div>

        {selectedItem ? (
          <Card className="bg-black border-[#f90] lcars-data-display">
            <CardHeader className="flex flex-row items-center pb-2">
              <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                {getTypeIcon(selectedItem.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-[#f90] lcars-title">{selectedItem.name}</CardTitle>
                  <Badge className={`${getTypeColor(selectedItem.type)} text-white lcars-text uppercase`}>
                    {selectedItem.type}
                  </Badge>
                </div>
                <CardDescription className="lcars-readout">
                  Quantity: {selectedItem.quantity} • Location: {selectedItem.location || "Unspecified"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="lcars-text">{selectedItem.description}</p>

              {selectedItem.properties && Object.keys(selectedItem.properties).length > 0 && (
                <div className="lcars-readout-display">
                  <h4 className="font-medium mb-2 lcars-text">PROPERTIES</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedItem.properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize lcars-text">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="lcars-readout">
                          {Array.isArray(value) ? value.join(", ") : value.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.assignedTo && (
                <div className="text-sm lcars-readout">
                  <span className="text-gray-400">Assigned to:</span> {selectedItem.assignedTo}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedItem.type === "medical" && (
                  <motion.button
                    onClick={() => handleUseItem(selectedItem.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-l-full lcars-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="lcars-text">USE ITEM</span>
                  </motion.button>
                )}

                {!selectedItem.assignedTo && (
                  <>
                    <motion.button
                      onClick={() => handleMoveItem(selectedItem.id, "cargo bay")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-l-full lcars-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="lcars-text">MOVE TO CARGO BAY</span>
                    </motion.button>

                    {selectedItem.type === "weapon" && (
                      <motion.button
                        onClick={() => handleMoveItem(selectedItem.id, "weapons locker")}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 lcars-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="lcars-text">MOVE TO WEAPONS LOCKER</span>
                      </motion.button>
                    )}

                    {selectedItem.type === "medical" && (
                      <motion.button
                        onClick={() => handleMoveItem(selectedItem.id, "sickbay")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-r-full lcars-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="lcars-text">MOVE TO SICKBAY</span>
                      </motion.button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black border-gray-700 flex items-center justify-center">
            <CardContent className="pt-6 text-center text-gray-400">
              <Archive className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="lcars-text">SELECT AN ITEM TO VIEW DETAILS</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
