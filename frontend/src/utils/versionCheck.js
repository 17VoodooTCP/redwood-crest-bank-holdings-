/**
 * Runtime stale-bundle guard.
 *
 * iOS Safari (and other browsers behind aggressive proxies) sometimes hold a
 * stale `index.html` for hours, which references a stale bundle hash that
 * Vercel still serves out of CDN cache. A normal pull-to-refresh doesn't fix
 * this because Safari may not even hit the network for the HTML.
 *
 * This module compares the version baked into the running bundle
 * (`__BUILD_VERSION__`, injected by vite.config.js) against the freshly
 * fetched `/version.json` (with a unique cache-buster). On mismatch we
 * unregister any service workers, blow away the Cache Storage API, and
 * hard-reload the page. The reload uses `location.replace` with a fresh
 * cache-bust query so the next request goes to the network.
 *
 * Runs at most every 60s; first check fires immediately on app boot and
 * again whenever the tab regains focus.
 */

/* eslint-disable no-undef */
const BUILT_VERSION =
  typeof __BUILD_VERSION__ !== 'undefined' ? String(__BUILD_VERSION__) : 'dev'

let lastCheckAt = 0
let reloading = false

async function clearAllCaches() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* ignore */
  }
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    /* ignore */
  }
}

async function checkOnce() {
  if (reloading) return
  const now = Date.now()
  if (now - lastCheckAt < 60_000) return
  lastCheckAt = now

  try {
    const res = await fetch(`/version.json?cb=${now}`, {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!res.ok) return
    const data = await res.json()
    if (!data || !data.version) return

    if (String(data.version) !== BUILT_VERSION) {
      reloading = true
      // eslint-disable-next-line no-console
      console.warn(
        `[versionCheck] stale bundle detected (built=${BUILT_VERSION}, latest=${data.version}). Reloading…`
      )
      await clearAllCaches()
      const url = new URL(window.location.href)
      url.searchParams.set('_v', String(data.version))
      window.location.replace(url.toString())
    }
  } catch {
    /* offline / network blip — try again next tick */
  }
}

export function startVersionCheck() {
  // Initial check shortly after mount so it doesn't block first paint.
  setTimeout(checkOnce, 1500)

  // Re-check when the tab regains focus.
  window.addEventListener('focus', checkOnce)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkOnce()
  })

  // Belt-and-suspenders periodic check.
  setInterval(checkOnce, 5 * 60_000)
}

export const BUILT_VERSION_FOR_DEBUG = BUILT_VERSION
