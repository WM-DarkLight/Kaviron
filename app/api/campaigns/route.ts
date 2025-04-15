import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { isValidCampaign } from "@/lib/campaigns"
import type { Campaign } from "@/lib/types"

export async function GET() {
  try {
    const campaignsDir = path.join(process.cwd(), "public", "campaigns")

    // Check if directory exists
    if (!fs.existsSync(campaignsDir)) {
      return NextResponse.json({ campaigns: [] })
    }

    // Read all files in the directory
    const files = fs.readdirSync(campaignsDir)

    // Filter for JSON files
    const jsonFiles = files.filter((file) => file.endsWith(".json"))

    // Parse each file and validate it's a campaign
    const campaigns: Campaign[] = []

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(campaignsDir, file)
        const content = fs.readFileSync(filePath, "utf8")
        const data = JSON.parse(content)

        if (isValidCampaign(data)) {
          campaigns.push(data)
        }
      } catch (error) {
        console.error(`Error reading campaign file ${file}:`, error)
        // Continue with other files
      }
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error in campaigns API route:", error)
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 })
  }
}
