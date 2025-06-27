import { useState } from "react"

function IndexPopup() {
  const [text, setText] = useState("")
  const [wpm, setWpm] = useState(200)

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
  const readingTime = wpm > 0 ? (wordCount / wpm).toFixed(2) : "0"

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        width: 300
      }}>
      <h2>Word Counter</h2>
      <textarea
        style={{
          width: "100%",
          height: 120,
          resize: "vertical",
          padding: 8,
          borderRadius: 4
        }}
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
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
        <strong>Reading time:</strong> {readingTime} min
      </div>
    </div>
  )
}

export default IndexPopup
