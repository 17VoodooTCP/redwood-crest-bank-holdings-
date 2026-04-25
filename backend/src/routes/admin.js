const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const { parseCommand } = require('../utils/nlp-parser');

const router = express.Router();

/**
 * Superuser Authorization Middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }
  next();
}

// ─── Admin Console Credentials ───
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@redwoodcresthq.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kenrioty1700#';

/**
 * POST /admin/login
 * Standalone admin console authentication — separate from customer login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { adminConsole: true, email: ADMIN_EMAIL },
      process.env.JWT_SECRET || 'admin-fallback-secret',
      { expiresIn: '24h' }
    );
    return res.json({ 
      message: 'Admin authenticated successfully.',
      token,
      admin: { email: ADMIN_EMAIL, name: 'System Administrator' }
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials.' });
});

/**
 * GET /admin/verify
 * Verify an existing admin session token
 */
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No admin token provided.' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-fallback-secret');
    if (decoded.adminConsole) {
      return res.json({ valid: true, admin: { email: decoded.email, name: 'System Administrator' } });
    }
    return res.status(401).json({ error: 'Invalid admin token.' });
  } catch {
    return res.status(401).json({ error: 'Admin session expired.' });
  }
});


/**
 * AI-Driven NLP Admin Command Parser
 * POST /admin/command
 */
router.post('/command', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const parsed = parseCommand(command);

  switch (parsed.intent) {
    case 'admin_create_account': {
      const { type, email } = parsed.params;
      if (!email) return res.json({ intent: 'admin_error', stringOut: '[ADMIN ERROR] User email not specified. Use "for <email>".' });
      
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] User "${email}" not found.` });

        const accNum = Math.floor(1000 + Math.random() * 9000).toString();
        const account = await prisma.account.create({
          data: {
            userId: user.id,
            type: type || 'CHECKING',
            name: `NEW ${type}`,
            accountNumber: accNum,
            balance: 0,
            availableBalance: 0
          }
        });
        return res.json({
          intent: 'admin_create_account',
          stringOut: `[ADMIN SUCCESS] Provisioned ${type} account #...${accNum} for ${user.firstName} ${user.lastName}.`
        });
      } catch (err) {
        return res.status(500).json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] System failure during provisioning: ${err.message}` });
      }
    }
    
    case 'admin_block_account': {
      const { accountNumber, reason } = parsed.params;
      if (!accountNumber) return res.json({ intent: 'admin_error', stringOut: '[ADMIN ERROR] No account number specified. Use "block <last4>".' });

      try {
        const account = await prisma.account.findFirst({ where: { accountNumber } });
        if (!account) return res.json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] Account (...${accountNumber}) not found.` });

        await prisma.account.update({
          where: { id: account.id },
          data: { isBlocked: true, blockReason: reason }
        });

        return res.json({
          intent: 'admin_block_account',
          stringOut: `[ADMIN SUCCESS] Account #...${accountNumber} is now LOCKED. Reason: ${reason}`
        });
      } catch (err) {
        return res.status(500).json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] Block failed: ${err.message}` });
      }
    }

    case 'admin_inject_transaction': {
      const { amount, merchant, accountNumber } = parsed.params;
      if (!accountNumber) return res.json({ intent: 'admin_error', stringOut: '[ADMIN ERROR] Target account required. Use "for <last4>".' });

      try {
        const account = await prisma.account.findFirst({ where: { accountNumber } });
        if (!account) return res.json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] Account (...${accountNumber}) not found.` });

        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              accountId: account.id,
              amount: amount,
              description: merchant.toUpperCase(),
              merchant: merchant,
              category: 'Transfer',
              date: new Date()
            }
          }),
          prisma.account.update({
            where: { id: account.id },
            data: { 
              balance: { increment: amount },
              availableBalance: { increment: amount }
            }
          })
        ]);

        return res.json({
          intent: 'admin_inject_transaction',
          stringOut: `[ADMIN SUCCESS] Injected ${amount > 0 ? '+' : ''}${amount.toFixed(2)} [${merchant}] into account ...${accountNumber}. Balance adjusted.`
        });
      } catch (err) {
        return res.status(500).json({ intent: 'admin_error', stringOut: `[ADMIN ERROR] Injection failed: ${err.message}` });
      }
    }

    case 'admin_unknown':
    default:
      return res.json({
        intent: 'unknown',
        stringOut: `[ADMIN] Unrecognized command format: "${command}"\nSupported admin commands: \n- admin create account <type> for <user>\n- admin block <account> reason <text>\n- admin inject transaction <amount> merchant <name>`
      });
  }
});

