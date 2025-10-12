# Kodu Setup Guide - Complete Implementation

## 🚀 Quick Start (5 Minutes)

This guide will get your Kodu payment system running with full EUR_INTERNAL payment functionality.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Thirdweb account (for crypto features)
- Git

---

## 🔧 Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize (~2 minutes)
4. Note your project URL and anon key

### 1.2 Apply Database Migrations

**Option A: Using Supabase Dashboard (Recommended for MVP)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/001_enhanced_schema.sql`
4. Paste and run
5. Copy contents of `supabase/migrations/002_payment_functions.sql`
6. Paste and run

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 1.3 Verify Database Setup

Run this query in SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: accounts, bank_movements, ledger_entries, 
-- onchain_events, reconciliations, transactions, users

-- Check company accounts created
SELECT * FROM accounts WHERE user_id IS NULL;

-- Should see 3 company accounts: COMPANY_EUR, COMPANY_CRYPTO, SETTLEMENT_RESERVE
```

---

## 🔑 Step 2: Environment Configuration

### 2.1 Create `.env` File

```bash
cd kodu
cp .env.example .env
```

### 2.2 Configure Environment Variables

Edit `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id

# Company Wallet (for CRYPTO_TO_FIAT mode)
VITE_COMPANY_WALLET_ADDRESS=0xYourCompanyWalletAddress

# Optional: Feature Flags
VITE_ENABLE_CRYPTO_MODE=true
VITE_FRONT_LIQUIDITY=true
```

**Where to find these:**

