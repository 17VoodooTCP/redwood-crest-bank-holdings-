const prisma = require('../utils/prisma');
const { findUserAccount, enforceHold } = require('./accountService');

/**
 * Execute an internal transfer between two of the user's accounts.
 * @param {string} userId
 * @param {import('../types').TransferRequest} params
 * @returns {Promise<import('../types').TransferResponse>}
 */
async function executeTransfer(userId, { amount, fromAccount, toAccount }) {
  const transferAmount = parseFloat(amount);
  if (!transferAmount || transferAmount <= 0) {
    const err = new Error('Transfer amount must be greater than zero.');
    err.status = 400;
    throw err;
  }

  const source = await findUserAccount(userId, fromAccount, { label: 'Source account' });

  if (source.type === 'CREDIT') {
    const err = new Error('Cannot transfer from a credit account using this command.');
    err.status = 400;
    throw err;
  }

  enforceHold(source, 'Your account');

  const dest = await findUserAccount(userId, toAccount, { label: 'Destination account' });

  enforceHold(dest, 'The destination account');

  if (source.id === dest.id) {
    const err = new Error('Source and destination accounts must be different.');
    err.status = 400;
    throw err;
  }

  if (source.availableBalance < transferAmount) {
    const err = new Error('Insufficient funds.');
    err.status = 400;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: source.id },
      data: {
        balance: { decrement: transferAmount },
        availableBalance: { decrement: transferAmount },
      },
    });

    await tx.account.update({
      where: { id: dest.id },
      data: {
        balance: { increment: transferAmount },
        availableBalance: { increment: transferAmount },
      },
    });

    await tx.transaction.create({
      data: {
        accountId: source.id,
        amount: -transferAmount,
        description: `TRANSFER TO ${dest.name} (...${dest.accountNumber})`,
        category: 'Transfer',
      },
    });

    await tx.transaction.create({
      data: {
        accountId: dest.id,
        amount: transferAmount,
        description: `TRANSFER FROM ${source.name} (...${source.accountNumber})`,
        category: 'Transfer',
      },
    });

    return tx.transfer.create({
      data: {
        fromAccountId: source.id,
        toAccountId: dest.id,
        amount: transferAmount,
        status: 'COMPLETED',
      },
    });
  });

  return {
    message: `Transfer of $${transferAmount.toFixed(2)} submitted.`,
    transfer: result,
  };
}

module.exports = { executeTransfer };
