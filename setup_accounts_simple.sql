-- Simple Setup Script for Kodu MVP
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. CREATE EUR ACCOUNTS FOR ALL USERS
-- ============================================================================

INSERT INTO accounts (user_id, account_type, currency, balance, available_balance, created_at, updated_at)
SELECT 
  u.id,
  'USER_EUR',
  'EUR',
  0.00,
  0.00,
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_id = u.id 
  AND a.account_type = 'USER_EUR'
);

-- ============================================================================
-- 2. ADD €100 TEST BALANCE TO ALL USERS
-- ============================================================================

UPDATE accounts
SET 
  balance = 100.00,
  available_balance = 100.00,
  updated_at = NOW()
WHERE account_type = 'USER_EUR';

-- ============================================================================
-- 3. VERIFY SETUP
-- ============================================================================

SELECT 
  u.username,
  u.email,
  u.display_name,
  a.currency,
  a.balance,
  a.available_balance
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.account_type = 'USER_EUR'
ORDER BY u.created_at DESC;
