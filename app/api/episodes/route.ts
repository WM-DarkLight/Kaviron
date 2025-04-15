import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isValidEpisode } from "@/lib/episodes"
import type { Episode } from "@/lib/types"

export async function GET() {
  try {
    const episodesDir = path.join(process.cwd(), "public", "episodes")

    // Check if directory exists
    if (!fs.existsSync(episodesDir)) {
      fs.mkdirSync(episodesDir, { recursive: true })
      return NextResponse.json({ episodes: [] })
    }

    // Read all files in the directory
    const files = fs.readdirSync(episodesDir)

    // Filter for JSON files
    const jsonFiles = files.filter((file) => file.endsWith(".json"))

    // Parse each file and validate
    const episodes: Episode[] = []

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(episodesDir, file)
        const content = fs.readFileSync(filePath, "utf8")
        const data = JSON.parse(content)

        if (isValidEpisode(data)) {
          episodes.push(data)
        } else {
          console.warn(`Invalid episode format in file: ${file}`)
        }
      } catch (error) {
        console.error(`Error reading episode file ${file}:`, error)
      }
    }

    return NextResponse.json({ episodes })
  } catch (error) {
    console.error("Error loading episodes from filesystem:", error)
    return NextResponse.json({ episodes: [], error: "Failed to load episodes" }, { status: 500 })
  }
}
