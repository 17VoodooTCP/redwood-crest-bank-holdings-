require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding Redwood Crest Bank demo data...\n');

  // Clear existing data (order matters for foreign keys)
  await prisma.wireTransfer.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.account.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.user.deleteMany();

  // ── Demo User ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Demo1234!', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@redwoodcresthq.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Johnson',
      phoneNumber: '+1(603)661-9146',
      address: '1442 Redwood Valley Road',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      ssnLast4: '4821',
      isAdmin: true,
    },
  });
  console.log(`✅ Created admin user: ${user.email} (password: Demo1234!)`);

  // ── System Setting ─────────────────────────────────────────────────────────
  await prisma.systemSetting.create({
    data: { key: 'SYSTEM_STATUS', value: 'ONLINE' }
  });
  console.log('✅ Created System Status (ONLINE)');

  // ── Accounts ──────────────────────────────────────────────────────────────
  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'CHECKING',
      name: 'TOTAL CHECKING',
      accountNumber: '1234',
      balance: 4827.53,
      availableBalance: 4827.53,
    },
  });

  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'SAVINGS',
      name: 'REDWOOD CREST SAVINGS',
      accountNumber: '5678',
      balance: 12450.00,
      availableBalance: 12450.00,
    },
  });

  const credit = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'CREDIT',
      name: 'REDWOOD PREFERRED CARD',
      accountNumber: '9012',
      balance: -1847.23,
      availableBalance: 8152.77,
      creditLimit: 10000.00,
      minimumPayment: 35.00,
      statementBalance: 1650.00,
      nextPaymentDue: '2024-05-20',
    },
  });

  const heloc = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'HELOC',
      name: 'HOME EQUITY LINE OF CREDIT',
      accountNumber: '3321',
      balance: -15000.00,
      availableBalance: 85000.00,
      creditLimit: 100000.00,
      minimumPayment: 250.00,
      statementBalance: 15000.00,
      nextPaymentDue: '2024-06-15',
    },
  });

  console.log(`✅ Created 4 accounts: Checking (...1234), Savings (...5678), Credit (...9012), HELOC (...3321)`);

  // ── Transactions ──────────────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  const checkingTransactions = [
    { description: 'DIRECT DEPOSIT - ACME CORP', amount: 3200.00, date: daysAgo(1), category: 'Income', merchant: 'ACME Corp' },
    { description: 'WHOLE FOODS MARKET #982', amount: -87.43, date: daysAgo(2), category: 'Groceries', merchant: 'Whole Foods' },
    { description: 'NETFLIX.COM', amount: -15.99, date: daysAgo(3), category: 'Entertainment', merchant: 'Netflix' },
    { description: 'SHELL OIL 12345', amount: -62.14, date: daysAgo(4), category: 'Auto & Gas', merchant: 'Shell' },
    { description: 'STARBUCKS #00112', amount: -6.75, date: daysAgo(5), category: 'Food & Drink', merchant: 'Starbucks' },
    { description: 'AMAZON.COM*MT4XY7890', amount: -34.99, date: daysAgo(6), category: 'Shopping', merchant: 'Amazon' },
    { description: 'ATM WITHDRAWAL', amount: -200.00, date: daysAgo(7), category: 'ATM', merchant: null },
    { description: 'SPOTIFY USA', amount: -9.99, date: daysAgo(9), category: 'Entertainment', merchant: 'Spotify' },
    { description: 'TARGET CORP #0394', amount: -124.67, date: daysAgo(11), category: 'Shopping', merchant: 'Target' },
    { description: 'CHIPOTLE MEXICAN GRILL', amount: -14.25, date: daysAgo(12), category: 'Food & Drink', merchant: 'Chipotle' },
    { description: 'PUBLIX SUPER MARKETS', amount: -156.33, date: daysAgo(14), category: 'Groceries', merchant: 'Publix' },
    { description: 'APPLE.COM/BILL', amount: -2.99, date: daysAgo(16), category: 'Entertainment', merchant: 'Apple' },
    { description: 'CVS PHARMACY #7891', amount: -22.47, date: daysAgo(18), category: 'Health', merchant: 'CVS' },
    { description: 'DIRECTV*SATELLITE', amount: -84.99, date: daysAgo(20), category: 'Entertainment', merchant: 'DirecTV' },
    { description: 'DIRECT DEPOSIT - ACME CORP', amount: 3200.00, date: daysAgo(15), category: 'Income', merchant: 'ACME Corp' },
    { description: 'WALMART SUPERCENTER #1843', amount: -198.76, date: daysAgo(22), category: 'Shopping', merchant: 'Walmart' },
    { description: 'HULU *MONTHLY', amount: -17.99, date: daysAgo(24), category: 'Entertainment', merchant: 'Hulu' },
    { description: 'DOMINOS PIZZA #4821', amount: -32.50, date: daysAgo(25), category: 'Food & Drink', merchant: 'Dominos' },
    { description: 'HOME DEPOT #6780', amount: -247.89, date: daysAgo(27), category: 'Home', merchant: 'Home Depot' },
    { description: 'VENMO PAYMENT', amount: -50.00, date: daysAgo(29), category: 'Transfer', merchant: 'Venmo' },
  ];

  const savingsTransactions = [
    { description: 'INTEREST PAYMENT', amount: 18.67, date: daysAgo(1), category: 'Income', merchant: null },
    { description: 'TRANSFER FROM CHECKING', amount: 500.00, date: daysAgo(10), category: 'Transfer', merchant: null },
    { description: 'TRANSFER FROM CHECKING', amount: 1000.00, date: daysAgo(30), category: 'Transfer', merchant: null },
    { description: 'INTEREST PAYMENT', amount: 17.92, date: daysAgo(31), category: 'Income', merchant: null },
  ];

  const creditTransactions = [
    { description: 'WAL-MART #8823', amount: -52.34, date: daysAgo(1), category: 'Shopping', merchant: 'Walmart', pending: true },
    { description: 'UNITED AIRLINES', amount: -389.00, date: daysAgo(3), category: 'Travel', merchant: 'United Airlines' },
    { description: 'MARRIOTT HOTELS', amount: -287.50, date: daysAgo(5), category: 'Travel', merchant: 'Marriott' },
    { description: 'BEST BUY #00987', amount: -428.99, date: daysAgo(7), category: 'Shopping', merchant: 'Best Buy' },
    { description: 'TEXACO #00451', amount: -48.23, date: daysAgo(8), category: 'Auto & Gas', merchant: 'Texaco' },
    { description: 'COTTON PATCH CAFE', amount: -34.67, date: daysAgo(10), category: 'Food & Drink', merchant: 'Cotton Patch' },
    { description: 'PAYMENT THANK YOU - WEB', amount: 500.00, date: daysAgo(12), category: 'Payment', merchant: null },
    { description: 'TCBY FROZEN YOGURT', amount: -8.45, date: daysAgo(14), category: 'Food & Drink', merchant: 'TCBY' },
    { description: 'AMAZON PRIME', amount: -14.99, date: daysAgo(16), category: 'Shopping', merchant: 'Amazon' },
    { description: 'UBER TECHNOLOGIES', amount: -23.50, date: daysAgo(18), category: 'Transport', merchant: 'Uber' },
    { description: 'AIRBNB TRAVEL', amount: -145.00, date: daysAgo(20), category: 'Travel', merchant: 'Airbnb' },
    { description: 'COSTCO WHOLESALE #482', amount: -178.34, date: daysAgo(23), category: 'Shopping', merchant: 'Costco' },
    { description: 'PAYMENT THANK YOU - WEB', amount: 200.00, date: daysAgo(28), category: 'Payment', merchant: null },
    { description: 'THE HOME DEPOT', amount: -89.45, date: daysAgo(30), category: 'Home', merchant: 'Home Depot' },
  ];

  const helocTransactions = [
    { description: 'LINE DRAW - HOME IMPROV', amount: -15000.00, date: daysAgo(30), category: 'Home', merchant: 'Home Depot' }
  ];

  for (const tx of checkingTransactions) {
    await prisma.transaction.create({ data: { accountId: checking.id, ...tx } });
  }
  for (const tx of savingsTransactions) {
    await prisma.transaction.create({ data: { accountId: savings.id, ...tx } });
  }
  for (const tx of creditTransactions) {
    await prisma.transaction.create({ data: { accountId: credit.id, ...tx } });
  }
  for (const tx of helocTransactions) {
    await prisma.transaction.create({ data: { accountId: heloc.id, ...tx } });
  }

  console.log(`✅ Created ${checkingTransactions.length + savingsTransactions.length + creditTransactions.length + helocTransactions.length} transactions`);

  console.log('\n🎉 Seed complete!\n');
  console.log('   Demo credentials:');
  console.log('   Email:    demo@redwoodcresthq.com');
  console.log('   Password: Demo1234!\n');

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
