export {}

function getVisibleText(): string {
  const clone = document.body.cloneNode(true) as HTMLElement

  // Remove elements we do not want to count words from
  clone.querySelectorAll('script,style,nav,header,footer,aside').forEach((el) =>
    el.remove()
  )

  // Remove hidden elements
  clone.querySelectorAll('*').forEach((el) => {
    const element = el as HTMLElement
    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') {
      element.remove()
    }
  })

  return clone.innerText
}

function countWords(text: string): number {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned === '') {
    return 0
  }
  return cleaned.split(' ').filter(Boolean).length
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'COUNT_WORDS') {
    const text = getVisibleText()
    const count = countWords(text)
    sendResponse({ count })
  }
})
