const { findUserAccount, enforceHold, listAccounts, getAccountDetails } = require('../accountService');
const prisma = require('../../utils/prisma');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('accountService', () => {
  let userId;
  let accountId;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `test-account-${Date.now()}@test.com`,
        password: 'hashedpassword',
        firstName: 'Acct',
        lastName: 'Tester',
      },
    });
    userId = user.id;

    const account = await prisma.account.create({
      data: {
        userId,
        type: 'CHECKING',
        name: 'Main Checking',
        accountNumber: '5555',
        balance: 2500,
        availableBalance: 2500,
      },
    });
    accountId = account.id;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { accountId } });
    await prisma.account.deleteMany({ where: { id: accountId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  describe('findUserAccount', () => {
    test('finds account by name', async () => {
      const account = await findUserAccount(userId, 'Checking');
      expect(account.id).toBe(accountId);
      expect(account.name).toBe('Main Checking');
    });

    test('finds account by account number', async () => {
      const account = await findUserAccount(userId, '5555');
      expect(account.id).toBe(accountId);
    });

    test('throws 404 for non-existent account', async () => {
      await expect(findUserAccount(userId, 'NonExistent')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('enforceHold', () => {
    test('does nothing for non-blocked account', () => {
      expect(() => enforceHold({ isBlocked: false, accountNumber: '5555' })).not.toThrow();
    });

    test('throws 403 for blocked account', () => {
      expect(() =>
        enforceHold({
          isBlocked: true,
          accountNumber: '5555',
          blockReason: 'Fraud suspected',
        })
      ).toThrow('placed on hold');
    });
  });

  describe('listAccounts', () => {
    test('returns user accounts and total balance', async () => {
      const result = await listAccounts(userId);
      expect(result.accounts.length).toBeGreaterThanOrEqual(1);
      expect(result.totalBalance).toBeGreaterThan(0);
    });
  });

  describe('getAccountDetails', () => {
    test('returns account details with transaction count', async () => {
      const account = await getAccountDetails(userId, accountId);
      expect(account.id).toBe(accountId);
      expect(account._count).toBeDefined();
    });

    test('throws 404 for wrong user', async () => {
      await expect(getAccountDetails('fake-user-id', accountId)).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
