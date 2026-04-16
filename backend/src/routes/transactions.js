const express = require('express');
const { authenticate } = require('../middleware/auth');
const { searchTransactions } = require('../services/transactionService');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await searchTransactions(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    console.error('[transactions]', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
