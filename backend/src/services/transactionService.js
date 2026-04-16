const prisma = require('../utils/prisma');

/**
 * Search transactions for a user with optional filters.
 * @param {string} userId
 * @param {import('../types').TransactionSearchParams} filters
 * @returns {Promise<import('../types').TransactionSearchResponse>}
 */
async function searchTransactions(userId, filters = {}) {
  const { from, to, min, max, contains, account, page = 1, limit = 20 } = filters;
  const take = Math.min(parseInt(limit) || 20, 100);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

  // Get user's account IDs (optionally filtered by account search)
  const accountWhere = { userId, isActive: true };
  if (account) {
    accountWhere.OR = [
      { name: { contains: account } },
      { accountNumber: { contains: account } },
    ];
  }
  const userAccounts = await prisma.account.findMany({
    where: accountWhere,
    select: { id: true },
  });
  const accountIds = userAccounts.map((a) => a.id);

  if (accountIds.length === 0) {
    return { transactions: [], count: 0, page: 1, pageCount: 0 };
  }

  // Build transaction query
  const txWhere = { accountId: { in: accountIds } };

  if (from || to) {
    txWhere.date = {};
    if (from) txWhere.date.gte = new Date(from);
    if (to) txWhere.date.lte = new Date(to);
  }

  if (contains) {
    txWhere.description = { contains };
  }

  // Fetch transactions
  let transactions = await prisma.transaction.findMany({
    where: txWhere,
    include: { account: { select: { name: true, accountNumber: true } } },
    orderBy: { date: 'desc' },
  });

  // Amount filtering (absolute value — done in memory for SQLite compat)
  if (min !== undefined) {
    const minVal = parseFloat(min);
    transactions = transactions.filter((tx) => Math.abs(tx.amount) >= minVal);
  }
  if (max !== undefined) {
    const maxVal = parseFloat(max);
    transactions = transactions.filter((tx) => Math.abs(tx.amount) <= maxVal);
  }

  const count = transactions.length;
  const pageCount = Math.ceil(count / take);
  const paged = transactions.slice(skip, skip + take);

  return { transactions: paged, count, page: Math.max(parseInt(page) || 1, 1), pageCount };
}

module.exports = { searchTransactions };
