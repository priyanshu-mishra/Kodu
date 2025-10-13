# Bank Account & Transaction Implementation Plan

## Current Status Analysis

### ✅ What's Working:
1. **Bank accounts are properly linked to user IDs** - Verified in database
2. **Bank account CRUD operations** - Create, Read, Update, Delete all working
3. **Payment method selection** - UI allows selecting EUR internal or bank transfer
4. **Bank account IDs are captured** - `fromBankAccountId` and `toBankAccountId` are in payment data

### ❌ What's Missing:
1. **Transaction creation doesn't use bank account IDs** - Only crypto transactions are implemented
2. **EUR internal payments not implemented** - No logic to handle fiat transfers
3. **Bank transfer payments not implemented** - No logic to create bank transfer transactions
4. **Account balance management** - No EUR account creation or balance tracking

## Database Schema (Already Exists)

```sql
-- Users have EUR accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  account_type account_type NOT NULL,  -- 'USER_EUR', 'USER_CRYPTO', etc.
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20, 6) NOT NULL DEFAULT 0
);

-- Transactions support multiple payment modes
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_account_id UUID REFERENCES accounts(id),      -- EUR account
  to_account_id UUID REFERENCES accounts(id),        -- EUR account
  from_bank_account_id UUID REFERENCES bank_accounts(id),  -- Bank account
  to_bank_account_id UUID REFERENCES bank_accounts(id),    -- Bank account
  amount_eur DECIMAL(20, 6),
  mode payment_mode NOT NULL,  -- 'EUR_INTERNAL', 'BANK_TRANSFER', 'CRYPTO_TO_FIAT'
  status transaction_status NOT NULL
);

-- Double-entry ledger
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  account_id UUID REFERENCES accounts(id),
  amount DECIMAL(20, 6) NOT NULL,
  entry_type ledger_entry_type NOT NULL,  -- 'DEBIT' or 'CREDIT'
  status ledger_entry_status NOT NULL
);
```

## Implementation Steps

### Step 1: Create EUR Account Service
**File**: `src/services/eurAccountService.ts`

Functions needed:
- `getOrCreateUserEurAccount(userId)` - Get or create EUR account
- `getUserEurBalance(userId)` - Get current balance
- `hasS

ufficientBalance(userId, amount)` - Check if user can pay

### Step 2: Create Transaction Service
**File**: `src/services/transactionService.ts`

Functions needed:
- `createEurInternalTransaction(fromUserId, toUserId, amount, message)` - P2P EUR transfer
- `createBankTransferTransaction(fromUserId, toUserId, fromBankId, toBankId, amount, message)` - Bank transfer
- `createCryptoTransaction(...)` - Already exists in supabase.ts

### Step 3: Create Unified Payment Confirm Component
**File**: `src/components/payments/UnifiedPaymentConfirm.tsx`

This component should:
- Handle crypto payments (existing logic)
- Handle EUR internal payments (new)
- Handle bank transfers (new)
- Show appropriate UI for each payment type

### Step 4: Update App.tsx
Replace `PaymentConfirm` with `UnifiedPaymentConfirm` to handle all payment types.

### Step 5: Create Ledger Service (Optional but Recommended)
**File**: `src/services/ledgerService.ts`

For proper double-entry bookkeeping:
- `createLedgerEntries(transactionId, fromAccountId, toAccountId, amount)` - Create debit/credit entries
- `settleLedgerEntries(transactionId)` - Mark entries as settled

## Payment Flow Examples

### EUR Internal Payment (P2P)
```
1. User A sends €50 to User B
2. Check User A has EUR account with sufficient balance
3. Create transaction with mode='EUR_INTERNAL'
4. Create ledger entries:
   - DEBIT User A's EUR account: -€50
   - CREDIT User B's EUR account: +€50
5. Update account balances
6. Mark transaction as SETTLED
```

### Bank Transfer Payment
```
1. User A sends €100 to User B via bank transfer
2. Get User A's selected bank account
3. Get User B's selected bank account
4. Create transaction with mode='BANK_TRANSFER'
5. Link bank account IDs: from_bank_account_id, to_bank_account_id
6. Status: PENDING (waiting for bank processing)
7. Later: Update to SETTLED when bank confirms
```

### Crypto to Fiat Payment
```
1. User A sends USDC to User B (who receives EUR)
2. Create transaction with mode='CRYPTO_TO_FIAT'
3. User A sends crypto on-chain
4. System converts to EUR (off-ramp)
5. Credit User B's EUR account
6. Mark as SETTLED
```

## Quick Implementation Priority

### Phase 1: EUR Internal Payments (Highest Priority)
- ✅ Create `eurAccountService.ts`
- ✅ Update transaction creation to support EUR mode
- ✅ Create `UnifiedPaymentConfirm.tsx`
- ✅ Test P2P EUR transfers

### Phase 2: Bank Transfer Support
- ✅ Update transaction creation to link bank accounts
- ✅ Add bank transfer confirmation UI
- ✅ Test bank transfer flow

### Phase 3: Balance Display
- ✅ Show EUR balance in `EnhancedBalanceDisplay`
- ✅ Show available balance vs. total balance
- ✅ Add "Add Funds" button

## Files to Create/Modify

### New Files:
1. `src/services/eurAccountService.ts` - EUR account management
2. `src/services/transactionService.ts` - Unified transaction creation
3. `src/services/ledgerService.ts` - Double-entry bookkeeping
4. `src/components/payments/UnifiedPaymentConfirm.tsx` - Handle all payment types

### Files to Modify:
1. `src/App.tsx` - Use UnifiedPaymentConfirm instead of PaymentConfirm
2. `src/components/payments/EnhancedBalanceDisplay.tsx` - Show EUR balance
3. `src/utils/supabase.ts` - Add EUR account queries

## Testing Checklist

### EUR Internal Payment:
- [ ] Create EUR accounts for test users
- [ ] Add initial balance to accounts
- [ ] Send EUR payment between users
- [ ] Verify balances updated correctly
- [ ] Check transaction appears in history
- [ ] Verify ledger entries created

### Bank Transfer:
- [ ] Add bank accounts for both users
- [ ] Select bank accounts in payment flow
- [ ] Create bank transfer transaction
- [ ] Verify bank account IDs are saved
- [ ] Check transaction shows bank details

### Crypto Payment:
- [ ] Existing crypto flow still works
- [ ] Transaction creation unchanged
- [ ] On-chain transactions work

## Next Steps

1. **Run this command to create EUR accounts for existing users**:
```sql
-- Run in Supabase SQL Editor
INSERT INTO accounts (user_id, account_type, currency, balance, available_balance)
SELECT id, 'USER_EUR', 'EUR', 100.00, 100.00
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM accounts 
  WHERE accounts.user_id = users.id 
  AND accounts.account_type = 'USER_EUR'
);
```

2. **I'll create the necessary service files**

3. **I'll create the UnifiedPaymentConfirm component**

4. **We'll test the full flow**

Would you like me to proceed with the implementation?
