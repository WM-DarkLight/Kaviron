import type { Episode } from "./types"

export const secondEpisode: Episode = {
  id: "diplomatic-mission",
  title: "Diplomatic Mission: The Romulan Envoy",
  author: "Starfleet Diplomatic Corps",
  description: "Escort a Romulan diplomat to a crucial peace conference while navigating political intrigue.",
  stardate: "48305.62",
  shipName: "USS Excelsior NCC-2000",
  scenes: {
    start: {
      id: "start",
      title: "Bridge - USS Excelsior",
      text: [
        "Captain's Log, Stardate 48305.62. The USS Excelsior has been assigned a sensitive diplomatic mission. We are to rendezvous with a Romulan vessel at the Neutral Zone and transport Ambassador T'Rel to the peace conference on Nimbus III.",
        "This marks the first time a Romulan diplomat has willingly boarded a Federation starship in over fifteen years. The success of this mission could significantly improve relations between our peoples.",
        "As you finish your log entry, your first officer, Commander Chen, approaches your chair.",
        "\"Captain, we're approaching the rendezvous coordinates. The Romulan vessel D'deridex is already waiting for us.\"",
      ],
      choices: [
        {
          text: '"Slow to impulse power. Open a channel to the Romulan vessel."',
          nextScene: "hail-romulans",
          setFlags: { approachedCautiously: true },
        },
        {
          text: '"Yellow alert. Shields at standby. I want to be prepared for anything."',
          nextScene: "yellow-alert",
          setFlags: { yellowAlert: true },
        },
        {
          text: '"Scan the Romulan vessel. I want to know their weapons status."',
          nextScene: "scan-romulans",
          setFlags: { scannedRomulans: true },
        },
      ],
    },
    "hail-romulans": {
      id: "hail-romulans",
      title: "Bridge - Opening Communications",
      text: [
        '"Slowing to impulse power, Captain," reports Lieutenant Park at the helm.',
        '"Channel open," announces your communications officer, Lieutenant T\'Lara.',
        "The viewscreen flickers to life, revealing the stern face of a Romulan commander. His sharp features and calculating eyes study you carefully before he speaks.",
        "\"Captain, I am Commander Tomalak of the Imperial Warbird D'deridex. We have been expecting you. Ambassador T'Rel is prepared for transport to your vessel.\"",
        "The commander's tone is formal but carries an undercurrent of suspicion that is typical of Romulan military officers.",
        '"I must emphasize the importance of this mission, Captain. The Ambassador\'s safety is paramount. Any... incident... would have severe diplomatic consequences."',
        'Commander Chen whispers to you, "Standard Romulan posturing, Captain. They always include a veiled threat."',
      ],
      choices: [
        {
          text: "\"We're honored to transport Ambassador T'Rel. Please prepare her for beam-out at your convenience.\"",
          nextScene: "diplomatic-response",
          setFlags: { diplomaticApproach: true },
        },
        {
          text: '"The Federation takes the safety of all diplomats seriously, Commander. We\'ll ensure the Ambassador arrives safely."',
          nextScene: "professional-response",
          setFlags: { professionalApproach: true },
        },
        {
          text: '"I assure you, Commander, that any... incident... would be equally concerning to Starfleet Command."',
          nextScene: "firm-response",
          setFlags: { firmApproach: true },
        },
      ],
    },
    "yellow-alert": {
      id: "yellow-alert",
      title: "Bridge - Yellow Alert",
      text: [
        '"Yellow alert. Shields on standby," you order.',
        "The alert panels around the bridge illuminate with a yellow glow as the crew moves to a heightened state of readiness.",
        '"Approaching Romulan vessel at one-quarter impulse," reports Lieutenant Park.',
        'Commander Chen looks concerned. "Captain, the Romulans might interpret this as a sign of hostility."',
        'Your tactical officer, Lieutenant Commander Sovar, adds, "The Romulan vessel has raised shields but weapons remain powered down. They are hailing us."',
      ],
      choices: [
        {
          text: '"Stand down yellow alert and open a channel."',
          nextScene: "stand-down-alert",
          setFlags: { yellowAlert: false },
        },
        {
          text: '"Maintain yellow alert and open a channel."',
          nextScene: "maintain-alert",
        },
        {
          text: '"Scan for any other vessels in the area before responding."',
          nextScene: "scan-area",
          setFlags: { scannedArea: true },
        },
      ],
    },
    "scan-romulans": {
      id: "scan-romulans",
      title: "Bridge - Tactical Scan",
      text: [
        '"Scanning the Romulan vessel," reports Lieutenant Commander Sovar from tactical.',
        'After a moment, he continues, "The D\'deridex has shields at minimum power, which is standard procedure. Weapons systems are powered down but operational. I am detecting approximately 1,500 life signs, which is normal crew complement for a vessel of that class."',
        '"I am also detecting one additional life sign with different readings... likely the Ambassador. The Romulans appear to be operating under standard diplomatic protocols."',
        'Commander Chen nods. "Seems like they\'re playing it straight, Captain."',
        '"The Romulan vessel is hailing us," announces Lieutenant T\'Lara.',
      ],
      choices: [
        {
          text: '"Open a channel."',
          nextScene: "hail-romulans",
        },
        {
          text: '"Yellow alert first, then open a channel."',
          nextScene: "yellow-alert",
          setFlags: { yellowAlert: true, scannedRomulans: true },
        },
        {
          text: '"Scan for any other vessels in the area before responding."',
          nextScene: "scan-area",
          setFlags: { scannedArea: true, scannedRomulans: true },
        },
      ],
    },
    // Additional scenes would continue here
  },
}
