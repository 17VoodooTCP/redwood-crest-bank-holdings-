const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

/**
 * Middleware: verify JWT access token.
 * Checks httpOnly cookie first, then falls back to Authorization header
 * for backward compatibility (e.g. admin panel with separate token).
 */
async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compat
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        twoFAEnabled: true, address: true, city: true, state: true,
        zipCode: true, phoneNumber: true, ssnLast4: true, isAdmin: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
