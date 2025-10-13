/**
 * Bank Account Management Service
 * Handles CRUD operations for user bank accounts
 */

import { supabase } from '../utils/supabase';
import { MockDataService } from './mockDataService';
import type { BankAccount, BankAccountType, BankAccountStatus } from '../types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateBankAccountRequest {
  bank_name: string;
  account_holder_name: string;
  account_type: BankAccountType;
  iban?: string;
  account_number?: string;
  routing_number?: string;
  swift_bic?: string;
  currency?: string;
  country?: string;
  nickname?: string;
  is_primary?: boolean;
}

export interface UpdateBankAccountRequest {
  bank_name?: string;
  account_holder_name?: string;
  nickname?: string;
  is_primary?: boolean;
  status?: BankAccountStatus;
}

// ============================================================================
// BANK ACCOUNT SERVICE
// ============================================================================

export class BankAccountService {
  /**
   * Get all bank accounts for a user
   */
  static async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    // Use mock data in development mode
    if (MockDataService.isDevelopmentMode()) {
      return await MockDataService.getUserBankAccounts(userId);
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch bank accounts:', error);
      throw new Error(`Failed to fetch bank accounts: ${error.message}`);
    }

    return (data || []) as BankAccount[];
  }

  /**
   * Get a specific bank account by ID
   */
  static async getBankAccount(accountId: string): Promise<BankAccount | null> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Failed to fetch bank account:', error);
      return null;
    }

    return data as BankAccount;
  }

  /**
   * Get user's primary bank account
   */
  static async getPrimaryBankAccount(userId: string): Promise<BankAccount | null> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .eq('status', 'ACTIVE')
      .single();

    if (error) {
      // No primary account found is not an error
      return null;
    }

    return data as BankAccount;
  }

  /**
   * Create a new bank account
   */
  static async createBankAccount(
    userId: string,
    request: CreateBankAccountRequest
  ): Promise<BankAccount> {
    // Check if demo mode (mock user ID)
    if (userId.startsWith('mock-')) {
      console.error('❌ Cannot create bank account: User is in demo mode');
      throw new Error('You are currently in demo mode. Please log out and log in again to use the real database. If this issue persists, clear your browser data and try again.');
    }

    // Validate that at least one identifier is provided
    if (!request.iban && !(request.account_number && request.routing_number)) {
      throw new Error('Either IBAN or Account Number with Routing Number must be provided');
    }

    // If this is set as primary, unset other primary accounts
    if (request.is_primary) {
      await this.unsetPrimaryAccounts(userId);
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: userId,
        bank_name: request.bank_name,
        account_holder_name: request.account_holder_name,
        account_type: request.account_type,
        iban: request.iban,
        account_number: request.account_number,
        routing_number: request.routing_number,
        swift_bic: request.swift_bic,
        currency: request.currency || 'EUR',
        country: request.country || 'EU',
        nickname: request.nickname,
        is_primary: request.is_primary || false,
        status: 'PENDING_VERIFICATION'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create bank account:', error);
      throw new Error(`Failed to create bank account: ${error.message}`);
    }

    return data as BankAccount;
  }

  /**
   * Update a bank account
   */
  static async updateBankAccount(
    accountId: string,
    userId: string,
    request: UpdateBankAccountRequest
  ): Promise<BankAccount> {
    // If setting as primary, unset other primary accounts
    if (request.is_primary) {
      await this.unsetPrimaryAccounts(userId);
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .update({
        bank_name: request.bank_name,
        account_holder_name: request.account_holder_name,
        nickname: request.nickname,
        is_primary: request.is_primary,
        status: request.status
      })
      .eq('id', accountId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update bank account:', error);
      throw new Error(`Failed to update bank account: ${error.message}`);
    }

    return data as BankAccount;
  }

  /**
   * Delete a bank account
   */
  static async deleteBankAccount(accountId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete bank account:', error);
      throw new Error(`Failed to delete bank account: ${error.message}`);
    }
  }

  /**
   * Set a bank account as primary
   */
  static async setPrimaryBankAccount(accountId: string, userId: string): Promise<void> {
    // First, unset all primary accounts for this user
    await this.unsetPrimaryAccounts(userId);

    // Then set this account as primary
    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_primary: true })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to set primary bank account:', error);
      throw new Error(`Failed to set primary bank account: ${error.message}`);
    }
  }

  /**
   * Verify a bank account (admin/system function)
   */
  static async verifyBankAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .update({
        status: 'ACTIVE',
        verified_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (error) {
      console.error('Failed to verify bank account:', error);
      throw new Error(`Failed to verify bank account: ${error.message}`);
    }
  }

  /**
   * Check if user has any active bank accounts
   */
  static async hasActiveBankAccounts(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .limit(1);

    if (error) {
      console.error('Failed to check bank accounts:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Helper: Unset all primary accounts for a user
   */
  private static async unsetPrimaryAccounts(userId: string): Promise<void> {
    await supabase
      .from('bank_accounts')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
  }

  /**
   * Get masked account number for display
   */
  static getMaskedAccountNumber(account: BankAccount): string {
    if (account.iban) {
      const iban = account.iban.replace(/\s/g, '');
      return `****${iban.slice(-4)}`;
    }
    if (account.account_number) {
      return `****${account.account_number.slice(-4)}`;
    }
    return '****';
  }

  /**
   * Get formatted account display name
   */
  static getAccountDisplayName(account: BankAccount): string {
    if (account.nickname) {
      return account.nickname;
    }
    return `${account.bank_name} (${this.getMaskedAccountNumber(account)})`;
  }
}
