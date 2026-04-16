const prisma = require('../utils/prisma');
const { findUserAccount, enforceHold } = require('./accountService');

/**
 * Execute a credit card payment.
 * @param {string} userId
 * @param {import('../types').PaymentRequest} params
 * @returns {Promise<import('../types').PaymentResponse>}
 */
async function executePayment(userId, { amount, creditAccount, fromAccount }) {
  const source = await findUserAccount(userId, fromAccount, { label: 'Source account' });

  if (source.type === 'CREDIT') {
    const err = new Error('Cannot pay a credit card using another credit card.');
    err.status = 400;
    throw err;
  }

  enforceHold(source, 'Your account');

  const dest = await findUserAccount(userId, creditAccount, {
    type: 'CREDIT',
    label: 'Credit account',
  });

  enforceHold(dest, 'Your credit account');

  // Determine payment amount
  let paymentAmount = 0;
  let paymentType = 'FIXED';

  if (typeof amount === 'string') {
    const type = amount.toUpperCase();
    if (type === 'MINIMUM') {
      paymentAmount = dest.minimumPayment || 0;
      paymentType = 'MINIMUM';
    } else if (type === 'STATEMENT') {
      paymentAmount = dest.statementBalance || 0;
      paymentType = 'STATEMENT';
    } else if (type === 'CURRENT') {
      paymentAmount = Math.abs(dest.balance);
      paymentType = 'CURRENT';
    } else {
      paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        const err = new Error('Invalid payment amount string.');
        err.status = 400;
        throw err;
      }
    }
  } else if (typeof amount === 'number') {
    paymentAmount = amount;
  }

  if (paymentAmount <= 0) {
    const err = new Error('Payment amount must be greater than zero.');
    err.status = 400;
    throw err;
  }

  if (source.availableBalance < paymentAmount) {
    const err = new Error('Insufficient funds.');
    err.status = 400;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: source.id },
      data: {
        balance: { decrement: paymentAmount },
        availableBalance: { decrement: paymentAmount },
      },
    });

    await tx.account.update({
      where: { id: dest.id },
      data: {
        balance: { increment: paymentAmount },
        availableBalance: { increment: paymentAmount },
      },
    });

    await tx.transaction.create({
      data: {
        accountId: source.id,
        amount: -paymentAmount,
        description: `PAYMENT TO ${dest.name} (...${dest.accountNumber})`,
        category: 'Payment',
      },
    });

    await tx.transaction.create({
      data: {
        accountId: dest.id,
        amount: paymentAmount,
        description: 'PAYMENT THANK YOU - WEB',
        category: 'Payment',
      },
    });

    return tx.payment.create({
      data: {
        fromAccountId: source.id,
        creditAccountId: dest.id,
        amount: paymentAmount,
        paymentType,
        status: 'COMPLETED',
      },
    });
  });

  return {
    message: `Payment of $${paymentAmount.toFixed(2)} submitted.`,
    payment: result,
  };
}

module.exports = { executePayment };
