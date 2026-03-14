import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// Initialize default theme
chrome.runtime.onInstalled.addListener(async () => {
  const currentTheme = await storage.get("chooseTheme")
  if (!currentTheme) {
    await storage.set("chooseTheme", "stackoverflow-dark.css")
  }
})

// Listen for network requests to Flomo notes API
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("https://h5.udrig.com/app/v1")) {
      console.log("Captured target request:", details.url)
      
      if (details.tabId >= 0) {
        chrome.tabs.sendMessage(details.tabId, { action: "highlightCode" }).catch(() => {
          // Ignore error if tab is not ready or content script not injected
        })
      }
    }
  },
  { urls: ["https://h5.udrig.com/app/v1*"] }
)
