const prisma = require('../utils/prisma');
const { findUserAccount, enforceHold } = require('./accountService');

const DOMESTIC_FEE = 25.0;
const INTERNATIONAL_FEE = 45.0;

/**
 * Execute a wire transfer (domestic or international).
 * @param {string} userId
 * @param {import('../types').WireRequest} params
 * @returns {Promise<import('../types').WireResponse>}
 */
async function executeWire(userId, params) {
  const {
    type,
    amount,
    fromAccount,
    recipientName,
    memo,
    routingNumber,
    accountNumber,
    bankName,
    swiftCode,
    iban,
    recipientCountry,
    recipientAddress,
    recipientBankAddress,
    currency,
  } = params;

  const wireAmount = parseFloat(amount);
  if (!wireAmount || wireAmount <= 0) {
    const err = new Error('Wire amount must be greater than zero.');
    err.status = 400;
    throw err;
  }

  // Validate type-specific fields
  if (type === 'domestic') {
    if (!routingNumber || routingNumber.length !== 9) {
      const err = new Error('A valid 9-digit routing number is required for domestic wires.');
      err.status = 400;
      throw err;
    }
    if (!accountNumber) {
      const err = new Error('Recipient account number is required.');
      err.status = 400;
      throw err;
    }
  } else if (type === 'international') {
    if (!swiftCode || swiftCode.length < 8) {
      const err = new Error('A valid SWIFT/BIC code (8-11 characters) is required for international wires.');
      err.status = 400;
      throw err;
    }
    if (!iban) {
      const err = new Error('IBAN is required for international wires.');
      err.status = 400;
      throw err;
    }
    if (!recipientCountry) {
      const err = new Error('Recipient country is required for international wires.');
      err.status = 400;
      throw err;
    }
  } else {
    const err = new Error('Wire type must be "domestic" or "international".');
    err.status = 400;
    throw err;
  }

  const fee = type === 'domestic' ? DOMESTIC_FEE : INTERNATIONAL_FEE;
  const totalDebit = wireAmount + fee;

  const source = await findUserAccount(userId, fromAccount, { label: 'Source account' });

  if (source.type === 'CREDIT') {
    const err = new Error('Cannot send a wire transfer from a credit account.');
    err.status = 400;
    throw err;
  }

  enforceHold(source, 'Your account');

  if (source.availableBalance < totalDebit) {
    const err = new Error(
      `Insufficient funds. Need $${totalDebit.toFixed(2)} (including $${fee.toFixed(2)} fee), but only $${source.availableBalance.toFixed(2)} available.`
    );
    err.status = 400;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: source.id },
      data: {
        balance: { decrement: totalDebit },
        availableBalance: { decrement: totalDebit },
      },
    });

    await tx.transaction.create({
      data: {
        accountId: source.id,
        amount: -wireAmount,
        description: `${type === 'domestic' ? 'DOMESTIC' : 'INTL'} WIRE TO ${recipientName.toUpperCase()}`,
        category: 'Wire Transfer',
        pending: type === 'international',
      },
    });

    await tx.transaction.create({
      data: {
        accountId: source.id,
        amount: -fee,
        description: `WIRE TRANSFER FEE - ${type.toUpperCase()}`,
        category: 'Fee',
      },
    });

    return tx.wireTransfer.create({
      data: {
        fromAccountId: source.id,
        type,
        amount: wireAmount,
        fee,
        recipientName: recipientName.trim(),
        routingNumber: routingNumber || null,
        accountNumber: accountNumber || null,
        bankName: bankName || null,
        swiftCode: swiftCode || null,
        iban: iban || null,
        recipientCountry: recipientCountry || null,
        recipientAddress: recipientAddress || null,
        recipientBankAddress: recipientBankAddress || null,
        currency: currency || 'USD',
        memo: memo || null,
        status: type === 'domestic' ? 'PROCESSING' : 'PENDING',
      },
    });
  });

  const statusMsg =
    type === 'domestic'
      ? `Domestic wire of $${wireAmount.toFixed(2)} to ${recipientName} submitted. A $${fee.toFixed(2)} fee has been applied. Wire should complete within the same business day.`
      : `International wire of $${wireAmount.toFixed(2)} to ${recipientName} (${recipientCountry}) submitted. A $${fee.toFixed(2)} fee has been applied. Allow 1-5 business days for delivery.`;

  return { message: statusMsg, wireTransfer: result };
}

module.exports = { executeWire, DOMESTIC_FEE, INTERNATIONAL_FEE };
