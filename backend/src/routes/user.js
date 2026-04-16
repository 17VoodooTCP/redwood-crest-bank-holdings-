const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, email: true, firstName: true, lastName: true, 
        phoneNumber: true, address: true, city: true, state: true, zipCode: true, ssnLast4: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  const { phoneNumber, address, city, state, zipCode, ssnLast4 } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { phoneNumber, address, city, state, zipCode, ssnLast4 },
      select: { 
        id: true, email: true, firstName: true, lastName: true, 
        phoneNumber: true, address: true, city: true, state: true, zipCode: true, ssnLast4: true
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
