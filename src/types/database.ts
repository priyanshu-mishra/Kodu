/**
 * Enhanced Database Types for Kodu
 * Supports EUR_INTERNAL and CRYPTO_TO_FIAT payment modes
 * Implements double-entry ledger system
 */

// ============================================================================
// ENUMS
// ============================================================================

export type PaymentMode = 
  | 'EUR_INTERNAL'      // P1, P2: Euro-to-euro internal book transfer
  | 'CRYPTO_TO_FIAT'    // P3: User sends crypto to K, K converts and credits EUR
  | 'BANK_TRANSFER'     // P4: Bank-to-bank transfer using connected bank accounts
  | 'ONCHAIN_DIRECT';   // Future: Direct wallet-to-wallet crypto

export type TransactionStatus =
  | 'PENDING'                // Initial state
  | 'ONCHAIN_PENDING'        // Waiting for blockchain confirmation
  | 'ONCHAIN_RECEIVED'       // K received crypto on-chain
  | 'AWAITING_OFFRAMP'       // Waiting for crypto->EUR conversion
  | 'OFFRAMP_COMPLETE'       // EUR received in K's bank
  | 'CREDITED_TO_RECIPIENT'  // Recipient EUR balance updated
  | 'SETTLED'                // Fully settled (bank reconciliation complete)
  | 'FAILED'                 // Transaction failed
  | 'FAILED_ONCHAIN'         // On-chain transfer failed/reverted
  | 'FAILED_OFFRAMP';        // Off-ramp conversion failed

export type LedgerEntryType = 'DEBIT' | 'CREDIT';

export type LedgerEntryStatus = 
  | 'PENDING'
  | 'LOCKED'
  | 'SETTLED'
  | 'REVERSED';

export type AccountType =
  | 'USER_EUR'           // User's EUR balance
  | 'USER_CRYPTO'        // User's crypto holdings
  | 'COMPANY_EUR'        // K's EUR bank account (B3)
  | 'COMPANY_CRYPTO'     // K's crypto wallet
  | 'SETTLEMENT_RESERVE'; // K's float for fronting liquidity

export type BankAccountType = 
  | 'CHECKING'
  | 'SAVINGS'
  | 'BUSINESS';

export type BankAccountStatus = 
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Account {
  id: string;
  user_id?: string;
  account_type: AccountType;
  currency: string;
  balance: string;
  available_balance: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_type: BankAccountType;
  status: BankAccountStatus;
  
  // Bank details
  bank_name: string;
  account_holder_name: string;
  iban?: string;
  account_number?: string;
  routing_number?: string;
  swift_bic?: string;
  
  // Additional info
  currency: string;
  country: string;
  is_primary: boolean;
  nickname?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  verified_at?: string;
}

export interface EnhancedTransaction {
  id: string;
  ref_id?: string;
  
  // Participants
  from_user_id?: string;
  to_user_id?: string;
  from_account_id?: string;
  to_account_id?: string;
  
  // Bank transfer references
  from_bank_account_id?: string;
  to_bank_account_id?: string;
  
  // Amounts
  amount_eur?: string;
  amount_token?: string;
  token_symbol?: string;
  token_contract?: string;
  chain_id?: number;
  
  // Payment details
  mode: PaymentMode;
  status: TransactionStatus;
  message?: string;
  
  // Blockchain data
  onchain_tx_hash?: string;
  onchain_confirmations?: number;
  
  // Thirdweb integration
  thirdweb_transaction_id?: string;
  
  // Off-ramp data
  offramp_partner?: string;
  offramp_reference?: string;
  offramp_eur_received?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  onchain_received_at?: string;
  offramp_completed_at?: string;
  credited_at?: string;
  settled_at?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  events?: TransactionEvent[];
  
  // Relations (populated by joins)
  from_user?: any;
  to_user?: any;
}

export interface TransactionEvent {
  time: string;
  type: string;
  detail: string;
}

export interface LedgerEntry {
  id: string;
  transaction_id?: string;
  account_id: string;
  amount: string;
  currency: string;
  entry_type: LedgerEntryType;
  status: LedgerEntryStatus;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  settled_at?: string;
}

export interface OnchainEvent {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  token_contract: string;
  token_symbol?: string;
  amount: string;
  chain_id: number;
  confirmations: number;
  block_number?: number;
  processed: boolean;
  transaction_id?: string;
  created_at: string;
  processed_at?: string;
  metadata?: Record<string, any>;
}

export interface BankMovement {
  id: string;
  bank_tx_id?: string;
  transaction_id?: string;
  amount: string;
  currency: string;
  from_bank?: string;
  to_bank?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface Reconciliation {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  total_transactions: number;
  total_eur_volume: string;
  net_positions: Record<string, any>;
  settlement_instructions: any[];
  details: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreatePaymentRequest {
  to_user_id: string;
  amount_eur: string;
  mode: PaymentMode;
  message?: string;
  idempotency_key?: string;
  
  // For CRYPTO_TO_FIAT mode
  token_symbol?: string;
  token_contract?: string;
  chain_id?: number;
  
  // For BANK_TRANSFER mode
  from_bank_account_id?: string;
  to_bank_account_id?: string;
}

export interface CreatePaymentResponse {
  transaction: EnhancedTransaction;
  
  // For CRYPTO_TO_FIAT mode
  crypto_payment_details?: {
    recipient_address: string;  // K's wallet address
    token_contract: string;
    amount_token: string;
    chain_id: number;
    estimated_gas?: string;
  };
}

export interface BalanceResponse {
  eur_balance: string;
  eur_available: string;
  crypto_balances?: Array<{
    currency: string;
    balance: string;
    available_balance: string;
  }>;
}

export interface UserBalance {
  user_id: string;
  username?: string;
  wallet_address: string;
  currency: string;
  balance: string;
  available_balance: string;
  account_type: AccountType;
}

// ============================================================================
// PAYMENT ORCHESTRATION TYPES
// ============================================================================

export interface PaymentOrchestrationContext {
  transaction_id: string;
  mode: PaymentMode;
  from_user_id: string;
  to_user_id: string;
  amount_eur: string;
  
  // State tracking
  current_step: PaymentStep;
  completed_steps: PaymentStep[];
  failed_step?: PaymentStep;
  error?: string;
  
  // Mode-specific data
  crypto_data?: {
    onchain_tx_hash?: string;
    confirmations?: number;
    offramp_status?: string;
  };
}

export type PaymentStep =
  | 'VALIDATE'
  | 'CREATE_LEDGER_ENTRIES'
  | 'LOCK_FUNDS'
  | 'EXECUTE_ONCHAIN'
  | 'AWAIT_CONFIRMATIONS'
  | 'INITIATE_OFFRAMP'
  | 'AWAIT_OFFRAMP'
  | 'CREDIT_RECIPIENT'
  | 'FINALIZE'
  | 'ROLLBACK';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface NetPosition {
  bank_id: string;
  net_eur: string;
  owes_to: Record<string, string>;  // bank_id -> amount
  owed_by: Record<string, string>;  // bank_id -> amount
}

export interface SettlementInstruction {
  from_bank: string;
  to_bank: string;
  amount_eur: string;
  currency: string;
  instruction_type: 'SEPA' | 'INSTANT' | 'INTERNAL';
  reference: string;
}
