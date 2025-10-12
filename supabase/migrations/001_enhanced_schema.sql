-- Enhanced Kodu Database Schema
-- Implements double-entry ledger, accounts, and payment orchestration

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE payment_mode AS ENUM (
  'EUR_INTERNAL',      -- P1, P2: Euro-to-euro internal book transfer
  'CRYPTO_TO_FIAT',    -- P3: User sends crypto to K, K converts and credits EUR
  'ONCHAIN_DIRECT'     -- Future: Direct wallet-to-wallet crypto (no K intermediary)
);

CREATE TYPE transaction_status AS ENUM (
  'PENDING',                -- Initial state
  'ONCHAIN_PENDING',        -- Waiting for blockchain confirmation
  'ONCHAIN_RECEIVED',       -- K received crypto on-chain
  'AWAITING_OFFRAMP',       -- Waiting for crypto->EUR conversion
  'OFFRAMP_COMPLETE',       -- EUR received in K's bank
  'CREDITED_TO_RECIPIENT',  -- Recipient EUR balance updated
  'SETTLED',                -- Fully settled (bank reconciliation complete)
  'FAILED',                 -- Transaction failed
  'FAILED_ONCHAIN',         -- On-chain transfer failed/reverted
  'FAILED_OFFRAMP'          -- Off-ramp conversion failed
);

CREATE TYPE ledger_entry_type AS ENUM ('DEBIT', 'CREDIT');

CREATE TYPE ledger_entry_status AS ENUM (
  'PENDING',
  'LOCKED',
  'SETTLED',
  'REVERSED'
);

CREATE TYPE account_type AS ENUM (
  'USER_EUR',           -- User's EUR balance
  'USER_CRYPTO',        -- User's crypto holdings (if tracked)
  'COMPANY_EUR',        -- K's EUR bank account (B3)
  'COMPANY_CRYPTO',     -- K's crypto wallet
  'SETTLEMENT_RESERVE'  -- K's float for fronting liquidity
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bank_id TEXT,              -- User's bank identifier (B1, B2, etc.)
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table (double-entry ledger accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),  -- NULL for company accounts
  account_type account_type NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',  -- EUR, USDC, etc.
  balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20, 6) NOT NULL DEFAULT 0,  -- balance minus pending
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, account_type, currency)
);

-- Create indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);

-- Transactions table (enhanced with payment modes)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id TEXT UNIQUE,        -- External reference/idempotency key
  
  -- Participants
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  
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
  
  -- Blockchain data
  onchain_tx_hash TEXT,
  onchain_confirmations INTEGER DEFAULT 0,
  
  -- Thirdweb integration
  thirdweb_transaction_id TEXT,
  
  -- Off-ramp data (for CRYPTO_TO_FIAT)
  offramp_partner TEXT,
  offramp_reference TEXT,
  offramp_eur_received DECIMAL(20, 6),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onchain_received_at TIMESTAMPTZ,
  offramp_completed_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Events log (audit trail)
  events JSONB DEFAULT '[]'::jsonb
);

-- Create indexes
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_mode ON transactions(mode);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_onchain_hash ON transactions(onchain_tx_hash);

-- Ledger entries table (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  
  -- Entry details
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL,
  entry_type ledger_entry_type NOT NULL,
  status ledger_entry_status NOT NULL DEFAULT 'PENDING',
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_ledger_transaction ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_status ON ledger_entries(status);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);

-- On-chain events table (blockchain monitoring)
CREATE TABLE IF NOT EXISTS onchain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  transaction_id UUID REFERENCES transactions(id),  -- Link to our transaction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX idx_onchain_tx_hash ON onchain_events(tx_hash);
CREATE INDEX idx_onchain_to_address ON onchain_events(to_address);
CREATE INDEX idx_onchain_processed ON onchain_events(processed);
CREATE INDEX idx_onchain_created_at ON onchain_events(created_at DESC);

