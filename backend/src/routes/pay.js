const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { executePayment } = require('../services/paymentService');

const router = express.Router();

router.post('/', authenticate,
  [
    body('amount').notEmpty(),
    body('creditAccount').trim().notEmpty(),
    body('fromAccount').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    try {
      const result = await executePayment(req.user.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({
          error: err.code === 'ACCOUNT_HOLD' ? 'ACCOUNT HOLD' : err.message,
          blockReason: err.blockReason,
          message: err.message,
        });
      }
      console.error('[pay]', err);
      res.status(500).json({ error: 'Payment failed due to a server error.' });
    }
  }
);

module.exports = router;
