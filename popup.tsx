import { useEffect, useState } from "react"

function IndexPopup() {
  const [wordCount, setWordCount] = useState(0)
  const [wpm, setWpm] = useState(200)

  function countWords(text: string) {
    const cleaned = text.replace(/\s+/g, " ").trim()
    return cleaned === "" ? 0 : cleaned.split(" ").length
  }

  useEffect(() => {
    chrome.storage.local.get(["selectedText", "wpm"], (res) => {
      if (res.wpm) {
        setWpm(res.wpm)
      }
      const storedText = res.selectedText as string | undefined
      if (storedText && storedText.trim() !== "") {
        setWordCount(countWords(storedText))
        chrome.storage.local.remove("selectedText")
        return
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(
            tabId,
            { type: "GET_SELECTED_TEXT" },
            (selRes) => {
              const selection = selRes?.text as string | undefined
              if (selection && selection.trim() !== "") {
                setWordCount(countWords(selection))
              } else {
                chrome.tabs.sendMessage(
                  tabId,
                  { type: "COUNT_WORDS" },
                  (res2) => {
                    if (res2 && typeof res2.count === "number") {
                      setWordCount(res2.count)
                    }
                  }
                )
              }
            }
          )
        }
      })
    })
  }, [])

  useEffect(() => {
    chrome.storage.local.set({ wpm })
  }, [wpm])

  const totalSeconds = wpm > 0 ? Math.ceil((wordCount / wpm) * 60) : 0
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        width: 300
      }}>
      <h2>Reading Time</h2>
      <label
        style={{
          display: "block",
          marginTop: 8
        }}>
        Words per minute:
        <input
          type="number"
          min={1}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          style={{
            width: "100%",
            marginTop: 4,
            padding: 4,
            borderRadius: 4
          }}
        />
      </label>
      <div style={{ marginTop: 8 }}>
        <strong>Word count:</strong> {wordCount}
      </div>
      <div>
        <strong>Reading time:</strong> {minutes} min {seconds} sec
      </div>
    </div>
  )
}

export default IndexPopup
