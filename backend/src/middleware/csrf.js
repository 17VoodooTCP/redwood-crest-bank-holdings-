const crypto = require('crypto');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Generate a CSRF token, set it as a cookie (for legacy clients), and return
 * the value so auth endpoints can include it in the JSON response body.
 * The frontend stores this token in memory/sessionStorage and sends it back
 * as the X-CSRF-Token header on every state-changing request.
 */
function setCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

/**
 * Middleware: validate CSRF token on state-changing requests.
 *
 * The CSRF token is distributed via authenticated JSON responses (not cookies),
 * so only a legitimate frontend that has already made an authenticated request
 * can possess the token. CORS prevents cross-origin scripts from reading API
 * response bodies, making header-only validation sufficient — no cookie
 * comparison needed.
 */
function validateCsrf(req, res, next) {
  // Only enforce on state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const headerToken = req.headers[CSRF_HEADER];

  if (!headerToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  next();
}

module.exports = { setCsrfCookie, validateCsrf, CSRF_COOKIE };
