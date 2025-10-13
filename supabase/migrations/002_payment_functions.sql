-- Payment Processing Functions
-- Implements atomic EUR_INTERNAL and CRYPTO_TO_FIAT payment flows

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to ensure user has EUR account
CREATE OR REPLACE FUNCTION ensure_user_eur_account(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Try to get existing account
  SELECT id INTO v_account_id
  FROM accounts
  WHERE user_id = p_user_id
    AND account_type = 'USER_EUR'
    AND currency = 'EUR';
  
  -- Create if doesn't exist
  IF v_account_id IS NULL THEN
    INSERT INTO accounts (user_id, account_type, currency, balance, available_balance)
    VALUES (p_user_id, 'USER_EUR', 'EUR', 0, 0)
    RETURNING id INTO v_account_id;
  END IF;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get company EUR account
CREATE OR REPLACE FUNCTION get_company_eur_account()
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id
  FROM accounts
  WHERE account_type = 'COMPANY_EUR'
    AND currency = 'EUR'
  LIMIT 1;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Company EUR account not found';
  END IF;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get settlement reserve account
CREATE OR REPLACE FUNCTION get_settlement_reserve_account()
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id
  FROM accounts
  WHERE account_type = 'SETTLEMENT_RESERVE'
    AND currency = 'EUR'
  LIMIT 1;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Settlement reserve account not found';
  END IF;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- EUR_INTERNAL PAYMENT (P1, P2)
-- ============================================================================

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
  -- Validate amount
  IF p_amount_eur <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Ensure both users have EUR accounts
  v_from_account_id := ensure_user_eur_account(p_from_user_id);
  v_to_account_id := ensure_user_eur_account(p_to_user_id);
  
  -- Check sender balance
  SELECT available_balance INTO v_from_balance
  FROM accounts
  WHERE id = v_from_account_id
  FOR UPDATE;  -- Lock the row
  
  IF v_from_balance < p_amount_eur THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', v_from_balance, p_amount_eur;
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (
    ref_id,
    from_user_id,
    to_user_id,
    from_account_id,
    to_account_id,
    amount_eur,
    mode,
    status,
    message,
    events
  )
  VALUES (
    COALESCE(p_ref_id, gen_random_uuid()::text),
    p_from_user_id,
    p_to_user_id,
    v_from_account_id,
    v_to_account_id,
    p_amount_eur,
    'EUR_INTERNAL',
    'PENDING',
    p_message,
    jsonb_build_array(
      jsonb_build_object(
        'time', NOW(),
        'type', 'created',
        'detail', 'EUR_INTERNAL payment created'
      )
    )
  )
  RETURNING id INTO v_transaction_id;
  
  -- Create ledger entries (double-entry bookkeeping)
  -- Debit sender
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    v_transaction_id,
    v_from_account_id,
    p_amount_eur,
    'EUR',
    'DEBIT',
    'PENDING',
    'Payment to ' || p_to_user_id::text
  );
  
  -- Credit recipient
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    v_transaction_id,
    v_to_account_id,
    p_amount_eur,
    'EUR',
    'CREDIT',
    'PENDING',
    'Payment from ' || p_from_user_id::text
  );
  
  -- Update account balances atomically
  UPDATE accounts
  SET 
    balance = balance - p_amount_eur,
    available_balance = available_balance - p_amount_eur,
    updated_at = NOW()
  WHERE id = v_from_account_id;
  
  UPDATE accounts
  SET 
    balance = balance + p_amount_eur,
    available_balance = available_balance + p_amount_eur,
    updated_at = NOW()
  WHERE id = v_to_account_id;
  
  -- Mark ledger entries as settled
  UPDATE ledger_entries
  SET status = 'SETTLED', settled_at = NOW()
  WHERE transaction_id = v_transaction_id;
  
  -- Mark transaction as settled
  UPDATE transactions
  SET 
    status = 'SETTLED',
    settled_at = NOW(),
    events = events || jsonb_build_object(
      'time', NOW(),
      'type', 'settled',
      'detail', 'EUR_INTERNAL payment settled instantly'
    )
  WHERE id = v_transaction_id;
  
  -- Return transaction details
  SELECT json_build_object(
    'id', t.id,
    'ref_id', t.ref_id,
    'from_user_id', t.from_user_id,
    'to_user_id', t.to_user_id,
    'amount_eur', t.amount_eur,
    'mode', t.mode,
    'status', t.status,
    'message', t.message,
    'created_at', t.created_at,
    'settled_at', t.settled_at
  ) INTO v_result
  FROM transactions t
  WHERE t.id = v_transaction_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRYPTO_TO_FIAT HELPERS
-- ============================================================================

