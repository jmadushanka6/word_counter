export {}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "get-reading-time",
    title: "Get reading time",
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "get-reading-time" && info.selectionText) {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.action.openPopup()
    })
  }
})