/**
 * POST /admin/accounts/create
 * Automatically generate a new account for a given user email and type
 */
router.post('/accounts/create', async (req, res) => {
  const { email, type, cardBrand, cardNetwork, creditLimit, initialBalance, depositDate, expiryDate } = req.body; // type: CHECKING, SAVINGS, CREDIT, BUSINESS

  if (!email || !type) {
    return res.status(400).json({ error: 'Email and account type are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: `User ${email} not found` });

    // Use admin supplied number or generate random 4 digit
    const accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const finalBalance = parseFloat(initialBalance) || 0;

    const cardNameMap = {
      PLATINUM_ELITE: 'Redwood Platinum Elite',
      BLACK_CARD: 'Redwood Onyx Reserve',
      REDWOOD_PREFERRED: 'Redwood Preferred',
      AMEX_PLATINUM: 'American Express Platinum'
    };

    const upType = type.toUpperCase();
    const isCredit = upType === 'CREDIT' || upType === 'HELOC';

    // Admin-supplied credit limit (optional). Falls back to defaults if blank.
    const parsedLimit = (creditLimit !== undefined && creditLimit !== '' && creditLimit !== null)
      ? parseFloat(creditLimit)
      : null;

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: upType,
        name: upType === 'CREDIT' && cardBrand && cardNameMap[cardBrand]
          ? cardNameMap[cardBrand]
          : `NEW ${upType}`,
        accountNumber,
        balance: finalBalance,
        availableBalance: finalBalance,
        expiryDate: isCredit ? (expiryDate || '04/31') : null,
        ...(isCredit && cardBrand ? { cardBrand } : {}),
        ...(isCredit && cardNetwork ? { cardNetwork } : {}),
        ...(upType === 'CREDIT' ? {
          creditLimit: parsedLimit !== null && !Number.isNaN(parsedLimit) ? parsedLimit : 10000,
          minimumPayment: 25,
          statementBalance: 0,
          nextPaymentDue: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        } : {}),
        ...(upType === 'HELOC' ? {
          creditLimit: parsedLimit !== null && !Number.isNaN(parsedLimit) ? parsedLimit : 50000,
        } : {})
      }
    });

    // Create opening deposit transaction if balance > 0
    if (finalBalance !== 0) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          amount: finalBalance,
          description: 'Initial Deposit',
          category: 'Transfer',
          date: depositDate ? new Date(depositDate) : new Date(),
          merchant: 'Redwood Crest Bank'
        }
      });
    }

    res.json({ message: 'Account provisioned successfully', account });
  } catch (error) {
    console.error('[ADMIN CREATE ACCOUNT ERROR]', error);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

/**
 * POST /admin/customers/provision
 * Full customer onboarding — creates a new User + first Account in one operation
 */
router.post('/customers/provision', async (req, res) => {
  const {
    firstName, lastName, email, password,
    phoneNumber, address, city, state, zipCode, ssnLast4,
    accountType, initialBalance, accountNumber: suppliedAccNumber,
    cardBrand, cardNetwork, creditLimit
  } = req.body;

  if (!firstName || !lastName || !email || !password || !accountType) {
    return res.status(400).json({ error: 'First name, last name, email, password, and account type are required.' });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    // Check for duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: `A user with email "${email}" already exists.` });

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use admin-supplied number or generate a fresh 10-digit one
    const accountNumber = suppliedAccNumber
      ? suppliedAccNumber.replace(/-/g, '').slice(-10) // strip dashes, take last 10 digits
      : Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const startBalance = parseFloat(initialBalance) || 0;
    const { depositDate, expiryDate } = req.body;

    const type = accountType.toUpperCase();

    // Generate name label from type
    const accountNameMap = {
      CHECKING: 'Total Checking',
      SAVINGS: 'Redwood Crest Savings',
      BUSINESS: 'Business Checking',
      CREDIT: 'Redwood Preferred Card', // default fallback
      HELOC: 'Home Equity Line of Credit'
    };

    const cardNameMap = {
      PLATINUM_ELITE: 'Redwood Platinum Elite',
      BLACK_CARD: 'Redwood Onyx Reserve',
      REDWOOD_PREFERRED: 'Redwood Preferred',
      AMEX_PLATINUM: 'American Express Platinum'
    };

    const finalAccountName = (type === 'CREDIT' && cardBrand && cardNameMap[cardBrand])
      ? cardNameMap[cardBrand]
      : (accountNameMap[type] || type);

    const isCredit = type === 'CREDIT' || type === 'HELOC';
    const parsedLimit = (creditLimit !== undefined && creditLimit !== '' && creditLimit !== null)
      ? parseFloat(creditLimit)
      : null;

    // Create user + account in a single atomic transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          ssnLast4: ssnLast4 || null,
        }
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type,
          name: finalAccountName,
          accountNumber: accountNumber.slice(-4), // store last 4
          balance: startBalance,
          availableBalance: startBalance,
          expiryDate: (type === 'CREDIT' || type === 'HELOC') ? (expiryDate || '04/31') : null,
          ...(isCredit && cardBrand ? { cardBrand } : {}),
          ...(isCredit && cardNetwork ? { cardNetwork } : {}),
          ...(type === 'CREDIT' ? {
            creditLimit: parsedLimit !== null && !Number.isNaN(parsedLimit) ? parsedLimit : 10000,
            minimumPayment: 25,
            statementBalance: 0,
            nextPaymentDue: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          } : {}),
          ...(type === 'HELOC' ? {
            creditLimit: parsedLimit !== null && !Number.isNaN(parsedLimit) ? parsedLimit : 50000,
          } : {})
        }
      });

      // Create opening deposit transaction if balance > 0
      if (startBalance !== 0) {
        await tx.transaction.create({
          data: {
            accountId: (await tx.account.findFirst({ where: { userId: user.id, accountNumber: accountNumber.slice(-4) }, orderBy: { createdAt: 'desc' } })).id,
            amount: startBalance,
            description: 'Initial Deposit',
            category: 'Transfer',
            date: depositDate ? new Date(depositDate) : new Date(),
            merchant: 'Redwood Crest Bank'
          }
        });
      }

      return user;
    });

    console.log(`\n[ADMIN PROVISION] New customer "${firstName} ${lastName}" (${email}) provisioned with a ${type} account (#${accountNumber}).`);

    res.status(201).json({
      message: `Customer ${firstName} ${lastName} successfully onboarded with a ${type} account.`,
      userId: newUser.id,
      accountNumber: `...${accountNumber.slice(-4)}`
    });
  } catch (error) {
    console.error('[ADMIN PROVISION ERROR]', error);
    res.status(500).json({ error: 'Failed to provision customer.' });
  }
});

