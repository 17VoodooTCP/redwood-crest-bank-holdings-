import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE HORIZONTAL-SCROLL LOCKDOWN
   ───────────────────────────────────────────────────────────────────────
   On iPhones ALL browsers (Safari, Chrome, Brave, Firefox) use WebKit
   and share the same scroll behaviour. iOS ignores overflow-x:hidden on
   <body> for real touch-based scrolling — the browser scrolls the viewport
   itself. The only reliable fix is intercepting touchmove at the raw event
   level and cancelling horizontal swipes before iOS ever acts on them.

   We allow horizontal movement ONLY when the user's finger is over an
   element (or one of its ancestors) that is genuinely horizontally
   scrollable AND has content wider than its visible area.
   ═══════════════════════════════════════════════════════════════════════ */
;(function lockHorizontalScroll() {
  let startX = 0
  let startY = 0

  document.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }, { passive: true })

  document.addEventListener('touchmove', function (e) {
    const dx = Math.abs(e.touches[0].clientX - startX)
    const dy = Math.abs(e.touches[0].clientY - startY)

    // If the gesture is more vertical than horizontal, always allow it.
    if (dy >= dx) return

    // Horizontal gesture — walk up the DOM from the touch target.
    // If we find an element that (a) has overflow-x auto/scroll AND
    // (b) actually has content wider than itself, allow the scroll there.
    let el = e.target
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el)
      const ox = style.overflowX
      if (
        (ox === 'auto' || ox === 'scroll') &&
        el.scrollWidth > el.clientWidth + 1   // +1 avoids rounding issues
      ) {
        return // intentional horizontal scroll container — let it through
      }
      el = el.parentElement
    }

    // No legitimate horizontal scroll ancestor found — block the swipe.
    e.preventDefault()
  }, { passive: false })
}())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
