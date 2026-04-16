const express = require('express');
const { authenticate } = require('../middleware/auth');
const { listAccounts, getAccountDetails, generateStatement } = require('../services/accountService');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await listAccounts(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('[accounts/list]', err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const account = await getAccountDetails(req.user.id, req.params.id);
    res.json({ account });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('[accounts/detail]', err);
    res.status(500).json({ error: 'Failed to fetch account details' });
  }
});

router.get('/:id/statement', authenticate, async (req, res) => {
  try {
    const result = await generateStatement(req.user.id, req.params.id, req.query);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('[statements/calculate]', err);
    res.status(500).json({ error: 'Failed to generate statement data.' });
  }
});

module.exports = router;
