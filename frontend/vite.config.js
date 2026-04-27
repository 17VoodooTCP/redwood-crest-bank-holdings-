import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Inject a build timestamp into the bundle and emit a sibling /version.json
// (containing the same timestamp) into the build output. The runtime polls
// /version.json with a cache-buster; if its value differs from the bundled
// constant, the client knows it's running stale code and force-reloads.
const BUILD_VERSION = String(Date.now())

function emitVersionJson() {
  return {
    name: 'emit-version-json',
    apply: 'build',
    closeBundle() {
      const out = path.resolve('dist', 'version.json')
      fs.writeFileSync(out, JSON.stringify({ version: BUILD_VERSION }))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), emitVersionJson()],
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
})