/**
 * POST /admin/accounts/block
 * Toggles the block status and logs a mock email/SMTP action
 */
router.post('/accounts/block', async (req, res) => {
  const { accountId, reason, action } = req.body; // action: 'block' or 'unblock'

  if (!accountId || !action) {
    return res.status(400).json({ error: 'Account ID and action are required' });
  }

  try {
    const isBlocked = action === 'block';

    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        isBlocked,
        blockReason: isBlocked ? reason : null
      },
      include: { user: true }
    });

    // Console-log our "Mock Email Simulation" 
    console.log('\n--- 📧 EMAIL SYSTEM: OUTGOING MESSAGE ---');
    console.log(`To: ${account.user.email}`);
    console.log(`Subject: Important: Your ${account.name} (*${account.accountNumber}) Status Update`);
    console.log('Body:');
    if (isBlocked) {
      console.log(`We have placed a temporary hold on your account due to the following reason:`);
      console.log(`"${reason || 'Security review'}"`);
      console.log(`Please contact support to resolve this issue.`);
    } else {
      console.log(`The hold on your account has been lifted. You may now resume normal activity.`);
    }
    console.log('-----------------------------------------\n');

    res.json({ message: `Account ${action}ed successfully`, account });
  } catch (error) {
    console.error('[ADMIN BLOCK ACCOUNT ERROR]', error);
    res.status(500).json({ error: 'Failed to modify account hold status.' });
  }
});

