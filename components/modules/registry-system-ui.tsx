"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import type { RegistryState } from "@/lib/modules/registry-module"
import type { ModuleUIProps } from "@/lib/types"
import { Database, Search, Lock, FileText, Globe, Rocket, Users, Cpu, BookOpen } from "lucide-react"

export function RegistrySystemUI({ state, dispatch, isActive }: ModuleUIProps) {
  const registryState = state as RegistryState
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(registryState.lastAccessed || null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  if (!isActive) return null

  const selectedEntry = registryState.entries.find((entry) => entry.id === selectedEntryId && entry.discovered)

  // Update last accessed entry in the registry
  if (selectedEntryId && selectedEntryId !== registryState.lastAccessed) {
    dispatch("ACCESS_ENTRY", { entryId: selectedEntryId })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "species":
        return "bg-green-600"
      case "starship":
        return "bg-blue-600"
      case "planet":
        return "bg-purple-600"
      case "technology":
        return "bg-yellow-600"
      case "artifact":
        return "bg-red-600"
      case "person":
        return "bg-cyan-600"
      case "event":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "species":
        return <Users className="h-5 w-5" />
      case "starship":
        return <Rocket className="h-5 w-5" />
      case "planet":
        return <Globe className="h-5 w-5" />
      case "technology":
        return <Cpu className="h-5 w-5" />
      case "artifact":
        return <BookOpen className="h-5 w-5" />
      case "person":
        return <Users className="h-5 w-5" />
      case "event":
        return <FileText className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  const filteredEntries = registryState.entries.filter((entry) => {
    // Only show discovered entries
    if (!entry.discovered) return false

    const matchesSearch =
      searchTerm === "" ||
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === null || entry.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(
    new Set(registryState.entries.filter((entry) => entry.discovered).map((entry) => entry.category)),
  )

  return (
    <div className="space-y-4 p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#f90] rounded-full flex items-center justify-center mr-3">
            <Database className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-[#f90] lcars-title">FEDERATION DATABASE</h2>
        </div>
        <Badge className="bg-[#f90] text-black lcars-readout">
          {registryState.entries.filter((e) => e.discovered).length} ENTRIES
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
            placeholder="Search database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border-gray-700 focus:border-[#f90] focus:ring-[#f90] pl-10 lcars-text"
          />
        </div>

        <select
          value={categoryFilter || ""}
          onChange={(e) => setCategoryFilter(e.target.value === "" ? null : e.target.value)}
          className="bg-black border-gray-700 rounded-md px-3 py-2 focus:border-[#f90] focus:ring-[#f90] lcars-text"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category} className="lcars-text">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ScrollArea className="h-[500px] pr-4 lcars-scanning">
            <div className="space-y-2">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedEntryId === entry.id
                        ? "border-[#f90] bg-black"
                        : "border-gray-700 bg-gray-900 hover:border-gray-500"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium lcars-text">{entry.name}</div>
                      <Badge className={`${getCategoryColor(entry.category)} text-white lcars-text uppercase`}>
                        {entry.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 truncate mt-1 lcars-readout">{entry.description}</div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8 lcars-text">NO ENTRIES MATCH YOUR SEARCH</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="md:col-span-2">
          {selectedEntry ? (
            <Card className="bg-black border-[#f90] lcars-data-display">
              <CardHeader className="flex flex-row items-center pb-2">
                <div className="w-8 h-8 bg-[#f90] rounded-full flex items-center justify-center mr-2">
                  {getCategoryIcon(selectedEntry.category)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-[#f90] lcars-title">{selectedEntry.name}</CardTitle>
                    <Badge className={`${getCategoryColor(selectedEntry.category)} text-white lcars-text uppercase`}>
                      {selectedEntry.category}
                    </Badge>
                  </div>
                  <CardDescription className="lcars-readout">
                    Category: {selectedEntry.category.charAt(0).toUpperCase() + selectedEntry.category.slice(1)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="lcars-text">{selectedEntry.description}</p>

                {selectedEntry.imageUrl && (
                  <div className="flex justify-center my-4">
                    <motion.img
                      src={selectedEntry.imageUrl || "/placeholder.svg"}
                      alt={selectedEntry.name}
                      className="max-h-48 rounded-md border border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}

                <div className="lcars-readout-display">
                  <h4 className="font-medium mb-2 lcars-text">DETAILS</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedEntry.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-gray-800 pb-1">
                        <span className="capitalize font-medium lcars-text">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="lcars-readout">{value.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEntry.classified && (
                  <motion.div
                    className="flex items-center space-x-2 bg-red-900/20 p-3 rounded-md border border-red-900"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Lock className="h-5 w-5 text-red-500" />
                    <span className="text-red-400 lcars-text">THIS ENTRY CONTAINS CLASSIFIED INFORMATION</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black border-gray-700 h-full flex items-center justify-center">
              <CardContent className="pt-6 text-center text-gray-400">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                <p className="lcars-text">SELECT AN ENTRY TO VIEW DETAILS</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
