export {}

// Display a quick-read badge showing estimated reading time
async function showReadingBadge() {
  if (document.getElementById("quick-read-badge")) {
    return
  }

  const text = getVisibleText()
  const wordTotal = countWords(text)
  const { wpm } = await chrome.storage.local.get("wpm")
  const wordsPerMinute = typeof wpm === "number" && wpm > 0 ? wpm : 200
  const minutes = Math.max(1, Math.ceil(wordTotal / wordsPerMinute))

  const badge = document.createElement("div")
  badge.id = "quick-read-badge"
  badge.textContent = `\u23F1 ${minutes} min`
  Object.assign(badge.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    zIndex: "2147483647"
  })

  document.body.appendChild(badge)
}

function getVisibleText(): string {
  const clone = document.body.cloneNode(true) as HTMLElement

  // Remove elements we do not want to count words from
  clone
    .querySelectorAll("script,style,nav,header,footer,aside")
    .forEach((el) => el.remove())

  // Remove hidden elements
  clone.querySelectorAll("*").forEach((el) => {
    const element = el as HTMLElement
    const style = window.getComputedStyle(element)
    if (style.display === "none" || style.visibility === "hidden") {
      element.remove()
    }
  })

  return clone.innerText
}

function countWords(text: string): number {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (cleaned === "") {
    return 0
  }
  return cleaned.split(" ").filter(Boolean).length
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "COUNT_WORDS") {
    const text = getVisibleText()
    const count = countWords(text)
    sendResponse({ count })
  } else if (msg.type === "GET_SELECTED_TEXT") {
    const text = window.getSelection()?.toString() ?? ""
    sendResponse({ text })
  } else if (msg.type === "GET_PAGE_TEXT") {
    sendResponse({ text: getVisibleText() })
  }
})

// show the badge once the content script loads
showReadingBadge()
