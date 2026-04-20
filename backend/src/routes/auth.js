const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const prisma = require('../utils/prisma');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { setCsrfCookie } = require('../middleware/csrf');

const router = express.Router();

/**
 * Record a login attempt with IP geolocation (fire-and-forget).
 */
async function recordLoginAttempt(req, userId, success) {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1')
      .replace('::ffff:', '').replace('::1', '127.0.0.1');

    let geo = {};
    // Skip geo lookup for local IPs
    if (ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      const http = require('http');
      geo = await new Promise((resolve, reject) => {
        const r = http.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp`, (res) => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => {
            try {
              const j = JSON.parse(data);
              resolve(j.status === 'success' ? j : {});
            } catch { resolve({}); }
          });
        });
        r.on('error', () => resolve({}));
        r.setTimeout(3000, () => { r.destroy(); resolve({}); });
      });
    } else {
      geo = { city: 'Local', regionName: 'Development', country: 'Localhost', countryCode: 'LC' };
    }

    const locationStr = [geo.city, geo.regionName, geo.countryCode].filter(Boolean).join(', ');

    // Simple suspicious detection: non-US logins flagged
    const suspiciousCountries = ['RU', 'CN', 'KP', 'IR'];
    const isSuspicious = geo.countryCode ? suspiciousCountries.includes(geo.countryCode) : false;

    await prisma.loginAttempt.create({
      data: {
        userId,
        ipAddress: ip,
        location: locationStr || 'Unknown',
        isSuspicious,
      }
    });
  } catch (e) {
    console.error('[LOGIN TRACKING]', e.message);
  }
}

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Helper: set auth cookies (access + refresh + CSRF) on a response.
 * Returns both tokens so they can be included in the JSON response body —
 * the frontend (on a different origin) cannot read the CSRF cookie via
 * document.cookie, so it needs the token handed to it explicitly.
 */
function setAuthCookies(res, userId) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
  const csrfToken = setCsrfCookie(res);

  return { accessToken, csrfToken };
}

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstName').trim().isLength({ min: 1 }),
    body('lastName').trim().isLength({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, firstName, lastName },
      });

      const { accessToken, csrfToken } = setAuthCookies(res, user.id);

      res.status(201).json({
        user: {
          id: user.id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, phoneNumber: user.phoneNumber,
          address: user.address, city: user.city, state: user.state,
          zipCode: user.zipCode, ssnLast4: user.ssnLast4,
        },
        accessToken, // kept for backward compat during migration
        csrfToken,   // frontend must send this back as X-CSRF-Token on state-changing requests
      });
    } catch (err) {
      console.error('[register]', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }

    const { email, password, totpToken } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 2FA check
      if (user.twoFAEnabled) {
        if (!totpToken) {
          return res.status(200).json({ requires2FA: true, message: 'Please provide your 2FA code' });
        }
        const isValidOTP = authenticator.verify({ token: totpToken, secret: user.twoFASecret });
        if (!isValidOTP) {
          return res.status(401).json({ error: 'Invalid 2FA code' });
        }
      }

      const { accessToken, csrfToken } = setAuthCookies(res, user.id);

      // Record login attempt with geolocation (fire-and-forget)
      recordLoginAttempt(req, user.id, true);

      res.json({
        user: {
          id: user.id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, twoFAEnabled: user.twoFAEnabled,
          phoneNumber: user.phoneNumber, address: user.address,
          city: user.city, state: user.state, zipCode: user.zipCode,
          ssnLast4: user.ssnLast4,
        },
        accessToken, // kept for backward compat during migration
        csrfToken,   // frontend must send this back as X-CSRF-Token on state-changing requests
      });
    } catch (err) {
      console.error('[login]', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// ── Refresh token ─────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = generateAccessToken(user.id);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
    const csrfToken = setCsrfCookie(res);

    res.json({ accessToken, csrfToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// ── Logout ─────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  const clearOpts = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'strict',
  };
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
  res.clearCookie('csrf_token', { ...clearOpts, httpOnly: false });
  res.json({ message: 'Logged out successfully' });
});

// ── 2FA Setup ─────────────────────────────────────────────────────────────────
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(req.user.email, 'RedwoodCrestBank', secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFASecret: secret },
    });

    res.json({ secret, qrCode, otpauthUrl });
  } catch (err) {
    console.error('[2fa/setup]', err);
    res.status(500).json({ error: '2FA setup failed' });
  }
});

// ── 2FA Verify + Enable ───────────────────────────────────────────────────────
router.post('/2fa/verify', authenticate, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.twoFASecret) {
      return res.status(400).json({ error: 'Run 2FA setup first' });
    }

    const isValid = authenticator.verify({ token, secret: user.twoFASecret });
    if (!isValid) return res.status(401).json({ error: 'Invalid 2FA code' });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFAEnabled: true },
    });

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    console.error('[2fa/verify]', err);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

// ── Get current user ───────────────────────────────────────────────────────────
// Also issues a fresh CSRF token so the frontend (which cannot read the CSRF
// cookie on a different origin) can rehydrate its in-memory token on page reload.
router.get('/me', authenticate, (req, res) => {
  const csrfToken = setCsrfCookie(res);
  res.json({ user: req.user, csrfToken });
});

module.exports = router;
