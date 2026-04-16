const { executePayment } = require('../paymentService');
const prisma = require('../../utils/prisma');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('executePayment', () => {
  let userId;
  let checkingId;
  let creditId;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `test-payment-${Date.now()}@test.com`,
        password: 'hashedpassword',
        firstName: 'Pay',
        lastName: 'Tester',
      },
    });
    userId = user.id;

    const checking = await prisma.account.create({
      data: {
        userId,
        type: 'CHECKING',
        name: 'Pay Checking',
        accountNumber: '3333',
        balance: 5000,
        availableBalance: 5000,
      },
    });
    checkingId = checking.id;

    const credit = await prisma.account.create({
      data: {
        userId,
        type: 'CREDIT',
        name: 'Pay Credit Card',
        accountNumber: '4444',
        balance: -1500,
        availableBalance: 8500,
        creditLimit: 10000,
        minimumPayment: 35,
        statementBalance: 1200,
      },
    });
    creditId = credit.id;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { accountId: { in: [checkingId, creditId] } } });
    await prisma.payment.deleteMany({ where: { fromAccountId: checkingId } });
    await prisma.account.deleteMany({ where: { id: { in: [checkingId, creditId] } } });
    await prisma.user.delete({ where: { id: userId } });
  });

  test('pays a fixed amount on credit card', async () => {
    const result = await executePayment(userId, {
      amount: 100,
      creditAccount: 'Credit',
      fromAccount: 'Checking',
    });

    expect(result.message).toBe('Payment of $100.00 submitted.');
    expect(result.payment.amount).toBe(100);
    expect(result.payment.paymentType).toBe('FIXED');

    const checking = await prisma.account.findUnique({ where: { id: checkingId } });
    const credit = await prisma.account.findUnique({ where: { id: creditId } });
    expect(checking.balance).toBe(4900);
    expect(credit.balance).toBe(-1400);
  });

  test('pays minimum amount when "MINIMUM" is specified', async () => {
    const result = await executePayment(userId, {
      amount: 'MINIMUM',
      creditAccount: 'Credit',
      fromAccount: 'Checking',
    });

    expect(result.message).toBe('Payment of $35.00 submitted.');
    expect(result.payment.paymentType).toBe('MINIMUM');
  });

  test('rejects payment from credit card to credit card', async () => {
    await expect(
      executePayment(userId, {
        amount: 50,
        creditAccount: 'Credit',
        fromAccount: 'Credit',
      })
    ).rejects.toThrow('Cannot pay a credit card using another credit card.');
  });

  test('rejects payment with insufficient funds', async () => {
    await expect(
      executePayment(userId, {
        amount: 999999,
        creditAccount: 'Credit',
        fromAccount: 'Checking',
      })
    ).rejects.toThrow('Insufficient funds.');
  });
});
