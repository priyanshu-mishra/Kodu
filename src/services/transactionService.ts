/**
 * Unified Transaction Service
 * Handles all types of transactions: EUR internal, bank transfers, and crypto
 */

import { supabase } from '../utils/supabase';
import { EurAccountService } from './eurAccountService';

export type PaymentMode = 'EUR_INTERNAL' | 'BANK_TRANSFER' | 'CRYPTO_TO_FIAT' | 'ONCHAIN_DIRECT';
export type TransactionStatus = 'PENDING' | 'SETTLED' | 'FAILED';

export interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_account_id?: string;
  to_account_id?: string;
  from_bank_account_id?: string;
  to_bank_account_id?: string;
  amount_eur?: string;
  amount_token?: string;
  token_symbol?: string;
  token_contract?: string;
  chain_id?: number;
  mode: PaymentMode;
  status: TransactionStatus;
  message?: string;
  from_address?: string;
  to_address?: string;
  onchain_tx_hash?: string;
  thirdweb_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export class TransactionService {
  /**
   * Create EUR internal transaction (P2P EUR transfer)
   */
  static async createEurInternalTransaction(
    fromUserId: string,
    toUserId: string,
    amount: string,
    message?: string
  ): Promise<Transaction> {
    // Get or create EUR accounts for both users
    const fromAccount = await EurAccountService.getOrCreateUserEurAccount(fromUserId);
    const toAccount = await EurAccountService.getOrCreateUserEurAccount(toUserId);

    // Check sufficient balance
    const hasFunds = await EurAccountService.hasSufficientBalance(fromUserId, amount);
    if (!hasFunds) {
      throw new Error('Insufficient EUR balance');
    }

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        from_account_id: fromAccount.id,
        to_account_id: toAccount.id,
        amount_eur: amount,
        mode: 'EUR_INTERNAL',
        status: 'PENDING',
        message: message || null
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create EUR internal transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    // Transfer funds between accounts
    try {
      await EurAccountService.transferBetweenAccounts(
        fromAccount.id,
        toAccount.id,
        amount
      );

      // Update transaction status to SETTLED
      await this.updateTransactionStatus(transaction.id, 'SETTLED');

      // Return updated transaction
      return { ...transaction, status: 'SETTLED' } as Transaction;
    } catch (transferError) {
      // If transfer fails, mark transaction as failed
      await this.updateTransactionStatus(transaction.id, 'FAILED');
      throw transferError;
    }
  }

  /**
   * Create bank transfer transaction
   */
  static async createBankTransferTransaction(
    fromUserId: string,
    toUserId: string,
    fromBankAccountId: string,
    toBankAccountId: string,
    amount: string,
    message?: string
  ): Promise<Transaction> {
    // Create transaction record with bank account references
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        from_bank_account_id: fromBankAccountId,
        to_bank_account_id: toBankAccountId,
        amount_eur: amount,
        mode: 'BANK_TRANSFER',
        status: 'PENDING',
        message: message || null
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create bank transfer transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction as Transaction;
  }

  /**
   * Create crypto transaction (for compatibility with existing crypto flow)
   */
  static async createCryptoTransaction(
    fromUserId: string,
    toUserId: string,
    fromAddress: string,
    toAddress: string,
    amount: string,
    tokenContract: string,
    tokenSymbol: string,
    chainId: number,
    message?: string,
    thirdwebTransactionId?: string
  ): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        from_address: fromAddress,
        to_address: toAddress,
        amount_token: amount,
        token_contract: tokenContract,
        token_symbol: tokenSymbol,
        chain_id: chainId,
        thirdweb_transaction_id: thirdwebTransactionId,
        message: message || null,
        mode: 'ONCHAIN_DIRECT',
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create crypto transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction as Transaction;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    transactionHash?: string
  ): Promise<void> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'SETTLED') {
      updates.settled_at = new Date().toISOString();
    }

    if (transactionHash) {
      updates.onchain_tx_hash = transactionHash;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId);

    if (error) {
      console.error('Failed to update transaction status:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }

    return data as Transaction;
  }

  /**
   * Get user's transactions
   */
  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get user transactions:', error);
      return [];
    }

    return (data || []) as Transaction[];
  }
}
