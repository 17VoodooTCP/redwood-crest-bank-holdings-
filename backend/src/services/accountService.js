const prisma = require('../utils/prisma');

/**
 * Find a single account matching a search term for a given user.
 * Throws if zero or multiple matches found.
 */
async function findUserAccount(userId, searchTerm, { type, label = 'Account' } = {}) {
  const where = {
    userId,
    isActive: true,
    OR: [
      { name: { contains: searchTerm } },
      { accountNumber: { contains: searchTerm } },
    ],
  };
  if (type) where.type = type;

  const accounts = await prisma.account.findMany({ where });

  if (accounts.length === 0) {
    const err = new Error(`${label} matching "${searchTerm}" not found.`);
    err.status = 404;
    throw err;
  }
  if (accounts.length > 1) {
    const err = new Error(`Multiple ${label.toLowerCase()}s match "${searchTerm}". Please be more specific.`);
    err.status = 400;
    throw err;
  }
  return accounts[0];
}

/**
 * Enforce account hold — throws 403 if the account is blocked.
 */
function enforceHold(account, label = 'Your account') {
  if (account.isBlocked) {
    const err = new Error(
      `${label} (...${account.accountNumber}) has been placed on hold: "${account.blockReason || 'Security review'}". Please contact customer service at support@redwoodcresthq.com for assistance.`
    );
    err.status = 403;
    err.code = 'ACCOUNT_HOLD';
    err.blockReason = account.blockReason || 'Security review';
    throw err;
  }
}

/**
 * List all active accounts for a user.
 */
async function listAccounts(userId) {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { type: 'asc' },
  });

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.type === 'CREDIT' ? 0 : acc.balance),
    0
  );

  return { accounts, totalBalance };
}

/**
 * Get detailed account info.
 */
async function getAccountDetails(userId, accountId) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId, isActive: true },
    include: { _count: { select: { transactions: true } } },
  });

  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }
  return account;
}

/**
 * Generate statement data for a given account and period.
 */
async function generateStatement(userId, accountId, { month, year } = {}) {
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    include: { user: true },
  });

  if (!account) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  const periodStart = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0);
  const periodEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const allTransactions = await prisma.transaction.findMany({
    where: { accountId: account.id },
    orderBy: { date: 'asc' },
  });

  const txAfterPeriod = allTransactions.filter((tx) => new Date(tx.date) > periodEnd);
  const sumAfterPeriod = txAfterPeriod.reduce((acc, tx) => acc + tx.amount, 0);
  const endingBalance = account.balance - sumAfterPeriod;

  const txDuringPeriod = allTransactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= periodStart && d <= periodEnd;
  });
  const sumDuringPeriod = txDuringPeriod.reduce((acc, tx) => acc + tx.amount, 0);
  const beginningBalance = endingBalance - sumDuringPeriod;

  const deposits = txDuringPeriod
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);
  const withdrawals = Math.abs(
    txDuringPeriod.filter((tx) => tx.amount < 0).reduce((acc, tx) => acc + tx.amount, 0)
  );

  return {
    period: { month: targetMonth, year: targetYear, start: periodStart, end: periodEnd },
    summary: { beginningBalance, deposits, withdrawals, fees: 0, endingBalance },
    account: {
      name: account.name,
      type: account.type,
      accountNumber: account.accountNumber,
      user: {
        firstName: account.user.firstName,
        lastName: account.user.lastName,
        address: account.user.address,
        city: account.user.city,
        state: account.user.state,
        zipCode: account.user.zipCode,
      },
    },
    transactions: txDuringPeriod.reverse(),
  };
}

module.exports = {
  findUserAccount,
  enforceHold,
  listAccounts,
  getAccountDetails,
  generateStatement,
};
