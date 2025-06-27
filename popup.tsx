import { useEffect, useState } from "react"

function IndexPopup() {
  const [text, setText] = useState("")
  const [wpm, setWpm] = useState(200)

  useEffect(() => {
    chrome.storage.local.get(["selectedText", "wpm"], (res) => {
      if (res.selectedText) {
        setText(res.selectedText)
      }
      if (res.wpm) {
        setWpm(res.wpm)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.local.set({ wpm })
  }, [wpm])

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
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
      <textarea
        style={{
          width: "100%",
          height: 100,
          resize: "vertical",
          padding: 8,
          borderRadius: 4
        }}
        placeholder="Select text on the page first"
        value={text}
        readOnly
      />
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
