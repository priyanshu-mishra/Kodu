# Quick Setup Guide: Bank Account Feature

## Step 1: Update Database Schema

Run the updated schema in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `sql/supabase-schema.sql`
4. Click **Run** to execute

This will create:
- `bank_accounts` table
- Updated `transactions` table with bank account references
- New enums for bank account types and statuses
- Proper indexes and RLS policies

## Step 2: Verify Installation

After running the schema, verify the tables exist:

```sql
-- Check if bank_accounts table exists
SELECT * FROM bank_accounts LIMIT 1;

-- Check if payment_mode enum includes BANK_TRANSFER
SELECT unnest(enum_range(NULL::payment_mode));
```

## Step 3: Test the Feature

### 3.1 Add Bank Accounts to Test Users

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Log in as a test user
3. Navigate to **Profile** tab
4. Scroll to **Bank Accounts** section
5. Click **Add Account**
6. Fill in test bank details:
   - Bank Name: "Test Bank"
   - Account Holder: Your name
   - IBAN: "DE89370400440532013000" (test IBAN)
   - Currency: EUR
   - Country: EU
7. Check "Set as primary account"
8. Click **Add Account**

### 3.2 Verify Bank Account in Database

```sql
-- Check your bank account was created
SELECT * FROM bank_accounts WHERE user_id = 'your-user-id';

-- Set account to ACTIVE status (for testing)
UPDATE bank_accounts 
SET status = 'ACTIVE', verified_at = NOW()
WHERE user_id = 'your-user-id';
```

### 3.3 Create Second Test User with Bank Account

1. Log out and create/login as another user
2. Repeat steps 3.1 and 3.2 for the second user
3. This will allow you to test bank transfers between users

### 3.4 Test Bank Transfer Payment

1. Log in as first user
2. Navigate to **Send** tab
3. Search for second user
4. Select second user
5. In payment method selector, you should see:
   - ✅ Crypto Payment (always available)
   - ✅ EUR Balance (always available)
   - ✅ Bank Transfer (enabled because both users have bank accounts)
6. Select **Bank Transfer**
7. Choose your bank account from dropdown
8. Enter amount (e.g., €50)
9. Add message (optional)
10. Click **Continue**
11. Confirm payment
12. Wait 3 seconds for simulated processing
13. Check transaction history - status should be SETTLED

## Step 4: Verify Transaction

```sql
-- Check the transaction was created
SELECT 
  t.*,
  u1.username as from_user,
  u2.username as to_user,
  ba1.bank_name as from_bank,
  ba2.bank_name as to_bank
FROM transactions t
LEFT JOIN users u1 ON t.from_user_id = u1.id
LEFT JOIN users u2 ON t.to_user_id = u2.id
LEFT JOIN bank_accounts ba1 ON t.from_bank_account_id = ba1.id
LEFT JOIN bank_accounts ba2 ON t.to_bank_account_id = ba2.id
WHERE t.mode = 'BANK_TRANSFER'
ORDER BY t.created_at DESC
LIMIT 5;

-- Check bank movement record
SELECT * FROM bank_movements 
WHERE transaction_id IN (
  SELECT id FROM transactions WHERE mode = 'BANK_TRANSFER'
)
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue 1: Bank Transfer Option Not Available

**Cause**: One or both users don't have active bank accounts

**Solution**:
```sql
-- Check both users have active bank accounts
SELECT user_id, bank_name, status 
FROM bank_accounts 
WHERE user_id IN ('user1-id', 'user2-id');

-- Activate accounts if needed
UPDATE bank_accounts 
SET status = 'ACTIVE', verified_at = NOW()
WHERE status = 'PENDING_VERIFICATION';
```

### Issue 2: "Bank account IDs required" Error

**Cause**: Bank account not properly selected

**Solution**:
- Ensure you selected a bank account from the dropdown
- Refresh the page and try again
- Check browser console for errors

### Issue 3: Transaction Stuck in PENDING

**Cause**: Simulated completion didn't trigger

**Solution**:
```sql
-- Manually complete the transaction
UPDATE transactions 
SET status = 'SETTLED', settled_at = NOW()
WHERE id = 'transaction-id' AND mode = 'BANK_TRANSFER';

UPDATE bank_movements
SET status = 'completed', completed_at = NOW()
WHERE transaction_id = 'transaction-id';
```

## Testing Checklist

- [ ] Database schema updated successfully
- [ ] Bank accounts table created
- [ ] Can add bank account via UI
- [ ] Bank account appears in profile
- [ ] Can set account as primary
- [ ] Can delete bank account
- [ ] Two test users have active bank accounts
- [ ] Bank transfer option appears when both users have accounts
- [ ] Can select bank account from dropdown
- [ ] Can send bank transfer payment
- [ ] Transaction completes after 3 seconds
- [ ] Transaction appears in history with SETTLED status
- [ ] Bank movement record created

## Next Steps

Once basic testing is complete:

1. **Add More Test Users**: Create multiple users with different bank account configurations
2. **Test Edge Cases**: 
   - User with no bank account
   - User with multiple bank accounts
   - Switching primary account
3. **Test All Payment Methods**: Verify crypto and EUR internal payments still work
4. **Review Transaction History**: Check all payment types display correctly
5. **Production Planning**: Review `BANK_ACCOUNT_FEATURE.md` for production requirements

## Quick SQL Snippets

### Create Test Bank Accounts
```sql
-- Add bank account for user (replace user_id)
INSERT INTO bank_accounts (
  user_id, 
  bank_name, 
  account_holder_name, 
  iban, 
  account_type, 
  status, 
  is_primary,
  verified_at
) VALUES (
  'your-user-id',
  'Test Bank',
  'Test User',
  'DE89370400440532013000',
  'CHECKING',
  'ACTIVE',
  true,
  NOW()
);
```

### View All Bank Transfers
```sql
SELECT 
  t.id,
  t.amount_eur,
  t.status,
  t.created_at,
  u1.username as sender,
  u2.username as recipient,
  ba1.bank_name as from_bank,
  ba2.bank_name as to_bank
FROM transactions t
JOIN users u1 ON t.from_user_id = u1.id
JOIN users u2 ON t.to_user_id = u2.id
LEFT JOIN bank_accounts ba1 ON t.from_bank_account_id = ba1.id
LEFT JOIN bank_accounts ba2 ON t.to_bank_account_id = ba2.id
WHERE t.mode = 'BANK_TRANSFER'
ORDER BY t.created_at DESC;
```

### Reset Test Data
```sql
-- Delete all bank transfers (be careful!)
DELETE FROM bank_movements WHERE transaction_id IN (
  SELECT id FROM transactions WHERE mode = 'BANK_TRANSFER'
);
DELETE FROM transactions WHERE mode = 'BANK_TRANSFER';

-- Delete all bank accounts (be careful!)
DELETE FROM bank_accounts;
```

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify RLS policies are not blocking operations
4. Review the comprehensive documentation in `BANK_ACCOUNT_FEATURE.md`