/**
 * POST /admin/transactions/modify
 * Inject a forged transaction into an account
 */
router.post('/transactions/modify', async (req, res) => {
  const { accountId, amount, merchant, date, category, description } = req.body;

  if (!accountId || amount === undefined || !description) {
    return res.status(400).json({ error: 'Account ID, amount, and description are required' });
  }

  try {
    const val = parseFloat(amount);
    
    // Perform balancing in a transaction - injection SHOULD adjust balance per user request
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId,
          amount: val,
          description,
          merchant: merchant || null,
          category: category || 'Transfer',
          date: date ? new Date(date) : new Date()
        }
      });

      // 2. Adjust the account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: val },
          availableBalance: { increment: val }
        }
      });

      return transaction;
    });

    res.json({ message: 'Transaction injected and balance adjusted successfully', transaction: result });
  } catch (error) {
    console.error('[ADMIN INJECT TX ERROR]', error);
    res.status(500).json({ error: 'Failed to inject transaction and update balance.' });
  }
});


/**
 * GET /admin/security/logins
 * Retrieves geographical login data (System-wide logins)
 */
router.get('/security/logins', async (req, res) => {
  try {
    const logins = await prisma.loginAttempt.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ logins });
  } catch (error) {
    console.error('[ADMIN SECURITY LOGINS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch security logs.' });
  }
});

/**
 * GET /admin/users
 * Helper to fetch all users for the dashboard
 */
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true, isAdmin: true,
        accounts: {
          select: { id: true, type: true, name: true, accountNumber: true, isBlocked: true, balance: true }
        }
      }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * DELETE /admin/accounts/:id
 * Permanently decommissioning an account and wiping all associated history
 */
router.delete('/accounts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all transactions
      await tx.transaction.deleteMany({ where: { accountId: id } });

      // 2. Delete all transfers (both incoming and outgoing)
      await tx.transfer.deleteMany({ 
        where: { 
          OR: [{ fromAccountId: id }, { toAccountId: id }] 
        } 
      });

      // 3. Delete all payments (both from and to credit)
      await tx.payment.deleteMany({
        where: {
          OR: [{ fromAccountId: id }, { creditAccountId: id }]
        }
      });

      // 4. Delete all wire transfers
      await tx.wireTransfer.deleteMany({ where: { fromAccountId: id } });

      // 5. Finally, delete the account itself
      await tx.account.delete({ where: { id } });
    });

    res.json({ message: 'Account and all associated records permanently decommissioned.' });
  } catch (error) {
    console.error('[ADMIN DELETE ACCOUNT ERROR]', error);
    res.status(500).json({ error: 'Failed to decommission account. Relational constraints may still exist.' });
  }
});

/**
 * GET /admin/accounts/:accountId/transactions
 * Fetch full history for auditor review
 */
router.get('/accounts/:accountId/transactions', async (req, res) => {
  const { accountId } = req.params;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      orderBy: { date: 'desc' }
    });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account history' });
  }
});

/**
 * PATCH /admin/transactions/:id
 * Modify existing transaction metadata (e.g. date)
 */
router.patch('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  if (!date) return res.status(400).json({ error: 'New date is required' });

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data: { date: new Date(date) }
    });
    res.json({ message: 'Transaction record updated successfully', transaction: updated });
  } catch (error) {
    console.error('[ADMIN MODIFY TX ERROR]', error);
    res.status(500).json({ error: 'Failed to update transaction record.' });
  }
});

module.exports = router;
