import type { Campaign } from "../types"

export const firstCampaign: Campaign = {
  id: "federation-crisis",
  title: "Federation Crisis",
  author: "Starfleet Command",
  description: "A multi-episode campaign that follows a growing crisis within the Federation.",
  version: "1.0",
  episodes: [
    {
      episodeId: "first-contact",
      title: "First Contact: The Unknown Signal",
      description: "Investigate a mysterious signal coming from an unexplored sector of space.",
      order: 1,
    },
    {
      episodeId: "diplomatic-mission",
      title: "Diplomatic Mission: The Romulan Envoy",
      description: "Escort a Romulan diplomat to a crucial peace conference.",
      order: 2,
      condition: {
        previousEpisodeId: "first-contact",
        flags: {
          peacefulResolution: true,
        },
      },
      initialState: {
        flags: {
          romulansCooperative: true,
        },
      },
    },
    {
      episodeId: "romulan-encounter",
      title: "Neutral Zone Incident",
      description: "Deal with the aftermath of the mysterious signal discovery.",
      order: 2,
      condition: {
        previousEpisodeId: "first-contact",
        flags: {
          peacefulResolution: false,
        },
      },
      initialState: {
        flags: {
          romulansHostile: true,
        },
      },
    },
  ],
}
