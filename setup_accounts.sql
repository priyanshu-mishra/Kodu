-- Setup Script for Kodu MVP
-- Run this in your Supabase SQL Editor to initialize accounts for existing users

-- ============================================================================
-- 1. CREATE EUR ACCOUNTS FOR ALL USERS
-- ============================================================================

-- This creates a EUR account for each user that doesn't have one yet
INSERT INTO accounts (user_id, account_type, currency, balance, available_balance, created_at, updated_at)
SELECT 
  u.id,
  'USER_EUR',
  'EUR',
  0.00, -- Starting balance
  0.00, -- Available balance
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a 
  WHERE a.user_id = u.id 
  AND a.account_type = 'USER_EUR'
);

-- ============================================================================
-- 2. ADD INITIAL BALANCE TO TEST ACCOUNTS (OPTIONAL)
-- ============================================================================

-- Add €100 to all users for testing
-- Comment this out if you don't want to add test balance
UPDATE accounts
SET 
  balance = 100.00,
  available_balance = 100.00,
  updated_at = NOW()
WHERE account_type = 'USER_EUR';

-- ============================================================================
-- 3. VERIFY SETUP
-- ============================================================================

-- Check all users and their EUR accounts
SELECT 
  u.username,
  u.email,
  u.display_name,
  a.currency,
  a.balance,
  a.available_balance,
  a.account_type
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.account_type = 'USER_EUR'
ORDER BY u.created_at DESC;

-- ============================================================================
-- 4. SPECIFIC USER SETUP (OPTIONAL)
-- ============================================================================

-- If you want to add balance to specific users only, use this instead:

-- Add €100 to user 'priyanshu'
-- UPDATE accounts
-- SET 
--   balance = 100.00,
--   available_balance = 100.00,
--   updated_at = NOW()
-- WHERE user_id = (SELECT id FROM users WHERE username = 'priyanshu')
-- AND account_type = 'USER_EUR';

-- Add €100 to user 'mishrap'
-- UPDATE accounts
-- SET 
--   balance = 100.00,
--   available_balance = 100.00,
--   updated_at = NOW()
-- WHERE user_id = (SELECT id FROM users WHERE username = 'mishrap')
-- AND account_type = 'USER_EUR';

-- ============================================================================
-- 5. CHECK TRANSACTION HISTORY (OPTIONAL)
-- ============================================================================

-- View all transactions
SELECT 
  t.id,
  fu.username as from_user,
  tu.username as to_user,
  t.amount_eur,
  t.message,
  t.status,
  t.created_at
FROM transactions t
LEFT JOIN users fu ON t.from_user_id = fu.id
LEFT JOIN users tu ON t.to_user_id = tu.id
ORDER BY t.created_at DESC
LIMIT 20;

-- ============================================================================
-- NOTES
-- ============================================================================

-- After running this script:
-- 1. All users will have EUR accounts
-- 2. (Optional) All users will have €100 starting balance
-- 3. You can now test sending payments between users
-- 4. Transactions will be recorded in the transactions table
-- 5. Ledger entries will track all balance changes

-- To reset balances to zero:
-- UPDATE accounts SET balance = 0.00, available_balance = 0.00 WHERE account_type = 'USER_EUR';

-- To delete all transactions (careful!):
-- DELETE FROM ledger_entries;
-- DELETE FROM transactions;
