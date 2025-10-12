-- Enhanced Kodu Database Schema
-- Complete implementation with EUR_INTERNAL and CRYPTO_TO_FIAT support
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS bank_movements CASCADE;
DROP TABLE IF EXISTS reconciliations CASCADE;
DROP TABLE IF EXISTS onchain_events CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS payment_mode CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS ledger_entry_type CASCADE;
DROP TYPE IF EXISTS ledger_entry_status CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS bank_account_type CASCADE;
DROP TYPE IF EXISTS bank_account_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE payment_mode AS ENUM (
  'EUR_INTERNAL',      -- P1, P2: Euro-to-euro internal book transfer
  'CRYPTO_TO_FIAT',    -- P3: User sends crypto to K, K converts and credits EUR
  'BANK_TRANSFER',     -- P4: Bank-to-bank transfer using connected bank accounts
  'ONCHAIN_DIRECT'     -- Future: Direct wallet-to-wallet crypto
);

CREATE TYPE transaction_status AS ENUM (
  'PENDING',
  'ONCHAIN_PENDING',
  'ONCHAIN_RECEIVED',
  'AWAITING_OFFRAMP',
  'OFFRAMP_COMPLETE',
  'CREDITED_TO_RECIPIENT',
  'SETTLED',
  'FAILED',
  'FAILED_ONCHAIN',
  'FAILED_OFFRAMP'
);

CREATE TYPE ledger_entry_type AS ENUM ('DEBIT', 'CREDIT');

CREATE TYPE ledger_entry_status AS ENUM (
  'PENDING',
  'LOCKED',
  'SETTLED',
  'REVERSED'
);

CREATE TYPE account_type AS ENUM (
  'USER_EUR',
  'USER_CRYPTO',
  'COMPANY_EUR',
  'COMPANY_CRYPTO',
  'SETTLEMENT_RESERVE'
);

CREATE TYPE bank_account_type AS ENUM (
  'CHECKING',
  'SAVINGS',
  'BUSINESS'
);

CREATE TYPE bank_account_status AS ENUM (
  'PENDING_VERIFICATION',
  'ACTIVE',
  'SUSPENDED',
  'CLOSED'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (enhanced)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bank_id TEXT,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (double-entry ledger accounts)
CREATE TABLE accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  account_type account_type NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_type, currency)
);

-- Bank accounts table (user's connected bank accounts)
CREATE TABLE bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type bank_account_type NOT NULL DEFAULT 'CHECKING',
  status bank_account_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  
  -- Bank details
  bank_name TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  iban TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_bic TEXT,
  
  -- Additional info
  currency TEXT NOT NULL DEFAULT 'EUR',
  country TEXT NOT NULL DEFAULT 'EU',
  is_primary BOOLEAN DEFAULT FALSE,
  nickname TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure at least one identifier is provided
  CONSTRAINT bank_account_identifier_check CHECK (
    iban IS NOT NULL OR 
    (account_number IS NOT NULL AND routing_number IS NOT NULL)
  )
);

-- Transactions table (enhanced with payment modes)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ref_id TEXT UNIQUE,
  
  -- Participants
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  
  -- Bank transfer references
  from_bank_account_id UUID REFERENCES bank_accounts(id),
  to_bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Amounts
  amount_eur DECIMAL(20, 6),
  amount_token DECIMAL(20, 6),
  token_symbol TEXT,
  token_contract TEXT,
  chain_id INTEGER,
  
  -- Payment details
  mode payment_mode NOT NULL,
  status transaction_status NOT NULL DEFAULT 'PENDING',
  message TEXT,
  
  -- Blockchain data (for compatibility)
  from_address TEXT,
  to_address TEXT,
  onchain_tx_hash TEXT,
  onchain_confirmations INTEGER DEFAULT 0,
  thirdweb_transaction_id TEXT,
  
  -- Off-ramp data
  offramp_partner TEXT,
  offramp_reference TEXT,
  offramp_eur_received DECIMAL(20, 6),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onchain_received_at TIMESTAMP WITH TIME ZONE,
  offramp_completed_at TIMESTAMP WITH TIME ZONE,
  credited_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  events JSONB DEFAULT '[]'::jsonb
);

-- Ledger entries table (double-entry bookkeeping)
CREATE TABLE ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL,
  entry_type ledger_entry_type NOT NULL,
  status ledger_entry_status NOT NULL DEFAULT 'PENDING',
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE
);

-- On-chain events table
CREATE TABLE onchain_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  token_contract TEXT NOT NULL,
  token_symbol TEXT,
  amount DECIMAL(20, 6) NOT NULL,
  chain_id INTEGER NOT NULL,
  confirmations INTEGER DEFAULT 0,
  block_number BIGINT,
  processed BOOLEAN DEFAULT FALSE,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Bank movements table
CREATE TABLE bank_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bank_tx_id TEXT UNIQUE,
  transaction_id UUID REFERENCES transactions(id),
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  from_bank TEXT,
  to_bank TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Reconciliations table
