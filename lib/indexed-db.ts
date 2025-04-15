export async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("StarTrekAdventure", 3) // Increment version to trigger upgrade

    request.onerror = () => {
      reject(new Error("Failed to open database"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result
      const oldVersion = event.oldVersion

      // Create episodes store if it doesn't exist
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains("episodes")) {
          const episodesStore = db.createObjectStore("episodes", { keyPath: "id" })
          episodesStore.createIndex("title", "title", { unique: false })
        }

        // Create saved states store
        if (!db.objectStoreNames.contains("savedStates")) {
          const savedStatesStore = db.createObjectStore("savedStates", {
            keyPath: "episodeId",
          })
          savedStatesStore.createIndex("episodeId", "episodeId", { unique: false })
          savedStatesStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }

      // Add userEpisodes store in version 2
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains("userEpisodes")) {
          const userEpisodesStore = db.createObjectStore("userEpisodes", { keyPath: "id" })
          userEpisodesStore.createIndex("dateAdded", "dateAdded", { unique: false })
        }
      }

      // Add campaigns and campaignProgress stores in version 3
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains("campaigns")) {
          const campaignsStore = db.createObjectStore("campaigns", { keyPath: "id" })
          campaignsStore.createIndex("title", "title", { unique: false })
        }

        if (!db.objectStoreNames.contains("campaignProgress")) {
          const campaignProgressStore = db.createObjectStore("campaignProgress", { keyPath: "campaignId" })
          campaignProgressStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("userCampaigns")) {
          const userCampaignsStore = db.createObjectStore("userCampaigns", { keyPath: "id" })
          userCampaignsStore.createIndex("dateAdded", "dateAdded", { unique: false })
        }
      }
    }
  })
}
