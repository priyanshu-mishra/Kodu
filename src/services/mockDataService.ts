/**
 * Mock Data Service for Development
 * Provides mock data when Supabase is not available
 */

import type { User, Transaction } from '../utils/supabase';
import type { BankAccount } from '../types/database';

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'dev-user-1',
    email: 'dev@example.com',
    username: 'devuser',
    wallet_address: '0x1234567890123456789012345678901234567890',
    display_name: 'Dev User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dev-user-2',
    email: 'alice@example.com',
    username: 'alice',
    wallet_address: '0x2345678901234567890123456789012345678901',
    display_name: 'Alice Johnson',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dev-user-3',
    email: 'bob@example.com',
    username: 'bob',
    wallet_address: '0x3456789012345678901234567890123456789012',
    display_name: 'Bob Smith',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    from_user_id: 'dev-user-2',
    to_user_id: 'dev-user-1',
    from_address: '0x2345678901234567890123456789012345678901',
    to_address: '0x1234567890123456789012345678901234567890',
    amount: '25.00',
    token_contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    token_symbol: 'USDC',
    chain_id: 8453,
    thirdweb_transaction_id: 'tw-tx-1',
    transaction_hash: '0xabc123def456789012345678901234567890123456789012345678901234567890',
    message: 'Thanks for lunch!',
    status: 'confirmed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    confirmed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), // 2 hours ago + 5 minutes
    from_user: MOCK_USERS[1],
    to_user: MOCK_USERS[0]
  },
  {
    id: 'tx-2',
    from_user_id: 'dev-user-1',
    to_user_id: 'dev-user-3',
    from_address: '0x1234567890123456789012345678901234567890',
    to_address: '0x3456789012345678901234567890123456789012',
    amount: '50.00',
    token_contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    token_symbol: 'USDC',
    chain_id: 8453,
    thirdweb_transaction_id: 'tw-tx-2',
    transaction_hash: '0xdef456abc789012345678901234567890123456789012345678901234567890123',
    message: 'Split the bill',
    status: 'confirmed',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    confirmed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(), // 1 day ago + 3 minutes
    from_user: MOCK_USERS[0],
    to_user: MOCK_USERS[2]
  },
  {
    id: 'tx-3',
    from_user_id: 'dev-user-3',
    to_user_id: 'dev-user-1',
    from_address: '0x3456789012345678901234567890123456789012',
    to_address: '0x1234567890123456789012345678901234567890',
    amount: '15.00',
    token_contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    token_symbol: 'USDC',
    chain_id: 8453,
    thirdweb_transaction_id: 'tw-tx-3',
    transaction_hash: '0x789012def456abc123456789012345678901234567890123456789012345678901',
    message: 'Coffee money',
    status: 'pending',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    from_user: MOCK_USERS[2],
    to_user: MOCK_USERS[0]
  }
];

// Mock Bank Accounts
export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    user_id: 'dev-user-1',
    account_type: 'CHECKING',
    status: 'ACTIVE',
    bank_name: 'Deutsche Bank',
    account_holder_name: 'Dev User',
    iban: 'DE89370400440532013000',
    currency: 'EUR',
    country: 'DE',
    is_primary: true,
    nickname: 'Main Account',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bank-2',
    user_id: 'dev-user-1',
    account_type: 'SAVINGS',
    status: 'ACTIVE',
    bank_name: 'N26',
    account_holder_name: 'Dev User',
    iban: 'DE89370400440532013001',
    currency: 'EUR',
    country: 'DE',
    is_primary: false,
    nickname: 'Savings',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock EUR Balance
export const MOCK_EUR_BALANCE = {
  balance: '125.50',
  available: '110.50'
};

// Mock Crypto Balances
export const MOCK_CRYPTO_BALANCES = [
  {
    id: 'crypto-1',
    user_id: 'dev-user-1',
    account_type: 'USER_CRYPTO',
    currency: 'USDC',
    balance: '75.25',
    available_balance: '75.25',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'crypto-2',
    user_id: 'dev-user-1',
    account_type: 'USER_CRYPTO',
    currency: 'USDT',
    balance: '25.00',
    available_balance: '25.00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class MockDataService {
  static isDevelopmentMode(): boolean {
    return import.meta.env.DEV && localStorage.getItem('mock_user') !== null;
  }

  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    if (!this.isDevelopmentMode()) return null;
    
    return MOCK_USERS.find(user => user.wallet_address === walletAddress) || null;
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    if (!this.isDevelopmentMode()) return [];
    
    return MOCK_TRANSACTIONS.filter(tx => 
      tx.from_user_id === userId || tx.to_user_id === userId
    );
  }

  static async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    if (!this.isDevelopmentMode()) return [];
    
    return MOCK_BANK_ACCOUNTS.filter(account => account.user_id === userId);
  }

  static async getUserEurBalance(userId: string): Promise<{ balance: string; available: string }> {
    if (!this.isDevelopmentMode()) return { balance: '0', available: '0' };
    
    return MOCK_EUR_BALANCE;
  }

  static async getUserCryptoBalances(userId: string): Promise<any[]> {
    if (!this.isDevelopmentMode()) return [];
    
    return MOCK_CRYPTO_BALANCES.filter(balance => balance.user_id === userId);
  }

  static async searchUsers(query: string): Promise<User[]> {
    if (!this.isDevelopmentMode()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return MOCK_USERS.filter(user => 
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.display_name?.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }
}
