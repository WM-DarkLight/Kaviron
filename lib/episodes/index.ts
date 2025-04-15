import type { Episode } from "../types"
import { defaultEpisode } from "../default-episode"
import { secondEpisode } from "../second-episode"
import { episodeWithModules } from "../episode-with-modules"

// This array contains all the built-in episodes
export const builtInEpisodes: Episode[] = [defaultEpisode, secondEpisode, episodeWithModules]

// This function will be used to validate episode files
export function isValidEpisode(obj: any): obj is Episode {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.author === "string" &&
    typeof obj.description === "string" &&
    typeof obj.stardate === "string" &&
    typeof obj.shipName === "string" &&
    typeof obj.scenes === "object" &&
    Object.keys(obj.scenes).length > 0
  )
}
