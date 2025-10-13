/**
 * EUR Account Management Service
 * Handles EUR account operations and balance management
 */

import { supabase } from '../utils/supabase';

export interface EurAccount {
  id: string;
  user_id: string;
  account_type: string;
  currency: string;
  balance: string;
  available_balance: string;
  created_at: string;
  updated_at: string;
}

export class EurAccountService {
  /**
   * Get or create a EUR account for a user
   */
  static async getOrCreateUserEurAccount(userId: string): Promise<EurAccount> {
    // Try to get existing EUR account
    const { data: existingAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('account_type', 'USER_EUR')
      .eq('currency', 'EUR')
      .single();

    if (existingAccount && !fetchError) {
      return existingAccount as EurAccount;
    }

    // Create new EUR account if it doesn't exist
    const { data: newAccount, error: createError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        account_type: 'USER_EUR',
        currency: 'EUR',
        balance: 0,
        available_balance: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create EUR account:', createError);
      throw new Error(`Failed to create EUR account: ${createError.message}`);
    }

    return newAccount as EurAccount;
  }

  /**
   * Get user's EUR balance
   */
  static async getUserEurBalance(userId: string): Promise<{ balance: string; available: string }> {
    const account = await this.getOrCreateUserEurAccount(userId);
    return {
      balance: account.balance,
      available: account.available_balance
    };
  }

  /**
   * Check if user has sufficient balance
   */
  static async hasSufficientBalance(userId: string, amount: string): Promise<boolean> {
    const { available } = await this.getUserEurBalance(userId);
    return parseFloat(available) >= parseFloat(amount);
  }

  /**
   * Update account balance (internal use only - should be done via ledger entries)
   */
  static async updateBalance(
    accountId: string,
    newBalance: string,
    newAvailableBalance: string
  ): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({
        balance: newBalance,
        available_balance: newAvailableBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (error) {
      console.error('Failed to update account balance:', error);
      throw new Error(`Failed to update account balance: ${error.message}`);
    }
  }

  /**
   * Get account by ID
   */
  static async getAccountById(accountId: string): Promise<EurAccount | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Failed to get account:', error);
      return null;
    }

    return data as EurAccount;
  }

  /**
   * Transfer EUR between accounts (atomic operation)
   */
  static async transferBetweenAccounts(
    fromAccountId: string,
    toAccountId: string,
    amount: string
  ): Promise<void> {
    const amountNum = parseFloat(amount);

    // Get both accounts
    const fromAccount = await this.getAccountById(fromAccountId);
    const toAccount = await this.getAccountById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    // Check sufficient balance
    const fromAvailable = parseFloat(fromAccount.available_balance);
    if (fromAvailable < amountNum) {
      throw new Error('Insufficient balance');
    }

    // Calculate new balances
    const newFromBalance = (parseFloat(fromAccount.balance) - amountNum).toFixed(6);
    const newFromAvailable = (parseFloat(fromAccount.available_balance) - amountNum).toFixed(6);
    const newToBalance = (parseFloat(toAccount.balance) + amountNum).toFixed(6);
    const newToAvailable = (parseFloat(toAccount.available_balance) + amountNum).toFixed(6);

    // Update both accounts
    await this.updateBalance(fromAccountId, newFromBalance, newFromAvailable);
    await this.updateBalance(toAccountId, newToBalance, newToAvailable);
  }

  /**
   * Add funds to account (for testing/admin)
   */
  static async addFunds(userId: string, amount: string): Promise<void> {
    const account = await this.getOrCreateUserEurAccount(userId);
    const amountNum = parseFloat(amount);
    
    const newBalance = (parseFloat(account.balance) + amountNum).toFixed(6);
    const newAvailable = (parseFloat(account.available_balance) + amountNum).toFixed(6);

    await this.updateBalance(account.id, newBalance, newAvailable);
  }
}