CREATE TABLE reconciliations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_transactions INTEGER DEFAULT 0,
  total_eur_volume DECIMAL(20, 6) DEFAULT 0,
  net_positions JSONB DEFAULT '{}'::jsonb,
  settlement_instructions JSONB DEFAULT '[]'::jsonb,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX idx_bank_accounts_is_primary ON bank_accounts(user_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_mode ON transactions(mode);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_onchain_hash ON transactions(onchain_tx_hash);

CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_status ON ledger_entries(status);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);

CREATE INDEX idx_onchain_tx_hash ON onchain_events(tx_hash);
CREATE INDEX idx_onchain_to_address ON onchain_events(to_address);
CREATE INDEX idx_onchain_processed ON onchain_events(processed);

CREATE INDEX idx_bank_movements_transaction ON bank_movements(transaction_id);
CREATE INDEX idx_reconciliations_period ON reconciliations(period_start, period_end);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at 
    BEFORE UPDATE ON bank_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_entries_updated_at 
    BEFORE UPDATE ON ledger_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to ensure user has EUR account
CREATE OR REPLACE FUNCTION ensure_user_eur_account(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id
  FROM accounts
  WHERE user_id = p_user_id
    AND account_type = 'USER_EUR'
    AND currency = 'EUR';
  
  IF v_account_id IS NULL THEN
    INSERT INTO accounts (user_id, account_type, currency, balance, available_balance)
    VALUES (p_user_id, 'USER_EUR', 'EUR', 0, 0)
    RETURNING id INTO v_account_id;
  END IF;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add funds to user (for testing)
CREATE OR REPLACE FUNCTION add_funds_to_user(
  p_user_id UUID,
  p_amount_eur DECIMAL,
  p_description TEXT DEFAULT 'Admin credit'
)
RETURNS VOID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  v_account_id := ensure_user_eur_account(p_user_id);
  
  UPDATE accounts
  SET 
    balance = balance + p_amount_eur,
    available_balance = available_balance + p_amount_eur,
    updated_at = NOW()
  WHERE id = v_account_id;
  
  INSERT INTO ledger_entries (
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description,
    settled_at
  )
  VALUES (
    v_account_id,
    p_amount_eur,
    'EUR',
    'CREDIT',
    'SETTLED',
    p_description,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- EUR_INTERNAL payment processing function
CREATE OR REPLACE FUNCTION process_eur_internal_payment(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount_eur DECIMAL,
  p_message TEXT DEFAULT NULL,
  p_ref_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_transaction_id UUID;
  v_from_account_id UUID;
  v_to_account_id UUID;
  v_from_balance DECIMAL;
  v_result JSON;
BEGIN
  IF p_amount_eur <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  v_from_account_id := ensure_user_eur_account(p_from_user_id);
  v_to_account_id := ensure_user_eur_account(p_to_user_id);
  
  SELECT available_balance INTO v_from_balance
  FROM accounts
  WHERE id = v_from_account_id
  FOR UPDATE;
  
  IF v_from_balance < p_amount_eur THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  INSERT INTO transactions (
    ref_id, from_user_id, to_user_id, from_account_id, to_account_id,
    amount_eur, mode, status, message,
    events
  )
  VALUES (
    COALESCE(p_ref_id, gen_random_uuid()::text),
    p_from_user_id, p_to_user_id, v_from_account_id, v_to_account_id,
    p_amount_eur, 'EUR_INTERNAL', 'PENDING', p_message,
    jsonb_build_array(jsonb_build_object('time', NOW(), 'type', 'created', 'detail', 'EUR_INTERNAL payment created'))
  )
  RETURNING id INTO v_transaction_id;
  
  INSERT INTO ledger_entries (transaction_id, account_id, amount, currency, entry_type, status, description)
  VALUES 
    (v_transaction_id, v_from_account_id, p_amount_eur, 'EUR', 'DEBIT', 'PENDING', 'Payment to ' || p_to_user_id::text),
    (v_transaction_id, v_to_account_id, p_amount_eur, 'EUR', 'CREDIT', 'PENDING', 'Payment from ' || p_from_user_id::text);
  
  UPDATE accounts SET balance = balance - p_amount_eur, available_balance = available_balance - p_amount_eur WHERE id = v_from_account_id;
  UPDATE accounts SET balance = balance + p_amount_eur, available_balance = available_balance + p_amount_eur WHERE id = v_to_account_id;
  
  UPDATE ledger_entries SET status = 'SETTLED', settled_at = NOW() WHERE transaction_id = v_transaction_id;
  UPDATE transactions SET status = 'SETTLED', settled_at = NOW() WHERE id = v_transaction_id;
  
  SELECT json_build_object('id', id, 'status', status, 'amount_eur', amount_eur) INTO v_result FROM transactions WHERE id = v_transaction_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- Temporarily permissive policies for development
CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all accounts operations" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all bank_accounts operations" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all transactions operations" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ledger operations" ON ledger_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all onchain operations" ON onchain_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all bank operations" ON bank_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all reconciliation operations" ON reconciliations FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create company accounts
INSERT INTO accounts (account_type, currency, balance, available_balance)
VALUES 
  ('COMPANY_EUR', 'EUR', 0, 0),
  ('COMPANY_CRYPTO', 'USDC', 0, 0),
  ('SETTLEMENT_RESERVE', 'EUR', 10000, 10000)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
