const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { executeWire } = require('../services/wireService');

const router = express.Router();

router.post('/', authenticate,
  [
    body('type').isIn(['domestic', 'international']),
    body('amount').isFloat({ gt: 0 }),
    body('fromAccount').trim().notEmpty(),
    body('recipientName').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    try {
      const result = await executeWire(req.user.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({
          error: err.code === 'ACCOUNT_HOLD' ? 'ACCOUNT HOLD' : err.message,
          blockReason: err.blockReason,
          message: err.message,
        });
      }
      console.error('[wire]', err);
      res.status(500).json({ error: 'Wire transfer failed due to a server error.' });
    }
  }
);

module.exports = router;
