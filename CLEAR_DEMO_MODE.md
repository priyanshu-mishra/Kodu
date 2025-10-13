# Clear Demo Mode and Fix Bank Account Issue

## Problem
You're currently in **demo mode** (mock user), which prevents you from adding bank accounts and using the real database.

## Solution

### Option 1: Clear Browser Data (Recommended)
1. Open your browser's Developer Console (F12 or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Run this command:
   ```javascript
   localStorage.clear(); location.reload();
   ```
4. This will log you out and clear all demo mode data
5. Log in again with your wallet or email

### Option 2: Manual Logout
1. Click on your profile/settings
2. Click **Logout**
3. Log in again

### Option 3: Clear Specific Items
If you want to keep some data, run these commands in the browser console:
```javascript
localStorage.removeItem('mock_user');
localStorage.removeItem('wallet_address');
localStorage.removeItem('auth_method');
location.reload();
```

## After Clearing Demo Mode

1. **Log in again** using one of these methods:
   - Connect your wallet (recommended)
   - Use email authentication

2. **Set up your username** when prompted

3. **Try adding a bank account again**

## Verify Database Connection

Run this command to verify your database is properly set up:
```bash
npm run verify-db
```

You should see:
- ✅ All required tables exist
- 👥 List of users in the database

## Still Having Issues?

If you're still stuck in demo mode after following these steps:

1. **Check browser console** for error messages
2. **Verify Supabase credentials** in `.env` file:
   - `VITE_SUPABASE_URL` should be set
   - `VITE_SUPABASE_ANON_KEY` should be set

3. **Contact support** with:
   - Browser console logs
   - Screenshot of the error
   - Your wallet address

## Technical Details

Demo mode occurs when:
- Database connection fails during user creation
- Supabase credentials are missing or invalid
- Database tables don't exist

The app falls back to creating a "mock user" with ID starting with `mock-`, which has limited functionality.

By clearing localStorage and logging in again, you'll create a real user in the database with full functionality including bank accounts.
