# 🚀 Kodu Quick Demo Guide

## 5-Minute Setup & Demo

### Step 1: Apply Database Schema (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Navigate to **SQL Editor**
3. Copy entire contents of `sql/supabase-schema.sql`
4. Paste and click **Run**
5. Wait for "Success" message

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Should see: accounts, bank_movements, ledger_entries, 
-- onchain_events, reconciliations, transactions, users
```

---

### Step 2: Start Development Server (30 seconds)

```bash
cd kodu
npm run dev
```

Open: http://localhost:5173

---

### Step 3: Create Two Test Users (1 minute)

**User 1 (Alice):**
1. Sign up with: `alice@test.com`
2. Choose username: `alice`
3. Wallet auto-created ✅

**User 2 (Bob):**
1. Open incognito/private window
2. Sign up with: `bob@test.com`
3. Choose username: `bob`
4. Wallet auto-created ✅

---

### Step 4: Add Test Funds (1 minute)

In Supabase SQL Editor:

```sql
-- Get user IDs first
SELECT id, username, email FROM users;

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
  a.available_balance
FROM accounts a
JOIN users u ON a.user_id = u.id
WHERE a.account_type = 'USER_EUR';
```

---

### Step 5: Demo Features (5 minutes)

#### 🌓 **Theme Toggle**
1. Click **Moon icon** in header
2. Watch smooth transition to dark mode
3. Click **Sun icon** to return to light mode

#### 💶 **Payment Mode Toggle**
1. Click **EUR badge** in header
2. Changes to **Crypto badge** (purple)
3. Click again to switch back

#### 💰 **Enhanced Balance Display**
1. Go to **Home** tab
2. See EUR balance prominently displayed
3. Click **eye icon** to hide/show amounts
4. Click **refresh icon** to reload
5. Click **Show Crypto Balances** to expand

#### 💸 **Send EUR Payment**
**As Alice:**
1. Go to **Send/Receive** tab
2. Ensure **Send** mode selected
3. Click **Search by Username**
4. Search for "bob"
5. Select Bob from results
6. Enter amount: **€10**
7. Add message: "Coffee money ☕"
8. Click **Send Payment**
9. Click **Confirm**

**Watch:**
- Alice's balance: €100 → €90 (instant!)
- Transaction shows as **SETTLED**

**As Bob (in other window):**
- Balance updates: €50 → €60 (real-time!)
- New transaction appears in history

#### 📊 **Transaction History**
1. Go to **Activity** tab
2. See all transactions
3. Click transaction to view details
4. Shows: amount, status, timestamp, mode

#### 👤 **Profile & QR Code**
1. Go to **Profile** tab
2. See user info
3. Scroll to "Receive Payments"
4. QR code displayed
5. Click **Copy Address** button

---

## 🎨 Demo Highlights

### Visual Features to Show

1. **Smooth Animations**
   - Tab changes fade in
   - Dropdowns slide up
   - Buttons scale on hover
   - Theme transitions smoothly

2. **Dark Mode**
   - All components adapt
   - Proper contrast maintained
   - Gradient effects preserved
   - Shadows enhanced

3. **Payment Mode Toggle**
   - Blue badge for EUR mode
   - Purple badge for Crypto mode
   - Visual feedback on click
   - Persists across sessions

4. **Responsive Design**
   - Resize browser window
   - Bottom nav stays accessible
   - Cards adapt to width
   - Text remains readable

---

## 🧪 Test Scenarios

### Scenario 1: Basic Payment Flow
```
Alice (€100) → Bob (€50)
Send €10
Result: Alice €90, Bob €60
Time: < 100ms
```

### Scenario 2: Multiple Payments
```
Alice → Bob: €10
Bob → Alice: €5
Alice → Bob: €3
Final: Alice €92, Bob €58
```

### Scenario 3: Insufficient Balance
```
Alice tries to send €200 (has €100)
Result: Error message
Balance unchanged
```

### Scenario 4: Theme Switching
```
Light mode → Dark mode → Light mode
All components adapt smoothly
Preference saved to localStorage
```

---

## 🎯 Key Points to Highlight

### Technical Excellence
- ✅ **Double-Entry Ledger**: Every transaction balanced
- ✅ **Atomic Operations**: All-or-nothing transactions
- ✅ **Real-Time Updates**: Supabase subscriptions
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **SQL Functions**: Business logic in database

### User Experience
- ✅ **Instant Settlements**: < 100ms for EUR payments
- ✅ **Modern UI**: Smooth animations, gradients
- ✅ **Dark Mode**: Complete theme support
- ✅ **Responsive**: Works on all devices
- ✅ **Intuitive**: Clear navigation, obvious actions

### Architecture
- ✅ **Context API**: Global state management
- ✅ **Component Composition**: Reusable components
- ✅ **Separation of Concerns**: Clear file structure
- ✅ **Scalable**: Ready for production features

---

## 📊 Database Verification

### Check Ledger Balance (Should Always Be 0)
```sql
SELECT 
  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) as net_balance