- **Supabase URL & Key**: Project Settings → API
- **Thirdweb Client ID**: [thirdweb.com/dashboard](https://thirdweb.com/dashboard) → Settings → API Keys
- **Company Wallet**: Your company's crypto wallet address (for receiving CRYPTO_TO_FIAT payments)

---

## 📦 Step 3: Install Dependencies

```bash
cd kodu
npm install
```

---

## 🧪 Step 4: Create Test Users & Add Funds

### 4.1 Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 4.2 Create Test Users

1. Sign up with email (e.g., alice@test.com)
2. Choose username (e.g., alice)
3. Wallet will be auto-created
4. Note the user ID from browser console or Supabase dashboard

Repeat for second user (e.g., bob@test.com)

### 4.3 Add Test Funds via SQL

Go to Supabase SQL Editor and run:

```sql
-- Add €100 to Alice
SELECT add_funds_to_user(
  '<alice-user-id>'::uuid,
  100.00,
  'Initial test funds'
);

-- Add €50 to Bob
SELECT add_funds_to_user(
  '<bob-user-id>'::uuid,
  50.00,
  'Initial test funds'
);

-- Verify balances
SELECT 
  u.username,
  a.balance,
  a.available_balance,
  a.currency
FROM accounts a
JOIN users u ON a.user_id = u.id
WHERE a.account_type = 'USER_EUR';
```

---

## ✅ Step 5: Test EUR_INTERNAL Payments

### 5.1 Test Payment Flow

1. **Login as Alice** (alice@test.com)
2. Navigate to **Send/Receive** tab
3. Click **Send** mode
4. Click **Search by Username**
5. Search for "bob"
6. Select Bob
7. Enter amount: **€10**
8. Add message: "Test payment"
9. Click **Send Payment**
10. Confirm

### 5.2 Verify Results

**In Alice's Account:**
- Balance should decrease by €10
- Transaction shows as "SETTLED"
- Instant update (no delay)

**In Bob's Account:**
- Balance should increase by €10
- Transaction appears in history
- Real-time notification

### 5.3 Verify in Database

```sql
-- Check transaction
SELECT 
  t.id,
  t.mode,
  t.status,
  t.amount_eur,
  fu.username as from_user,
  tu.username as to_user,
  t.created_at,
  t.settled_at
FROM transactions t
JOIN users fu ON t.from_user_id = fu.id
JOIN users tu ON t.to_user_id = tu.id
ORDER BY t.created_at DESC
LIMIT 1;

-- Check ledger entries (should be balanced)
SELECT 
  le.entry_type,
  le.amount,
  le.currency,
  le.status,
  u.username
FROM ledger_entries le
JOIN accounts a ON le.account_id = a.id
JOIN users u ON a.user_id = u.id
WHERE le.transaction_id = '<transaction-id-from-above>'
ORDER BY le.entry_type;

-- Should see:
-- CREDIT | 10.00 | EUR | SETTLED | bob
-- DEBIT  | 10.00 | EUR | SETTLED | alice
```

---

## 🎯 Step 6: Test Additional Features

### 6.1 Test QR Code (Receive)

1. Go to **Profile** tab
2. Scroll to "Receive Payments" section
3. QR code should display
4. Copy wallet address button should work

### 6.2 Test Balance Display

1. Go to **Home** tab
2. EUR balance should show prominently
3. Click "Show Crypto Balances" toggle
4. Should show "No crypto balances yet" (unless you've added some)
5. Click eye icon to hide/show amounts
6. Click refresh icon to reload balances

### 6.3 Test Transaction History

1. Go to **Activity** tab
2. Should see recent transactions
3. Each transaction shows:
   - Amount and recipient/sender
   - Payment mode (EUR_INTERNAL)
   - Status (SETTLED)
   - Timestamp

---

## 🔐 Step 7: Security Setup (Production)

### 7.1 Enable Row Level Security

Already enabled by migrations, but verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show 't' (true) for rowsecurity
```

### 7.2 Create Service Role (for backend operations)

If you plan to run backend services:

1. Go to Supabase → Settings → API
2. Copy **service_role** key (keep secret!)
3. Use this for server-side operations only

### 7.3 Configure CORS (if needed)

In Supabase → Settings → API:
- Add your production domain to allowed origins

---

## 🧩 Step 8: Optional Features

### 8.1 Enable CRYPTO_TO_FIAT Mode (Simulated)

**Note**: This requires blockchain infrastructure in production. For MVP, it's simulated.

1. Ensure `VITE_ENABLE_CRYPTO_MODE=true` in `.env`
2. Set `VITE_COMPANY_WALLET_ADDRESS` to your wallet
3. In payment flow, toggle "Use Crypto"
4. Transaction will be created with status `ONCHAIN_PENDING`
5. Manually simulate on-chain receipt:

```sql
-- Simulate on-chain transfer received
UPDATE transactions
SET 
  status = 'ONCHAIN_RECEIVED',
  onchain_tx_hash = '0xSIMULATED_TX_HASH',
  onchain_confirmations = 10,
  onchain_received_at = NOW(),
  events = events || jsonb_build_object(
    'time', NOW(),
    'type', 'onchain_received',
    'detail', 'Simulated on-chain confirmation'
  )
WHERE id = '<transaction-id>';

-- If fronting liquidity, credit recipient
SELECT credit_recipient_from_reserve('<transaction-id>'::uuid);

-- Or simulate off-ramp completion
SELECT complete_offramp_and_credit(
  '<transaction-id>'::uuid,
  1.00  -- EUR received
);
```

### 8.2 Add Settlement Reserve Funds

For CRYPTO_TO_FIAT with fronted liquidity:

```sql
-- Add €1000 to settlement reserve
UPDATE accounts
SET 
  balance = balance + 1000.00,
  available_balance = available_balance + 1000.00
WHERE account_type = 'SETTLEMENT_RESERVE'
  AND currency = 'EUR';
```

---

## 📊 Step 9: Monitoring & Admin

### 9.1 Check System Health

```sql
-- Total EUR in system
SELECT 
  SUM(balance) as total_eur,
  COUNT(*) as num_accounts
FROM accounts
WHERE currency = 'EUR';

-- Transaction volume
SELECT 
  mode,
  status,
  COUNT(*) as count,
  SUM(amount_eur) as total_volume
FROM transactions
GROUP BY mode, status;

-- Ledger balance check (should always be 0)
SELECT 
  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) as net_balance
FROM ledger_entries
WHERE status = 'SETTLED';
-- Should return 0.000000
```

### 9.2 Create Admin User

```sql
-- Add admin flag to user
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

UPDATE users
SET is_admin = TRUE
WHERE email = 'your-admin@email.com';
```

### 9.3 Monitor Failed Transactions

```sql
-- Check for failed transactions
SELECT 
  t.id,
  t.mode,
  t.status,
  t.amount_eur,
  t.created_at,
  t.events
FROM transactions t
WHERE t.status IN ('FAILED', 'FAILED_ONCHAIN', 'FAILED_OFFRAMP')
ORDER BY t.created_at DESC;
```

---

## 🐛 Troubleshooting

### Issue: "Insufficient balance" error

**Solution**:
```sql
-- Check user's actual balance
SELECT * FROM accounts 
WHERE user_id = '<user-id>' 
  AND account_type = 'USER_EUR';

-- Add funds if needed
SELECT add_funds_to_user('<user-id>'::uuid, 100.00, 'Admin credit');
```

### Issue: Transaction stuck in PENDING

**Solution**:
```sql
-- Check transaction details
SELECT * FROM transactions WHERE id = '<transaction-id>';

-- Check ledger entries
SELECT * FROM ledger_entries WHERE transaction_id = '<transaction-id>';

-- If EUR_INTERNAL, it should settle instantly. If stuck, check logs.
```

### Issue: Balances don't match ledger

**Solution**:
```sql
-- Audit user's balance
WITH ledger_sum AS (
  SELECT 
    a.user_id,
    SUM(CASE WHEN le.entry_type = 'CREDIT' THEN le.amount ELSE -le.amount END) as calculated_balance
  FROM ledger_entries le
  JOIN accounts a ON le.account_id = a.id
  WHERE a.account_type = 'USER_EUR'
    AND le.status = 'SETTLED'
  GROUP BY a.user_id
)
SELECT 
  u.username,
  a.balance as current_balance,
  ls.calculated_balance,
  (a.balance - ls.calculated_balance) as difference
FROM users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN ledger_sum ls ON ls.user_id = u.id
WHERE a.account_type = 'USER_EUR';

-- Difference should be 0 for all users
```

### Issue: Real-time updates not working

**Solution**:
1. Check Supabase Realtime is enabled (Project Settings → API → Realtime)
2. Check browser console for WebSocket errors
3. Verify RLS policies allow user to read their accounts
4. Try manual refresh button

---

## 🚀 Deployment Checklist

### Before Production:

- [ ] Change all default passwords/keys
- [ ] Enable Supabase backups
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Test with real money (small amounts!)
- [ ] Implement KYC (required for production)
- [ ] Get legal/compliance review
- [ ] Set up customer support system
- [ ] Create incident response plan
- [ ] Document all admin procedures
- [ ] Set up automated backups
- [ ] Configure alerting for failed transactions
- [ ] Test disaster recovery

### Production Environment Variables:

```env
# Production Supabase
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# Production Thirdweb
VITE_THIRDWEB_CLIENT_ID=your-prod-client-id

# Production Wallet
VITE_COMPANY_WALLET_ADDRESS=0xYourProductionWallet

# Feature Flags
VITE_ENABLE_CRYPTO_MODE=true
VITE_FRONT_LIQUIDITY=false  # Disable until off-ramp integrated
VITE_MAX_TRANSACTION_AMOUNT=1000
VITE_REQUIRE_KYC=true
```

---

## 📚 Additional Resources

- **Architecture**: See `KODU_ARCHITECTURE.md` for complete system design
- **API Reference**: See `src/services/paymentOrchestrator.ts` for all functions
- **Database Schema**: See `supabase/migrations/` for table definitions
- **Type Definitions**: See `src/types/database.ts` for TypeScript types

---

## 🎓 Next Steps

### Immediate (Working Now):
1. ✅ EUR_INTERNAL payments fully functional
2. ✅ Real-time balance updates
3. ✅ Transaction history
4. ✅ Double-entry ledger
5. ✅ QR code generation

### Short-term (Needs Infrastructure):
1. ⚠️ Blockchain monitoring for CRYPTO_TO_FIAT
2. ⚠️ Off-ramp partner integration
3. ⚠️ Bank API integration
4. ⚠️ Automated reconciliation

### Long-term (Production):
1. ❌ KYC/AML compliance
2. ❌ Multi-currency support
3. ❌ Advanced fraud detection
4. ❌ Mobile apps
5. ❌ International expansion

---

## 💬 Support

For issues or questions:
1. Check `KODU_ARCHITECTURE.md` for detailed explanations
2. Review SQL migration files for database structure
3. Examine TypeScript types for data models
4. Test with SQL queries directly in Supabase

**Remember**: EUR_INTERNAL payments work perfectly now. CRYPTO_TO_FIAT needs external infrastructure but the framework is ready!

---

**Last Updated**: October 12, 2025
**Version**: 1.0 MVP
**Status**: EUR_INTERNAL Fully Functional ✅
