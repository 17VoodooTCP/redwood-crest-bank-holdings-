const { executeTransfer } = require('../transferService');
const prisma = require('../../utils/prisma');

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe('executeTransfer', () => {
  let userId;
  let checkingId;
  let savingsId;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-transfer-${Date.now()}@test.com`,
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    userId = user.id;

    // Create two accounts
    const checking = await prisma.account.create({
      data: {
        userId,
        type: 'CHECKING',
        name: 'Test Checking',
        accountNumber: '1111',
        balance: 1000,
        availableBalance: 1000,
      },
    });
    checkingId = checking.id;

    const savings = await prisma.account.create({
      data: {
        userId,
        type: 'SAVINGS',
        name: 'Test Savings',
        accountNumber: '2222',
        balance: 500,
        availableBalance: 500,
      },
    });
    savingsId = savings.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany({ where: { accountId: { in: [checkingId, savingsId] } } });
    await prisma.transfer.deleteMany({ where: { fromAccountId: checkingId } });
    await prisma.account.deleteMany({ where: { id: { in: [checkingId, savingsId] } } });
    await prisma.user.delete({ where: { id: userId } });
  });

  test('transfers funds between accounts successfully', async () => {
    const result = await executeTransfer(userId, {
      amount: 200,
      fromAccount: 'Checking',
      toAccount: 'Savings',
    });

    expect(result.message).toBe('Transfer of $200.00 submitted.');
    expect(result.transfer.amount).toBe(200);
    expect(result.transfer.status).toBe('COMPLETED');

    // Verify balances
    const checking = await prisma.account.findUnique({ where: { id: checkingId } });
    const savings = await prisma.account.findUnique({ where: { id: savingsId } });
    expect(checking.balance).toBe(800);
    expect(savings.balance).toBe(700);
  });

  test('rejects transfer with insufficient funds', async () => {
    await expect(
      executeTransfer(userId, {
        amount: 99999,
        fromAccount: 'Checking',
        toAccount: 'Savings',
      })
    ).rejects.toThrow('Insufficient funds.');
  });

  test('rejects transfer to same account', async () => {
    await expect(
      executeTransfer(userId, {
        amount: 50,
        fromAccount: 'Checking',
        toAccount: 'Checking',
      })
    ).rejects.toThrow('Source and destination accounts must be different.');
  });

  test('rejects transfer with zero amount', async () => {
    await expect(
      executeTransfer(userId, {
        amount: 0,
        fromAccount: 'Checking',
        toAccount: 'Savings',
      })
    ).rejects.toThrow('Transfer amount must be greater than zero.');
  });

  test('rejects transfer from non-existent account', async () => {
    await expect(
      executeTransfer(userId, {
        amount: 50,
        fromAccount: 'NonExistent',
        toAccount: 'Savings',
      })
    ).rejects.toThrow('not found');
  });
});
