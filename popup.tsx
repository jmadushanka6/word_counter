import { useEffect, useMemo, useState } from "react"
import { syllable } from "syllable"

function IndexPopup() {
  const [text, setText] = useState("")
  const [wpm, setWpm] = useState(200)

  function countWords(content: string) {
    const cleaned = content.replace(/\s+/g, " ").trim()
    return cleaned === "" ? 0 : cleaned.split(" ").length
  }

  function countSentences(content: string) {
    return content.split(/[.!?]+/).filter(Boolean).length
  }

  function readingEase(content: string) {
    const words = countWords(content)
    const sentences = countSentences(content)
    const syllables = content
      .split(/\s+/)
      .reduce((acc, w) => acc + syllable(w), 0)
    if (words === 0 || sentences === 0) {
      return 0
    }
    const score =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    return Math.round(score)
  }

  useEffect(() => {
    chrome.storage.local.get(["selectedText", "wpm"], (res) => {
      if (res.wpm) {
        setWpm(res.wpm)
      }
      const storedText = res.selectedText as string | undefined
      if (storedText && storedText.trim() !== "") {
        setText(storedText)
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
                setText(selection)
              } else {
                chrome.tabs.sendMessage(
                  tabId,
                  { type: "GET_PAGE_TEXT" },
                  (res2) => {
                    if (res2 && typeof res2.text === "string") {
                      setText(res2.text)
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

  const wordCount = useMemo(() => countWords(text), [text])
  const totalSeconds = wpm > 0 ? Math.ceil((wordCount / wpm) * 60) : 0
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const difficultyScore = useMemo(() => readingEase(text), [text])
  const difficultyLabel = useMemo(() => {
    if (difficultyScore >= 80) return "easy"
    if (difficultyScore >= 60) return "medium"
    return "hard"
  }, [difficultyScore])

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
      <div>
        <strong>Difficulty:</strong> {difficultyLabel} ({difficultyScore})
      </div>
    </div>
  )
}

export default IndexPopup
