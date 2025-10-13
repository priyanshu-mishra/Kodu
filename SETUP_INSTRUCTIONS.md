# Setup Instructions - Fix Applied! ✅

**Issue Fixed**: Changed `t.amount` to `t.amount_eur` in SQL script

---

## 🚀 QUICK SETUP (2 STEPS)

### Step 1: Run Simple Setup Script

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy and paste this:

```sql
-- Create EUR accounts for all users
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

-- Add €100 test balance
UPDATE accounts
SET 
  balance = 100.00,
  available_balance = 100.00,
  updated_at = NOW()
WHERE account_type = 'USER_EUR';

-- Verify setup
SELECT 
  u.username,
  u.email,
  a.balance,
  a.available_balance
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.account_type = 'USER_EUR'
ORDER BY u.created_at DESC;
```

4. Click **Run**
5. ✅ **Done!**

---

### Step 2: Test the App

```bash
npm run dev
```

Then:
1. Login with your account
2. Go to **Send/Receive** tab
3. Search for **"mishrap"**
4. ✅ Should find the real user!
5. Send €10 payment
6. Check **Activity** tab
7. ✅ Should see the transaction!

---

## ✅ WHAT THIS DOES

1. **Creates EUR accounts** for all existing users
2. **Adds €100 balance** to each account for testing
3. **Shows verification** - lists all users and their balances

---

## 🎯 EXPECTED OUTPUT

After running the script, you should see:

```
username    | email                          | balance | available_balance
------------|--------------------------------|---------|------------------
priyanshu   | your@email.com                 | 100.00  | 100.00
mishrap     | mishra.priyanshu01@gmail.com   | 100.00  | 100.00
```

---

## 🐛 IF YOU GET ERRORS

### Error: "relation 'accounts' does not exist"

**Solution**: Create the accounts table first:

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  balance NUMERIC(20,2) DEFAULT 0,
  available_balance NUMERIC(20,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
```

---

### Error: "relation 'users' does not exist"

**Solution**: Users should already exist from login. Check:

```sql
SELECT * FROM users;
```

If empty, log in to the app first to create your user.

---

### Error: "column amount does not exist"

**Solution**: Already fixed! Use `setup_accounts_simple.sql` or the script above.

---

## 📊 VERIFY EVERYTHING WORKS

### Check Users:
```sql
SELECT username, email FROM users;
```

### Check Accounts:
```sql
SELECT u.username, a.balance, a.available_balance
FROM users u
JOIN accounts a ON u.id = a.user_id
WHERE a.account_type = 'USER_EUR';
```

### Check Transactions (after sending payment):
```sql
SELECT 
  fu.username as from_user,
  tu.username as to_user,
  t.amount_eur,
  t.message,
  t.status,
  t.created_at
FROM transactions t
JOIN users fu ON t.from_user_id = fu.id
JOIN users tu ON t.to_user_id = tu.id
ORDER BY t.created_at DESC;
```

---

## 🎉 YOU'RE READY!

Once the script runs successfully:
- ✅ All users have EUR accounts
- ✅ All users have €100 balance
- ✅ You can search for users
- ✅ You can send payments
- ✅ Transactions are recorded

**Start the app and test!**

```bash
npm run dev
```

---

**If you see the verification output with users and balances, you're good to go!** 🚀
