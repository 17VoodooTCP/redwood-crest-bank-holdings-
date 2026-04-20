/**
 * Shared type definitions for the Redwood Crest Banking API.
 * These types mirror the Prisma schema and API request/response shapes.
 */

// ── Database Models ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  ssnLast4: string | null;
  twoFASecret: string | null;
  twoFAEnabled: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  accounts?: Account[];
  messages?: Message[];
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'HELOC' | 'BUSINESS';

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  name: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  creditLimit: number | null;
  minimumPayment: number | null;
  statementBalance: number | null;
  nextPaymentDue: string | null;
  isActive: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  expiryDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  pending: boolean;
  merchant: string | null;
  createdAt: Date;
  account?: Pick<Account, 'name' | 'accountNumber'>;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: Date;
}

export type PaymentType = 'FIXED' | 'MINIMUM' | 'STATEMENT' | 'CURRENT';

export interface Payment {
  id: string;
  creditAccountId: string;
  fromAccountId: string;
  amount: number;
  paymentType: PaymentType;
  status: string;
  createdAt: Date;
}

export type WireType = 'domestic' | 'international';
export type WireStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface WireTransfer {
  id: string;
  fromAccountId: string;
  type: WireType;
  amount: number;
  fee: number;
  recipientName: string;
  routingNumber: string | null;
  accountNumber: string | null;
  bankName: string | null;
  swiftCode: string | null;
  iban: string | null;
  recipientCountry: string | null;
  recipientAddress: string | null;
  recipientBankAddress: string | null;
  currency: string;
  memo: string | null;
  status: WireStatus;
  createdAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

export interface LoginAttempt {
  id: string;
  userId: string;
  ipAddress: string;
  location: string | null;
  isSuspicious: boolean;
  timestamp: Date;
}

export type SystemStatus = 'ONLINE' | 'BUSY' | 'MAINTENANCE';

// ── API Request Types ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  totpToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TransferRequest {
  amount: number;
  fromAccount: string;
  toAccount: string;
}

export interface PaymentRequest {
  amount: number | 'MINIMUM' | 'STATEMENT' | 'CURRENT';
  creditAccount: string;
  fromAccount: string;
}

export interface WireRequest {
  type: WireType;
  amount: number;
  fromAccount: string;
  recipientName: string;
  memo?: string;
  // Domestic
  routingNumber?: string;
  accountNumber?: string;
  bankName?: string;
  // International
  swiftCode?: string;
  iban?: string;
  recipientCountry?: string;
  recipientAddress?: string;
  recipientBankAddress?: string;
  currency?: string;
}

export interface TransactionSearchParams {
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  contains?: string;
  account?: string;
  page?: number;
  limit?: number;
}

// ── API Response Types ───────────────────────────────────────────────────────

export interface AuthResponse {
  user: Omit<User, 'password' | 'twoFASecret'>;
  accessToken: string;
}

export interface TwoFARequiredResponse {
  requires2FA: true;
  message: string;
}

export interface AccountsResponse {
  accounts: Account[];
  totalBalance: number;
}

export interface TransferResponse {
  message: string;
  transfer: Transfer;
}

export interface PaymentResponse {
  message: string;
  payment: Payment;
}

export interface WireResponse {
  message: string;
  wireTransfer: WireTransfer;
}

export interface TransactionSearchResponse {
  transactions: Transaction[];
  count: number;
  page: number;
  pageCount: number;
}

export interface StatementResponse {
  period: {
    month: number;
    year: number;
    start: Date;
    end: Date;
  };
  summary: {
    beginningBalance: number;
    deposits: number;
    withdrawals: number;
    fees: number;
    endingBalance: number;
  };
  account: {
    name: string;
    type: AccountType;
    accountNumber: string;
    user: Pick<User, 'firstName' | 'lastName' | 'address' | 'city' | 'state' | 'zipCode'>;
  };
  transactions: Transaction[];
}

export interface CommandResponse {
  intent: string;
  data: unknown;
  stringOut: string;
}

// ── Service Error ────────────────────────────────────────────────────────────

export interface ServiceError extends Error {
  status: number;
  code?: string;
  blockReason?: string;
}
