import type { Episode } from "./types"

export const episodeWithModules: Episode = {
  id: "romulan-encounter",
  title: "Neutral Zone Incident",
  author: "Starfleet Command",
  description: "Investigate a distress signal near the Romulan Neutral Zone that could spark an interstellar incident.",
  stardate: "48214.5",
  shipName: "USS Endeavour NCC-71805",
  requiredModules: ["ship", "crew", "inventory", "mission"], // This episode requires these modules
  moduleConfig: {
    ship: {
      name: "USS Endeavour",
      registry: "NCC-71805",
      class: "Nebula",
      position: {
        sector: "Neutral Zone Border",
        coordinates: [2, -3, 0],
      },
    },
    mission: {
      currentMission: {
        id: "neutral-zone-investigation",
        title: "Neutral Zone Investigation",
        description:
          "Investigate a distress signal originating near the Romulan Neutral Zone without provoking an incident.",
        status: "active",
        objectives: [
          {
            id: "locate-signal",
            description: "Locate the source of the distress signal",
            completed: false,
            optional: false,
            hidden: false,
          },
          {
            id: "scan-debris",
            description: "Scan the debris field for survivors",
            completed: false,
            optional: false,
            hidden: true,
          },
          {
            id: "contact-romulans",
            description: "Establish communication with Romulan patrol",
            completed: false,
            optional: false,
            hidden: true,
          },
          {
            id: "rescue-survivors",
            description: "Rescue any survivors without crossing the Neutral Zone",
            completed: false,
            optional: false,
            hidden: true,
          },
          {
            id: "avoid-conflict",
            description: "Avoid armed conflict with Romulan forces",
            completed: false,
            optional: false,
            hidden: false,
          },
        ],
        progress: 0,
      },
      missionLog: [
        {
          timestamp: Date.now() - 3600000,
          text: "Mission briefing received from Starfleet Command",
        },
        {
          timestamp: Date.now() - 1800000,
          text: "USS Endeavour dispatched to investigate distress signal near Neutral Zone",
        },
      ],
    },
  },
  scenes: {
    start: {
      id: "start",
      title: "Bridge - USS Endeavour",
      text: [
        "Captain's Log, Stardate 48214.5. The USS Endeavour has been dispatched to investigate a distress signal originating near the Romulan Neutral Zone. Starfleet Command is concerned that this could be a genuine emergency or possibly a Romulan trap.",
        "As you finish your log entry, your first officer, Commander Voss, approaches your chair.",
        "\"Captain, we're approaching the coordinates of the distress signal. Long-range sensors are detecting debris consistent with a Federation freighter. There's also unusual energy readings that could indicate Romulan presence in the area.\"",
        'Lieutenant Chen at tactical adds, "Captain, we\'re still on our side of the Neutral Zone, but just barely. The debris field appears to extend into Romulan space."',
      ],
      choices: [
        {
          text: '"Yellow alert. Shields up. Let\'s proceed with caution."',
          nextScene: "yellow-alert",
          moduleActions: [
            {
              module: "ship",
              action: "RAISE_SHIELDS",
            },
          ],
        },
        {
          text: "\"Scan the debris field. Let's confirm if it's a Federation vessel.\"",
          nextScene: "scan-debris",
          moduleActions: [
            {
              module: "mission",
              action: "COMPLETE_OBJECTIVE",
              payload: { objectiveId: "locate-signal" },
            },
          ],
        },
        {
          text: '"Hail any vessels in the area, including potential Romulan ships."',
          nextScene: "hail-area",
        },
      ],
    },
    "yellow-alert": {
      id: "yellow-alert",
      title: "Bridge - Yellow Alert",
      text: [
        '"Yellow alert. Shields up," you order.',
        "The alert panels around the bridge illuminate with a yellow glow as the crew moves to a heightened state of readiness.",
        '"Shields at full power," reports Lieutenant Chen.',
        "Commander Voss nods approvingly. \"A wise precaution, Captain. We don't know what we're dealing with yet.\"",
        '"Sensors are now detecting multiple energy signatures consistent with Romulan disruptor fire in the debris field," reports your science officer, Lieutenant T\'Lara. "The attack appears to have occurred approximately 6.4 hours ago."',
      ],
      choices: [
        {
          text: '"Scan the debris field for any signs of survivors."',
          nextScene: "scan-survivors",
          moduleActions: [
            {
              module: "mission",
              action: "COMPLETE_OBJECTIVE",
              payload: { objectiveId: "locate-signal" },
            },
            {
              module: "mission",
              action: "REVEAL_OBJECTIVE",
              payload: { objectiveId: "scan-debris" },
            },
          ],
        },
        {
          text: '"Move us closer to the Neutral Zone boundary for a better scan."',
          nextScene: "approach-boundary",
          moduleActions: [
            {
              module: "ship",
              action: "SET_POSITION",
              payload: { coordinates: [3, -2, 0] },
            },
          ],
        },
        {
          text: '"Launch a probe into the debris field to gather more data."',
          nextScene: "launch-probe",
          condition: {
            moduleConditions: [
              {
                module: "inventory",
                condition: "HAS_ITEM",
                params: { itemId: "class-3-probe" },
              },
            ],
          },
        },
      ],
    },
    // More scenes would continue here
  },
}
