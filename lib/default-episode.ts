import type { Episode } from "./types"

export const defaultEpisode: Episode = {
  id: "first-contact",
  title: "First Contact: The Unknown Signal",
  author: "Starfleet Command",
  description: "Investigate a mysterious signal coming from an unexplored sector of space.",
  stardate: "47634.44",
  shipName: "USS Enterprise NCC-1701-D",
  scenes: {
    start: {
      id: "start",
      title: "Bridge - USS Enterprise",
      text: [
        '"Captain, we\'re receiving an unusual signal from the Gamma Hydra sector," reports Lieutenant Commander Data from his operations console.',
        'Commander Riker turns to you. "Captain, Starfleet has no record of any Federation vessels in that area. The signal appears to be using an outdated Starfleet encryption algorithm."',
        '"The nearest starbase is three days away at maximum warp," adds Lieutenant Worf from tactical.',
      ],
      choices: [
        {
          text: "Set a course for the signal's origin, warp factor 8.",
          nextScene: "en-route",
          setVariables: { warpSpeed: 8 },
        },
        {
          text: "Attempt to hail the source of the signal first.",
          nextScene: "hail-attempt",
        },
        {
          text: "Send a message to Starfleet Command requesting instructions.",
          nextScene: "starfleet-response",
        },
      ],
    },
    "en-route": {
      id: "en-route",
      title: "En Route - Gamma Hydra Sector",
      text: [
        '"Course laid in, Captain. We\'ll arrive at the coordinates in approximately 6 hours," reports Ensign Crusher from the helm.',
        "As the Enterprise streaks through space at warp 8, Commander Data continues to analyze the mysterious signal.",
        "\"Captain, I've determined that the signal contains what appears to be a distress call, but there's something unusual about it. The encryption is indeed Starfleet, but it's using a protocol that was discontinued over 80 years ago.\"",
      ],
      choices: [
        {
          text: '"Data, search the historical records for any Starfleet vessels that may have gone missing in this region."',
          nextScene: "historical-search",
          setFlags: { researchedHistory: true },
        },
        {
          text: '"Increase to warp 9. I want to get there as soon as possible."',
          nextScene: "warp-9",
          setVariables: { warpSpeed: 9 },
        },
        {
          text: '"Yellow alert. Let\'s be prepared for anything when we arrive."',
          nextScene: "yellow-alert",
          setFlags: { yellowAlert: true },
        },
      ],
    },
    "hail-attempt": {
      id: "hail-attempt",
      title: "Bridge - Communication Attempt",
      text: [
        '"Opening hailing frequencies," Lieutenant Worf reports.',
        'After several attempts, Worf shakes his head. "No response, Captain. The signal continues, but it appears to be automated."',
        "Counselor Troi leans forward. \"Captain, I sense... nothing. If there are living beings there, they're either too far away for me to sense, or they're...\"",
        "She doesn't finish the sentence, but her implication is clear.",
      ],
      choices: [
        {
          text: '"Set a course for the signal\'s origin, warp factor 8."',
          nextScene: "en-route",
          setVariables: { warpSpeed: 8 },
        },
        {
          text: '"Data, analyze the signal further. I want to know everything about it before we proceed."',
          nextScene: "signal-analysis",
          setFlags: { analyzedSignal: true },
        },
      ],
    },
    "starfleet-response": {
      id: "starfleet-response",
      title: "Bridge - Awaiting Orders",
      text: [
        '"Message sent to Starfleet Command," reports Lieutenant Worf.',
        "After a brief wait, a response comes through. Admiral Hanson appears on the viewscreen.",
        '"Captain, we have no record of any authorized Starfleet operations in the Gamma Hydra sector. That region borders Romulan space, so proceed with caution. Investigate the signal, but do not, I repeat, do not cross into Romulan territory under any circumstances. Starfleet out."',
        "The viewscreen returns to the starfield ahead.",
      ],
      choices: [
        {
          text: '"Set a course for the signal\'s origin, warp factor 8."',
          nextScene: "en-route",
          setVariables: { warpSpeed: 8 },
        },
        {
          text: '"Red alert. Shields up. We\'ll approach with caution."',
          nextScene: "red-alert",
          setFlags: { redAlert: true },
        },
      ],
    },
    "historical-search": {
      id: "historical-search",
      title: "Bridge - Historical Research",
      text: [
        "Data works quickly at his console, accessing the Enterprise's historical database.",
        '"Captain, I have found a reference to a Starfleet vessel, the USS Hera, NCC-31240. It was reported missing in this general vicinity approximately 82 years ago while on a deep space exploration mission."',
        '"The Hera was a Daedalus-class starship with a crew of 87. It was commanded by Captain Jonathan Chen. Their last reported position was approximately 0.8 light-years from the source of our signal."',
        'Riker looks concerned. "A ship missing for over 80 years suddenly sending a distress call? That doesn\'t make sense."',
      ],
      choices: [
        {
          text: '"Continue on course. Let\'s see what we find."',
          nextScene: "arrival",
        },
        {
          text: '"Scan for any signs of temporal anomalies in the region."',
          nextScene: "temporal-scan",
          setFlags: { scannedForAnomalies: true },
        },
        {
          text: '"Yellow alert. We should be prepared for anything."',
          nextScene: "yellow-alert",
          setFlags: { yellowAlert: true },
          condition: {
            flags: { yellowAlert: false },
          },
        },
      ],
    },
    "warp-9": {
      id: "warp-9",
      title: "En Route - Maximum Warp",
      text: [
        '"Increasing to warp 9, Captain," Ensign Crusher acknowledges, adjusting the ship\'s velocity.',
        "The hum of the warp engines intensifies slightly as the Enterprise accelerates.",
        '"We\'ll arrive at the coordinates in approximately 3.5 hours," reports Crusher.',
        'Chief Engineer La Forge calls from Engineering. "Captain, we can maintain warp 9 for the duration, but I\'m keeping an eye on the intermix ratio. Just so you know."',
      ],
      choices: [
        {
          text: '"Understood, Geordi. Keep me informed of any changes."',
          nextScene: "arrival",
        },
        {
          text: '"Data, continue analyzing that signal. I want to know everything about it before we arrive."',
          nextScene: "signal-analysis",
          setFlags: { analyzedSignal: true },
        },
        {
          text: '"Yellow alert. Let\'s be prepared for anything when we arrive."',
          nextScene: "yellow-alert",
          setFlags: { yellowAlert: true },
          condition: {
            flags: { yellowAlert: false },
          },
        },
      ],
    },
    "yellow-alert": {
      id: "yellow-alert",
      title: "Bridge - Yellow Alert",
      text: [
        '"Yellow alert," you order. The lighting on the bridge shifts slightly, and alert panels illuminate around the ship.',
        '"Shields at standby, weapons systems on hot standby," reports Lieutenant Worf with approval in his voice.',
        'Commander Riker nods. "A wise precaution, Captain."',
        "The Enterprise continues on course to the mysterious signal, the crew now at a heightened state of readiness.",
      ],
      choices: [
        {
          text: '"Continue on course. Let\'s see what we find."',
          nextScene: "arrival",
        },
        {
          text: '"Data, search the historical records for any Starfleet vessels that may have gone missing in this region."',
          nextScene: "historical-search",
          setFlags: { researchedHistory: true },
          condition: {
            flags: { researchedHistory: false },
          },
        },
        {
          text: '"Scan for any signs of temporal anomalies in the region."',
          nextScene: "temporal-scan",
          setFlags: { scannedForAnomalies: true },
          condition: {
            flags: { scannedForAnomalies: false },
          },
        },
      ],
    },
    "signal-analysis": {
      id: "signal-analysis",
      title: "Bridge - Signal Analysis",
      text: [
        "Data works diligently at his console, analyzing the mysterious signal in greater detail.",
        '"Captain, I have completed my analysis. The signal is indeed a Starfleet distress call using an encryption algorithm from the late 23rd century. However, there is something unusual about it."',
        'Data turns to face you. "The signal appears to be repeating on a precise 12.4-minute loop. Furthermore, embedded within the encryption is what appears to be a set of coordinates, different from the signal\'s origin point."',
        '"The coordinates point to a location approximately 0.3 light-years from the signal\'s source, in a dense asteroid field."',
      ],
      choices: [
        {
          text: '"Continue to the signal\'s origin as planned."',
          nextScene: "arrival",
        },
        {
          text: '"Change course to the embedded coordinates instead."',
          nextScene: "asteroid-field",
          setFlags: { changedCourse: true },
        },
        {
          text: '"Data, search the historical records for any Starfleet vessels that may have gone missing in this region."',
          nextScene: "historical-search",
          setFlags: { researchedHistory: true },
          condition: {
            flags: { researchedHistory: false },
          },
        },
      ],
    },
    "red-alert": {
      id: "red-alert",
      title: "Bridge - Red Alert",
      text: [
        '"Red alert! Shields up!" you command.',
        "The bridge lighting shifts to a red hue as alert klaxons sound briefly throughout the ship. The crew moves with practiced efficiency to battle stations.",
        '"Shields at full power, phasers and photon torpedoes on standby," reports Lieutenant Worf.',
        '"The Enterprise is at battle readiness, Captain," confirms Commander Riker.',
        "The tension on the bridge is palpable as the ship continues toward the mysterious signal.",
      ],
      choices: [
        {
          text: '"Continue on course. Let\'s see what we find."',
          nextScene: "arrival",
        },
        {
          text: '"Data, search the historical records for any Starfleet vessels that may have gone missing in this region."',
          nextScene: "historical-search",
          setFlags: { researchedHistory: true },
          condition: {
            flags: { researchedHistory: false },
          },
        },
        {
          text: '"Scan for any signs of Romulan activity in the area."',
          nextScene: "romulan-scan",
          setFlags: { scannedForRomulans: true },
        },
      ],
    },
    "temporal-scan": {
      id: "temporal-scan",
      title: "Bridge - Temporal Scan",
      text: [
        '"Mr. Data, scan for temporal anomalies in the region," you order.',
        "Data configures the ship's sensors and begins the scan. After a few moments, he reports his findings.",
        '"Captain, I am detecting unusual temporal fluctuations approximately 0.2 light-years from our current position. The readings are consistent with a localized temporal distortion field."',
        '"Could a ship be trapped in such a distortion?" asks Riker.',
        '"It is possible, Commander," Data replies. "If a vessel were caught in such a field, time might pass differently for them than for the surrounding space."',
      ],
      choices: [
        {
          text: '"Continue to the signal\'s origin as planned."',
          nextScene: "arrival",
        },
        {
          text: '"Adjust course to investigate the temporal anomaly."',
          nextScene: "temporal-anomaly",
          setFlags: { investigatedAnomaly: true },
        },
        {
          text: '"Data, what would happen to a crew trapped in such a distortion for 80 years?"',
          nextScene: "temporal-theory",
          setFlags: { discussedTemporalTheory: true },
        },
      ],
    },
    arrival: {
      id: "arrival",
      title: "Signal Origin - Gamma Hydra Sector",
      text: [
        "The Enterprise drops out of warp at the coordinates of the mysterious signal.",
        '"Standard orbit, Ensign," you order as the viewscreen shows the scene before you.',
        "A small, barren planetoid floats in space, its surface cratered and lifeless. In orbit around it is what appears to be the remains of an old Starfleet vessel, heavily damaged and clearly adrift for many years.",
        '"Sensors confirm it\'s a Daedalus-class starship, registry NCC-31240... the USS Hera," reports Data.',
        '"Life signs?" you ask.',
        'Worf checks his console. "None detected, Captain. The ship appears to have been abandoned for decades."',
      ],
      choices: [
        {
          text: '"Prepare an away team. We need to investigate that ship."',
          nextScene: "away-team-prep",
        },
        {
          text: '"Scan for the source of the signal. Is it coming from the Hera?"',
          nextScene: "signal-source",
        },
        {
          text: '"Data, what\'s the condition of the ship? Could it have survivors?"',
          nextScene: "ship-condition",
        },
      ],
    },
    // More scenes would be added here for a complete episode
  },
}