FROM ledger_entries
WHERE status = 'SETTLED';
-- Result: 0.000000 ✅
```

### View All Transactions
```sql
SELECT 
  t.id,
  fu.username as from_user,
  tu.username as to_user,
  t.amount_eur,
  t.mode,
  t.status,
  t.created_at
FROM transactions t
JOIN users fu ON t.from_user_id = fu.id
JOIN users tu ON t.to_user_id = tu.id
ORDER BY t.created_at DESC;
```

### Check User Balances
```sql
SELECT 
  u.username,
  a.balance,
  a.available_balance,
  a.currency
FROM accounts a
JOIN users u ON a.user_id = u.id
WHERE a.account_type = 'USER_EUR'
ORDER BY u.username;
```

---

## 🎬 Demo Script

### Introduction (30 seconds)
> "This is Kodu, a modern payment application that makes peer-to-peer EUR payments instant and simple. Users always think in EUR, with optional crypto settlement. Let me show you the key features."

### Theme Toggle (30 seconds)
> "First, we have full light and dark mode support. Watch how smoothly everything transitions..." [Click theme toggle] "All components adapt automatically with proper contrast and readability."

### Payment Mode (30 seconds)
> "Users can toggle between EUR mode for instant transfers, or Crypto mode for blockchain settlement. This is a global setting that affects all payment operations." [Click payment mode toggle]

### Balance Display (1 minute)
> "The balance display shows EUR prominently. Users can hide amounts for privacy, refresh manually, and optionally view crypto balances. Everything updates in real-time via WebSocket."

### Send Payment (2 minutes)
> "Let's send a payment. Alice has €100, Bob has €50. Alice searches for Bob, enters €10, adds a message, and sends. Watch..." [Execute payment] "Instant! Alice now has €90, Bob has €60. The transaction settled in under 100 milliseconds."

### Transaction History (1 minute)
> "All transactions are logged with complete details: amount, status, timestamp, payment mode. Users can see their full history with real-time updates."

### Technical Deep Dive (1 minute)
> "Behind the scenes, we're using a double-entry ledger system. Every transaction creates balanced debit and credit entries. The database uses atomic operations to ensure consistency. Let me show you..." [Show SQL query]

### Conclusion (30 seconds)
> "Kodu combines modern UX with solid financial architecture. EUR payments work perfectly now, with a framework ready for crypto integration. The code is production-ready, type-safe, and fully documented."

---

## 🐛 Troubleshooting

### Issue: "Insufficient balance" error
**Solution:**
```sql
SELECT add_funds_to_user('<user-id>'::uuid, 100.00, 'Top up');
```

### Issue: Balance not updating
**Solution:**
1. Check Supabase Realtime is enabled
2. Refresh page
3. Check browser console for errors

### Issue: Transaction stuck in PENDING
**Solution:**
```sql
-- Check transaction
SELECT * FROM transactions WHERE id = '<tx-id>';

-- Check ledger entries
SELECT * FROM ledger_entries WHERE transaction_id = '<tx-id>';

-- Should auto-settle for EUR_INTERNAL
```

### Issue: Dark mode not working
**Solution:**
1. Check `tailwind.config.js` has `darkMode: 'class'`
2. Clear browser cache
3. Check localStorage for 'kodu-theme'

---

## 📸 Screenshots to Take

1. **Light Mode Home** - Balance display + transactions
2. **Dark Mode Home** - Same view in dark mode
3. **Payment Mode Toggle** - EUR vs Crypto badge
4. **Send Payment Flow** - Search → Form → Confirm
5. **Transaction History** - List of transactions
6. **Profile with QR** - User info + QR code
7. **Responsive Mobile** - Bottom navigation
8. **Database Query** - Ledger balance = 0

---

## 🎉 Success Metrics

After demo, you should have:
- ✅ 2 test users created
- ✅ Funds added to both users
- ✅ At least 1 successful payment
- ✅ Real-time balance updates working
- ✅ Theme toggle functional
- ✅ Payment mode toggle functional
- ✅ Transaction history populated
- ✅ Ledger balanced (sum = 0)

---

## 🚀 Ready to Demo!

**Time Required**: 10-15 minutes total
**Preparation**: 5 minutes
**Demo**: 5-10 minutes

**Key Message**: 
> "Kodu provides instant EUR payments with a beautiful, modern UI. The architecture is production-ready with double-entry ledger, real-time updates, and full dark mode support. EUR payments work perfectly now, with a framework ready for crypto integration."

---

**Last Updated**: October 12, 2025
**Status**: ✅ Ready for Demo
