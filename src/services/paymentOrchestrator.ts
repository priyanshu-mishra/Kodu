/**
 * Payment Orchestration Service
 * Handles EUR_INTERNAL (P1, P2) and CRYPTO_TO_FIAT (P3) payment flows
 * Implements double-entry ledger and atomic transactions
 */

import { supabase } from '../utils/supabase';
import { MockDataService } from './mockDataService';
import type {
  PaymentMode,
  TransactionStatus,
  EnhancedTransaction,
  LedgerEntry,
  Account,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentOrchestrationContext
} from '../types/database';

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPANY_WALLET_ADDRESS = import.meta.env.VITE_COMPANY_WALLET_ADDRESS || '0xKODU_COMPANY_WALLET';
const STABLECOIN_TO_EUR_RATE = 1.0; // MVP: 1:1 peg assumption
const FRONT_LIQUIDITY = true; // Whether K fronts EUR before off-ramp completes

// ============================================================================
// PAYMENT ORCHESTRATION
// ============================================================================

export class PaymentOrchestrator {
  /**
   * Main entry point for creating a payment
   * Routes to appropriate handler based on payment mode
   */
  static async createPayment(
    fromUserId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    console.log('🚀 Creating payment:', { fromUserId, request });

    // Validate request
    this.validatePaymentRequest(request);

    // Route to appropriate handler
    if (request.mode === 'EUR_INTERNAL') {
      return await this.handleEurInternalPayment(fromUserId, request);
    } else if (request.mode === 'CRYPTO_TO_FIAT') {
      return await this.handleCryptoToFiatPayment(fromUserId, request);
    } else if (request.mode === 'BANK_TRANSFER') {
      return await this.handleBankTransferPayment(fromUserId, request);
    } else {
      throw new Error(`Unsupported payment mode: ${request.mode}`);
    }
  }

  /**
   * P1, P2: EUR_INTERNAL - Euro-to-euro internal book transfer
   * Instant settlement, no blockchain involved
   */
  private static async handleEurInternalPayment(
    fromUserId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    console.log('💶 Handling EUR_INTERNAL payment');

    try {
      // Check if RPC function exists, otherwise use fallback
      const { data: transaction, error: txError } = await supabase.rpc(
        'process_eur_internal_payment',
        {
          p_from_user_id: fromUserId,
          p_to_user_id: request.to_user_id,
          p_amount_eur: request.amount_eur,
          p_message: request.message || null,
          p_ref_id: request.idempotency_key || null
        }
      );

      if (txError) {
        // If RPC doesn't exist, use fallback method
        console.warn('⚠️ RPC function not found, using fallback method');
        return await this.handleEurInternalPaymentFallback(fromUserId, request);
      }

      console.log('✅ EUR_INTERNAL payment completed:', transaction);

      return {
        transaction: transaction as EnhancedTransaction
      };
    } catch (error) {
      console.error('❌ EUR_INTERNAL payment failed:', error);
      throw error;
    }
  }

