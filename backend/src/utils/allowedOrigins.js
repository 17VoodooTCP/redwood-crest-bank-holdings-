// Centralized CORS allow-list. Shared by the Express app and the Socket.io
// server so both accept the same set of front-end origins.
//
// FRONTEND_URL may be a single URL or a comma-separated list (e.g. the Vercel
// alias). The production custom domain + localhost dev are always included.

const normalize = (u) => u.trim().replace(/\/+$/, '');

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(normalize)
  .filter(Boolean);

const staticOrigins = [
  'http://localhost:5173',
  'https://redwoodcrestinc.com',
  'https://www.redwoodcrestinc.com',
];

const allowedOrigins = [...new Set([...envOrigins, ...staticOrigins])];

// Any of this project's Vercel deployment URLs (bare alias, git-branch alias,
// and per-deploy hash aliases all share this prefix).
const vercelAlias = /^https:\/\/redwood-crest-bank-holdings[a-z0-9.-]*\.vercel\.app$/i;

// cors-package origin function. Allows requests with no Origin header
// (server-to-server, curl, health checks) and any allow-listed browser origin.
function corsOrigin(origin, callback) {
  const o = origin && normalize(origin);
  if (!origin || allowedOrigins.includes(o) || vercelAlias.test(o)) {
    return callback(null, true);
  }
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
}

module.exports = { allowedOrigins, corsOrigin };