-- Bank movements table (fiat settlement tracking)
CREATE TABLE IF NOT EXISTS bank_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_tx_id TEXT UNIQUE,    -- Bank's transaction ID
  transaction_id UUID REFERENCES transactions(id),
  
  -- Movement details
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  from_bank TEXT,            -- B1, B2, B3, etc.
  to_bank TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_bank_movements_transaction ON bank_movements(transaction_id);
CREATE INDEX idx_bank_movements_status ON bank_movements(status);

-- Reconciliations table (periodic settlement windows)
CREATE TABLE IF NOT EXISTS reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  
  -- Summary data
  total_transactions INTEGER DEFAULT 0,
  total_eur_volume DECIMAL(20, 6) DEFAULT 0,
  net_positions JSONB DEFAULT '{}'::jsonb,  -- Bank-to-bank net positions
  
  -- Settlement instructions
  settlement_instructions JSONB DEFAULT '[]'::jsonb,
  
  -- Details
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_reconciliations_period ON reconciliations(period_start, period_end);
CREATE INDEX idx_reconciliations_status ON reconciliations(status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_entries_updated_at BEFORE UPDATE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to add event to transaction events log
CREATE OR REPLACE FUNCTION add_transaction_event(
  p_transaction_id UUID,
  p_event_type TEXT,
  p_event_detail TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE transactions
  SET events = events || jsonb_build_object(
    'time', NOW(),
    'type', p_event_type,
    'detail', p_event_detail
  )
  WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create company accounts (K's accounts)
INSERT INTO accounts (account_type, currency, balance, available_balance)
VALUES 
  ('COMPANY_EUR', 'EUR', 0, 0),
  ('COMPANY_CRYPTO', 'USDC', 0, 0),
  ('SETTLEMENT_RESERVE', 'EUR', 0, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view their own accounts
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can view their transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    from_user_id::text = auth.uid()::text OR 
    to_user_id::text = auth.uid()::text
  );

-- Users can view their ledger entries
CREATE POLICY "Users can view own ledger entries" ON ledger_entries
  FOR SELECT USING (
    account_id IN (
      SELECT id FROM accounts WHERE user_id::text = auth.uid()::text
    )
  );

-- For MVP: Allow service role full access (backend operations)
-- In production, implement more granular policies

-- ============================================================================
-- VIEWS (for easier querying)
-- ============================================================================

-- View: User balances with all currencies
CREATE OR REPLACE VIEW user_balances AS
SELECT 
  u.id as user_id,
  u.username,
  u.wallet_address,
  a.currency,
  a.balance,
  a.available_balance,
  a.account_type
FROM users u
JOIN accounts a ON a.user_id = u.id
WHERE a.account_type = 'USER_EUR' OR a.account_type = 'USER_CRYPTO';

-- View: Transaction summary with user details
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  t.id,
  t.ref_id,
  t.mode,
  t.status,
  t.amount_eur,
  t.amount_token,
  t.token_symbol,
  t.message,
  t.onchain_tx_hash,
  t.created_at,
  t.settled_at,
  fu.username as from_username,
  fu.display_name as from_display_name,
  tu.username as to_username,
  tu.display_name as to_display_name
FROM transactions t
LEFT JOIN users fu ON t.from_user_id = fu.id
LEFT JOIN users tu ON t.to_user_id = tu.id;

-- ============================================================================
-- COMMENTS (documentation)
-- ============================================================================

COMMENT ON TABLE transactions IS 'Core transaction table supporting EUR_INTERNAL and CRYPTO_TO_FIAT payment modes';
COMMENT ON TABLE ledger_entries IS 'Double-entry ledger for all balance changes';
COMMENT ON TABLE accounts IS 'User and company accounts (EUR and crypto)';
COMMENT ON TABLE onchain_events IS 'Blockchain event monitoring and processing';
COMMENT ON TABLE reconciliations IS 'Periodic bank settlement reconciliation windows';
COMMENT ON COLUMN transactions.mode IS 'EUR_INTERNAL (P1/P2) or CRYPTO_TO_FIAT (P3)';
COMMENT ON COLUMN transactions.events IS 'Audit trail of transaction lifecycle events';