-- Credit recipient from settlement reserve (fronting liquidity)
CREATE OR REPLACE FUNCTION credit_recipient_from_reserve(
  p_transaction_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_to_account_id UUID;
  v_reserve_account_id UUID;
  v_amount_eur DECIMAL;
BEGIN
  -- Get transaction details
  SELECT to_account_id, amount_eur
  INTO v_to_account_id, v_amount_eur
  FROM transactions
  WHERE id = p_transaction_id;
  
  IF v_to_account_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or missing recipient account';
  END IF;
  
  -- Ensure recipient has EUR account
  IF v_to_account_id IS NULL THEN
    SELECT to_user_id INTO v_to_account_id FROM transactions WHERE id = p_transaction_id;
    v_to_account_id := ensure_user_eur_account(v_to_account_id);
    
    UPDATE transactions
    SET to_account_id = v_to_account_id
    WHERE id = p_transaction_id;
  END IF;
  
  -- Get reserve account
  v_reserve_account_id := get_settlement_reserve_account();
  
  -- Create ledger entries
  -- Debit reserve
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    p_transaction_id,
    v_reserve_account_id,
    v_amount_eur,
    'EUR',
    'DEBIT',
    'SETTLED',
    'Fronted liquidity for CRYPTO_TO_FIAT payment'
  );
  
  -- Credit recipient
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    p_transaction_id,
    v_to_account_id,
    v_amount_eur,
    'EUR',
    'CREDIT',
    'SETTLED',
    'CRYPTO_TO_FIAT payment (fronted from reserve)'
  );
  
  -- Update balances
  UPDATE accounts
  SET 
    balance = balance - v_amount_eur,
    available_balance = available_balance - v_amount_eur,
    updated_at = NOW()
  WHERE id = v_reserve_account_id;
  
  UPDATE accounts
  SET 
    balance = balance + v_amount_eur,
    available_balance = available_balance + v_amount_eur,
    updated_at = NOW()
  WHERE id = v_to_account_id;
  
  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'CREDITED_TO_RECIPIENT',
    credited_at = NOW(),
    events = events || jsonb_build_object(
      'time', NOW(),
      'type', 'credited',
      'detail', 'Recipient credited from settlement reserve (fronted liquidity)'
    )
  WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Complete off-ramp and credit recipient
CREATE OR REPLACE FUNCTION complete_offramp_and_credit(
  p_transaction_id UUID,
  p_eur_received DECIMAL
)
RETURNS VOID AS $$
DECLARE
  v_to_account_id UUID;
  v_company_account_id UUID;
  v_amount_eur DECIMAL;
BEGIN
  -- Get transaction details
  SELECT to_account_id, amount_eur
  INTO v_to_account_id, v_amount_eur
  FROM transactions
  WHERE id = p_transaction_id;
  
  IF v_to_account_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or missing recipient account';
  END IF;
  
  -- Get company EUR account
  v_company_account_id := get_company_eur_account();
  
  -- Update transaction with off-ramp details
  UPDATE transactions
  SET 
    status = 'OFFRAMP_COMPLETE',
    offramp_eur_received = p_eur_received,
    offramp_completed_at = NOW(),
    events = events || jsonb_build_object(
      'time', NOW(),
      'type', 'offramp_complete',
      'detail', format('Off-ramp completed, EUR received: %s', p_eur_received)
    )
  WHERE id = p_transaction_id;
  
  -- Create ledger entries for crediting recipient
  -- Debit company account
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    p_transaction_id,
    v_company_account_id,
    p_eur_received,
    'EUR',
    'DEBIT',
    'SETTLED',
    'Payment to recipient from off-ramp proceeds'
  );
  
  -- Credit recipient
  INSERT INTO ledger_entries (
    transaction_id,
    account_id,
    amount,
    currency,
    entry_type,
    status,
    description
  )
  VALUES (
    p_transaction_id,
    v_to_account_id,
    p_eur_received,
    'EUR',
    'CREDIT',
    'SETTLED',
    'CRYPTO_TO_FIAT payment from off-ramp'
  );
  
  -- Update balances
  UPDATE accounts
  SET 
    balance = balance - p_eur_received,
    available_balance = available_balance - p_eur_received,
    updated_at = NOW()
  WHERE id = v_company_account_id;
  
  UPDATE accounts
  SET 
    balance = balance + p_eur_received,
    available_balance = available_balance + p_eur_received,
    updated_at = NOW()
  WHERE id = v_to_account_id;
  
  -- Update transaction status
  UPDATE transactions
  SET 
    status = 'CREDITED_TO_RECIPIENT',
    credited_at = NOW(),
    events = events || jsonb_build_object(
      'time', NOW(),
      'type', 'credited',
      'detail', 'Recipient credited from off-ramp proceeds'
    )
  WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Get user's total EUR balance
CREATE OR REPLACE FUNCTION get_user_eur_balance(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'balance', COALESCE(balance, 0),
    'available_balance', COALESCE(available_balance, 0),
    'currency', 'EUR'
  ) INTO v_result
  FROM accounts
  WHERE user_id = p_user_id
    AND account_type = 'USER_EUR'
    AND currency = 'EUR';
  
  IF v_result IS NULL THEN
    v_result := json_build_object(
      'balance', 0,
      'available_balance', 0,
      'currency', 'EUR'
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Add funds to user account (for testing/admin)
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
  
  -- Create ledger entry for audit
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
