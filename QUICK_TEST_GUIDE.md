# Quick Test Guide - Get Kodu Running NOW! 🚀

**Time to working app**: ~2 minutes

---

## 🎯 Quick Start (3 Steps)

### Step 1: Clear Everything (30 seconds)
```bash
# In your terminal
cd /Users/priyanshum/Developer/Kodu/Kodu-test/kodu

# Clear any old processes
pkill -f "vite"

# Start fresh dev server
npm run dev
```

### Step 2: Clear Browser (30 seconds)
1. Open Chrome/Firefox
2. Press **F12** (opens DevTools)
3. Go to **Application** tab
4. Click **Clear Storage** (left sidebar)
5. Click **Clear site data** button
6. Close DevTools

### Step 3: Test Login (1 minute)
**Option A - Wallet Login (Fastest)**:
1. Go to http://localhost:5173
2. Click **"Connect Wallet"**
3. Choose **MetaMask**
4. Click **Approve** in MetaMask
5. ✅ Should see username setup screen!

**Option B - Email Login**:
1. Go to http://localhost:5173
2. Click **"Login with Email"** tab
3. Enter your email
4. Click **"Send code"**
5. Check email for 6-digit code
6. Enter code and click **"Verify"**
7. ✅ Should see username setup screen!

---

## ✅ What You Should See

### After Wallet/Email Login:
```
┌─────────────────────────────────┐
│   Choose your username          │
│   This is how friends will      │
│   find and pay you              │
│                                 │
│   Username: @_________          │
│   Display name: _________       │
│                                 │
│   [Complete setup]              │
└─────────────────────────────────┘
```

### After Username Setup:
```
┌─────────────────────────────────┐
│  Kodu                    👤     │
├─────────────────────────────────┤
│                                 │
│   💰 Your Balance               │
│   $0.00 USDC                    │
│                                 │
│   [Send] [Receive]              │
│                                 │
└─────────────────────────────────┘
│ Home | Send | Activity | Search │
└─────────────────────────────────┘
```

---

## 🐛 If Something Goes Wrong

### Problem: Blank White Page
**Fix**:
```bash
# Stop server (Ctrl+C)
# Clear node modules
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: "Connect Wallet" Does Nothing
**Fix**:
1. Check if MetaMask is installed
2. Check if MetaMask is unlocked
3. Open DevTools Console (F12)
4. Look for errors
5. Share error messages

### Problem: Email Code Not Received
**Fix**:
1. Check spam folder
2. Wait 1-2 minutes
3. Try different email (Gmail works best)
4. Check console for errors

### Problem: Username Setup Loops
**Fix**:
```javascript
// Open DevTools Console (F12)
// Paste this:
localStorage.clear()
location.reload()
```

---

## 📊 Console Checks

Open DevTools Console (F12) and look for these messages:

### ✅ Good Signs:
```
Wallet connected: 0x123...
User created: { id: "...", username: null }
Login complete!
Refreshed user data: { username: "yourname" }
```

### ❌ Bad Signs (Share These):
```
Failed to create user: ...
Failed to verify login code: ...
Error: ...
```

---

## 🎬 Video Walkthrough

### Wallet Login (30 seconds):
1. **Start**: http://localhost:5173
2. **Click**: "Connect Wallet" button
3. **Select**: MetaMask from list
4. **Approve**: In MetaMask popup
5. **Enter**: Username (e.g., "testuser123")
6. **Click**: "Complete setup"
7. **Done**: You're in the app! 🎉

### Email Login (1 minute):
1. **Start**: http://localhost:5173
2. **Tab**: "Login with Email"
3. **Enter**: your@email.com
4. **Click**: "Send code"
5. **Wait**: Check email (30 sec)
6. **Enter**: 6-digit code
7. **Click**: "Verify"
8. **Enter**: Username
9. **Click**: "Complete setup"
10. **Done**: You're in the app! 🎉

---

## 🧪 Full Test Sequence

### Test 1: New User (Wallet)
```
1. Clear browser data ✓
2. Connect MetaMask ✓
3. See username setup ✓
4. Enter "testuser1" ✓
5. See green checkmark ✓
6. Complete setup ✓
7. See main app ✓
8. See balance display ✓
```

### Test 2: Existing User (Wallet)
```
1. Disconnect wallet ✓
2. Reconnect same wallet ✓
3. Skip username setup ✓
4. Go straight to app ✓
5. See previous username ✓
```

### Test 3: New User (Email)
```
1. Clear browser data ✓
2. Enter email ✓
3. Receive code ✓
4. Verify code ✓
5. See username setup ✓
6. Complete setup ✓
7. See main app ✓
```

---

## 🎯 Success Criteria

You'll know it's working when:

- ✅ No blank white page
- ✅ Can connect wallet OR verify email
- ✅ Username setup appears for new users
- ✅ Can enter and save username
- ✅ Main app loads with balance display
- ✅ Can see navigation tabs (Home, Send, Activity, etc.)
- ✅ No errors in console

---

## 📞 Quick Help

### Still stuck? Share these 3 things:

1. **Screenshot** of the screen you're stuck on
2. **Console logs** (F12 → Console tab → copy all text)
3. **What you clicked** (step-by-step)

---

## 🚀 Ready to Test?

```bash
# 1. Start server
npm run dev

# 2. Open browser
# Go to: http://localhost:5173

# 3. Clear browser data (F12 → Application → Clear Storage)

# 4. Try wallet login!
```

**Expected time to working app**: 2 minutes  
**If it takes longer**: Check console and share errors

---

**Let's get Kodu running! 🎉**