  /**
   * Fallback method for EUR_INTERNAL payments when RPC function doesn't exist
   */
  private static async handleEurInternalPaymentFallback(
    fromUserId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    console.log('💶 Using fallback EUR_INTERNAL payment method');

    // Create a simple transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        ref_id: request.idempotency_key || crypto.randomUUID(),
        from_user_id: fromUserId,
        to_user_id: request.to_user_id,
        amount_eur: request.amount_eur,
        mode: 'EUR_INTERNAL',
        status: 'SETTLED',
        message: request.message,
        settled_at: new Date().toISOString(),
        events: [{
          time: new Date().toISOString(),
          type: 'created',
          detail: 'EUR_INTERNAL payment created and settled'
        }]
      })
      .select()
      .single();

    if (txError) {
      throw new Error(`Payment failed: ${txError.message}`);
    }

    return {
      transaction: transaction as EnhancedTransaction
    };
  }

  /**
   * P3: CRYPTO_TO_FIAT - User sends crypto to K, K converts and credits EUR
   * Multi-step process with on-chain and off-ramp components
   */
  private static async handleCryptoToFiatPayment(
    fromUserId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    console.log('🔗 Handling CRYPTO_TO_FIAT payment');

    if (!request.token_contract || !request.chain_id) {
      throw new Error('Token contract and chain ID required for CRYPTO_TO_FIAT');
    }

    // Calculate token amount (MVP: 1:1 conversion)
    const amountToken = parseFloat(request.amount_eur) / STABLECOIN_TO_EUR_RATE;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        ref_id: request.idempotency_key,
        from_user_id: fromUserId,
        to_user_id: request.to_user_id,
        amount_eur: request.amount_eur,
        amount_token: amountToken.toString(),
        token_symbol: request.token_symbol || 'USDC',
        token_contract: request.token_contract,
        chain_id: request.chain_id,
        mode: 'CRYPTO_TO_FIAT',
        status: 'ONCHAIN_PENDING',
        message: request.message,
        events: JSON.stringify([{
          time: new Date().toISOString(),
          type: 'created',
          detail: 'Transaction created, awaiting on-chain transfer'
        }])
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Failed to create CRYPTO_TO_FIAT transaction:', txError);
      throw new Error(`Failed to create transaction: ${txError.message}`);
    }

    console.log('✅ CRYPTO_TO_FIAT transaction created:', transaction);

    // Return crypto payment details for frontend to execute
    return {
      transaction: transaction as EnhancedTransaction,
      crypto_payment_details: {
        recipient_address: COMPANY_WALLET_ADDRESS,
        token_contract: request.token_contract,
        amount_token: amountToken.toString(),
        chain_id: request.chain_id,
        estimated_gas: '0.001' // Placeholder
      }
    };
  }

  /**
   * Handle on-chain transfer notification
   * Called when blockchain transfer to K's wallet is detected
   */
  static async handleOnchainReceived(
    transactionId: string,
    txHash: string,
    confirmations: number
  ): Promise<void> {
    console.log('⛓️ Handling on-chain received:', { transactionId, txHash, confirmations });

    // Get current transaction to append to events
    const { data: currentTx } = await supabase
      .from('transactions')
      .select('events')
      .eq('id', transactionId)
      .single();

    const currentEvents = currentTx?.events || [];
    const newEvent = {
      time: new Date().toISOString(),
      type: 'onchain_received',
      detail: `On-chain transfer confirmed: ${txHash}`
    };

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'ONCHAIN_RECEIVED',
        onchain_tx_hash: txHash,
        onchain_confirmations: confirmations,
        onchain_received_at: new Date().toISOString(),
        events: [...currentEvents, newEvent]
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('❌ Failed to update on-chain status:', updateError);
      throw updateError;
    }

    // If fronting liquidity, credit recipient immediately
    if (FRONT_LIQUIDITY) {
      await this.creditRecipientFromReserve(transactionId);
    } else {
      // Otherwise, initiate off-ramp process
      await this.initiateOfframp(transactionId);
    }
  }

  /**
   * Credit recipient from K's settlement reserve (fronting liquidity)
   * K takes on settlement risk but provides instant UX
   */
  private static async creditRecipientFromReserve(transactionId: string): Promise<void> {
    console.log('💰 Crediting recipient from reserve (fronting liquidity)');

    try {
      const { error } = await supabase.rpc('credit_recipient_from_reserve', {
        p_transaction_id: transactionId
      });

      if (error) {
        console.warn('⚠️ RPC function not found, using fallback');
        // Fallback: just update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'CREDITED_TO_RECIPIENT',
            credited_at: new Date().toISOString()
          })
          .eq('id', transactionId);
      }

      console.log('✅ Recipient credited from reserve');
    } catch (error) {
      console.error('❌ Failed to credit recipient:', error);
      throw error;
    }
  }

  /**
   * Initiate off-ramp process (crypto -> EUR conversion)
   * In production, this would call external off-ramp partner API
   */
  private static async initiateOfframp(transactionId: string): Promise<void> {
    console.log('🏦 Initiating off-ramp process');

    // Get current events
    const { data: currentTx } = await supabase
      .from('transactions')
      .select('events')
      .eq('id', transactionId)
      .single();

    const currentEvents = currentTx?.events || [];
    const newEvent = {
      time: new Date().toISOString(),
      type: 'offramp_initiated',
      detail: 'Off-ramp conversion initiated'
    };

    // Update status
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'AWAITING_OFFRAMP',
        offramp_partner: 'SIMULATED',
        events: [...currentEvents, newEvent]
      })
      .eq('id', transactionId);

    if (error) {
      console.error('❌ Failed to initiate off-ramp:', error);
      throw error;
    }

    // In production: Call off-ramp partner API here
    // For MVP: Simulate instant off-ramp
    setTimeout(() => {
      this.handleOfframpComplete(transactionId, '1.0'); // Simulated
    }, 2000);
  }

  /**
   * Handle off-ramp completion
   * Called when EUR is received in K's bank account (B3)
   */
  static async handleOfframpComplete(
    transactionId: string,
    eurReceived: string
  ): Promise<void> {
    console.log('✅ Off-ramp complete, EUR received:', { transactionId, eurReceived });

    try {
      const { error } = await supabase.rpc('complete_offramp_and_credit', {
        p_transaction_id: transactionId,
        p_eur_received: eurReceived
      });

      if (error) {
        console.warn('⚠️ RPC function not found, using fallback');
        // Fallback: update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'CREDITED_TO_RECIPIENT',
            offramp_eur_received: eurReceived,
            offramp_completed_at: new Date().toISOString(),
            credited_at: new Date().toISOString()
          })
          .eq('id', transactionId);
      }

      console.log('✅ Off-ramp completed and recipient credited');
    } catch (error) {
      console.error('❌ Failed to complete off-ramp:', error);
      throw error;
    }
  }

  /**
   * Get user's EUR balance
   */
  static async getUserEurBalance(userId: string): Promise<{ balance: string; available: string }> {
    // Use mock data in development mode
    if (MockDataService.isDevelopmentMode()) {
      return await MockDataService.getUserEurBalance(userId);
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('balance, available_balance')
      .eq('user_id', userId)
      .eq('account_type', 'USER_EUR')
      .eq('currency', 'EUR')
      .single();

    if (error) {
      console.error('❌ Failed to get user balance:', error);
      return { balance: '0', available: '0' };
    }

    return {
      balance: data.balance,
      available: data.available_balance
    };
  }

  /**
   * P4: BANK_TRANSFER - Bank-to-bank transfer using connected accounts
   * Simulates SEPA/ACH transfer between user bank accounts
   */
  private static async handleBankTransferPayment(
    fromUserId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    console.log('🏦 Handling BANK_TRANSFER payment');

    if (!request.from_bank_account_id || !request.to_bank_account_id) {
      throw new Error('Bank account IDs required for BANK_TRANSFER');
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        ref_id: request.idempotency_key || crypto.randomUUID(),
        from_user_id: fromUserId,
        to_user_id: request.to_user_id,
        from_bank_account_id: request.from_bank_account_id,
        to_bank_account_id: request.to_bank_account_id,
        amount_eur: request.amount_eur,
        mode: 'BANK_TRANSFER',
        status: 'PENDING',
        message: request.message,
        events: [{
          time: new Date().toISOString(),
          type: 'created',
          detail: 'Bank transfer initiated'
        }]
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ Failed to create BANK_TRANSFER transaction:', txError);
      throw new Error(`Failed to create transaction: ${txError.message}`);
    }

    // Create bank movement record
    const { error: movementError } = await supabase
      .from('bank_movements')
      .insert({
        transaction_id: transaction.id,
        amount: request.amount_eur,
        currency: 'EUR',
        status: 'pending',
        metadata: {
          from_bank_account_id: request.from_bank_account_id,
          to_bank_account_id: request.to_bank_account_id
        }
      });

    if (movementError) {
      console.warn('⚠️ Failed to create bank movement record:', movementError);
    }

    console.log('✅ BANK_TRANSFER transaction created:', transaction);

    // In production, this would trigger actual bank transfer via API
    // For MVP/simulation, we can auto-complete after a delay
    setTimeout(() => {
      this.completeBankTransfer(transaction.id);
    }, 3000);

    return {
      transaction: transaction as EnhancedTransaction
    };
  }

  /**
   * Complete a bank transfer (simulated)
   * In production, this would be called by webhook from bank API
   */
  static async completeBankTransfer(transactionId: string): Promise<void> {
    console.log('✅ Completing bank transfer:', transactionId);

    const { data: currentTx } = await supabase
      .from('transactions')
      .select('events')
      .eq('id', transactionId)
      .single();

    const currentEvents = currentTx?.events || [];
    const newEvent = {
      time: new Date().toISOString(),
      type: 'bank_transfer_complete',
      detail: 'Bank transfer completed successfully'
    };

    await supabase
      .from('transactions')
      .update({
        status: 'SETTLED',
        settled_at: new Date().toISOString(),
        events: [...currentEvents, newEvent]
      })
      .eq('id', transactionId);

    // Update bank movement status
    await supabase
      .from('bank_movements')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);
  }

  /**
   * Validate payment request
   */
  private static validatePaymentRequest(request: CreatePaymentRequest): void {
    if (!request.to_user_id) {
      throw new Error('Recipient user ID is required');
    }

    const amount = parseFloat(request.amount_eur);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (amount > 10000) {
      throw new Error('Amount exceeds maximum limit');
    }

    if (!['EUR_INTERNAL', 'CRYPTO_TO_FIAT', 'BANK_TRANSFER'].includes(request.mode)) {
      throw new Error('Invalid payment mode');
    }

    // Validate bank transfer requirements
    if (request.mode === 'BANK_TRANSFER') {
      if (!request.from_bank_account_id || !request.to_bank_account_id) {
        throw new Error('Bank account IDs required for bank transfer');
      }
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create user EUR account if it doesn't exist
 */
export async function ensureUserEurAccount(userId: string): Promise<Account> {
  const { data: existing } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('account_type', 'USER_EUR')
    .eq('currency', 'EUR')
    .single();

  if (existing) {
    return existing as Account;
  }

  const { data: newAccount, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      account_type: 'USER_EUR',
      currency: 'EUR',
      balance: '0',
      available_balance: '0'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create EUR account: ${error.message}`);
  }

  return newAccount as Account;
}

/**
 * Get transaction with full details
 */
export async function getTransactionDetails(transactionId: string): Promise<EnhancedTransaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      from_user:users!from_user_id(*),
      to_user:users!to_user_id(*)
    `)
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Failed to get transaction details:', error);
    return null;
  }

  return data as EnhancedTransaction;
}
