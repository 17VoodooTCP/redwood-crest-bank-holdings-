const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /system/status
 * Public, unauthenticated endpoint for the Green Light indicator
 */
router.get('/status', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'SYSTEM_STATUS' } });
    res.json({ status: setting?.value || 'ONLINE' });
  } catch {
    res.json({ status: 'ONLINE' }); // fail-safe
  }
});

/**
 * POST /system/status
 * Admin-only: update the global bank system status
 */
router.post('/status', authenticate, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { status } = req.body;
  const validStatuses = ['ONLINE', 'BUSY', 'MAINTENANCE'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Valid status required: ONLINE, BUSY, MAINTENANCE' });
  }

  try {
    const updated = await prisma.systemSetting.upsert({
      where: { key: 'SYSTEM_STATUS' },
      update: { value: status },
      create: { key: 'SYSTEM_STATUS', value: status }
    });
    res.json({ message: 'System status updated', setting: updated });
  } catch (error) {
    console.error('[SYSTEM STATUS UPDATE ERROR]', error);
    res.status(500).json({ error: 'Failed to update system status' });
  }
});

module.exports = router;
