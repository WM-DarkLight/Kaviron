import type { Campaign } from "../types"
import { firstCampaign } from "./first-campaign"

// This array contains all the built-in campaigns
export const builtInCampaigns: Campaign[] = [firstCampaign]

// This function will be used to validate campaign files
export function isValidCampaign(obj: any): obj is Campaign {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.author === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.episodes) &&
    obj.episodes.length > 0 &&
    obj.episodes.every(
      (ep: any) => typeof ep.episodeId === "string" && typeof ep.title === "string" && typeof ep.order === "number",
    )
  )
}
