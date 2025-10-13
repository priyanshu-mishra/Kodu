# Kodu - User Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [User Flows](#user-flows)
3. [Features Guide](#features-guide)
4. [Payment Methods](#payment-methods)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

#### Step 1: Access the Application
Navigate to the Kodu application URL in your web browser.

#### Step 2: Choose Authentication Method
You have two options:
- **Connect Wallet**: Use MetaMask, Coinbase Wallet, or other Web3 wallets
- **Email Login**: Use your email address for authentication

#### Step 3: Complete Authentication

**Option A: Wallet Authentication**
1. Click "Connect Wallet"
2. Select your wallet provider
3. Approve the connection in your wallet
4. Your wallet address is now linked to Kodu

**Option B: Email Authentication**
1. Click "Email" tab
2. Enter your email address
3. Click "Send Code"
4. Check your email for a 6-digit code
5. Enter the code in Kodu
6. Click "Verify & Continue"

#### Step 4: Set Up Username
1. Enter a unique username (3-20 characters)
2. Optionally add a display name
3. Click "Continue"
4. You're now ready to use Kodu!

---

## User Flows

### 1. Sending EUR Internal Payment

**Purpose**: Send money instantly to another Kodu user using EUR balance

**Flow**:
```
Home → Send Tab → Search Users → Select Recipient → 
EUR Internal Method → Enter Amount → Add Message → 
Continue → Confirm & Send → Success!
```

**Detailed Steps**:

1. **Navigate to Send**
   - Click the "Send" tab in the bottom navigation
   - Or click "Send" button on the home screen

2. **Find Recipient**
   - Click "Search Users"
   - Type recipient's username or name
   - Click "Pay" button next to their name

3. **Select Payment Method**
   - Choose "EUR Internal" (green icon with wallet)
   - This uses your EUR balance for instant transfer

4. **Enter Payment Details**
   - Amount: Enter the amount in EUR (e.g., 25.00)
   - Message: Add an optional message (e.g., "Lunch money")
   - Quick amounts: Click preset buttons (€10, €25, €50, etc.)

5. **Review and Confirm**
   - Click "Continue"
   - Review payment details:
     - Recipient name and username
     - Amount
     - Message
     - Payment method
   - Click "Confirm & Send €XX.XX"

6. **Payment Complete**
   - See success message
   - Payment is instant
   - Both balances updated immediately
   - Transaction appears in Activity tab

**Requirements**:
- ✅ Sufficient EUR balance
- ✅ Recipient must be a Kodu user
- ✅ Both users must have EUR accounts

**Benefits**:
- ⚡ Instant settlement
- 💰 No fees
- 🔒 Secure internal transfer

---

### 2. Sending Bank Transfer

**Purpose**: Transfer money via traditional bank accounts

**Flow**:
```
Home → Send Tab → Search Users → Select Recipient → 
Bank Transfer Method → Select Your Bank Account → 
Select Recipient's Bank Account → Enter Amount → 
Add Message → Continue → Confirm & Send → Pending
```

**Detailed Steps**:

1. **Ensure Bank Accounts Are Added**
   - Go to Profile tab
   - Click "Bank Accounts"
   - If no accounts, click "Add Account"
   - Fill in bank details (IBAN or Account Number)
   - Save account

2. **Navigate to Send**
   - Click "Send" tab
   - Click "Search Users"
   - Find and select recipient

3. **Select Bank Transfer Method**
   - Choose "Bank Transfer" (blue icon with building)
   - Select your bank account from dropdown
   - Select recipient's bank account from dropdown

4. **Enter Payment Details**
   - Amount: Enter amount in EUR
   - Message: Add optional reference

5. **Review and Confirm**
   - Click "Continue"
   - Review all details including bank account numbers
   - Click "Confirm & Send"

6. **Transaction Created**
   - Status: PENDING
   - Bank transfer initiated
   - Check Activity tab for updates
   - Settlement: 1-3 business days

**Requirements**:
- ✅ Both users must have bank accounts added
- ✅ Bank accounts must be verified
- ✅ Valid IBAN or Account Number + Routing Number

**Benefits**:
- 🏦 Traditional banking rails
- 📋 Proper audit trail
- 🌍 International transfers (with SWIFT)

---

### 3. Sending Crypto Payment

**Purpose**: Send cryptocurrency on-chain to another user

**Flow**:
```
Home → Send Tab → Search Users → Select Recipient → 
Crypto Method → Select Network → Select Token → 
Enter Amount → Add Message → Continue → 
Confirm & Send → Approve in Wallet → Success!
```

**Detailed Steps**:

1. **Navigate to Send**
   - Click "Send" tab
   - Click "Search Users"
   - Find and select recipient

2. **Select Crypto Method**
   - Choose "Crypto" option
   - Payment will be on-chain

3. **Select Network and Token**
   - **Network**: Choose Ethereum, Polygon, or Base
   - **Token**: Choose USDC, USDT, ETH, MATIC, etc.
   - See your balance for each token

4. **Enter Payment Details**
   - Amount: Enter amount in selected token
   - Message: Add optional message
   - Review gas fees estimate

5. **Continue to Confirmation**
   - Click "Continue"
   - Review all details:
     - Recipient wallet address
     - Amount and token
     - Network
     - Estimated gas fees

6. **Confirm and Approve**
   - Click "Confirm & Send"
   - Wallet popup appears
   - Review transaction in wallet
   - Click "Confirm" in wallet

7. **Transaction Processing**
   - Status: Monitoring
   - Transaction broadcast to blockchain
   - Wait for confirmations (1-5 minutes)
   - Status updates to SETTLED when confirmed

8. **View Transaction**
   - Click "View on Explorer" to see on-chain transaction
   - Check Activity tab for details

**Requirements**:
- ✅ Connected wallet with funds
- ✅ Sufficient token balance
- ✅ Sufficient native token for gas (ETH, MATIC, etc.)
- ✅ Recipient must have wallet address

**Benefits**:
- ⛓️ On-chain settlement
- 🌐 Global, permissionless
- 🔍 Transparent and verifiable

---

### 4. Receiving Payments

**Purpose**: Receive money from other users

**Flow**:
```
Home → Receive Tab → Show QR Code → 
Share with Sender → Receive Payment
```

**Detailed Steps**:

1. **Navigate to Receive**
   - Click "Receive" button on home screen
   - Or toggle to "Receive" in Send/Receive view

2. **Display Your QR Code**
   - Your QR code is automatically displayed
   - Contains your username and payment info
   - For EUR: Shows username
   - For Crypto: Shows wallet address

3. **Share Payment Info**
   - **Option A**: Let sender scan your QR code
   - **Option B**: Share your username
   - **Option C**: Share your wallet address (for crypto)

4. **Receive Payment**
   - Sender completes payment
   - You receive notification (future feature)
   - Check Activity tab to see incoming payment
   - Balance updated automatically

**Payment Methods You Can Receive**:
- ✅ EUR Internal: Instant to your EUR balance
- ✅ Bank Transfer: To your linked bank account
- ✅ Crypto: To your wallet address

---

### 5. Managing Bank Accounts

**Purpose**: Add, edit, and manage your bank accounts

**Flow**:
```
Profile Tab → Bank Accounts → Add Account → 
Fill Details → Save → Set as Primary (optional)
```

**Adding a Bank Account**:

1. **Navigate to Bank Accounts**
   - Click "Profile" tab
   - Scroll to "Bank Accounts" section
   - Click "Add Account" button

2. **Choose Account Type**
   - IBAN (for European accounts)
   - Account Number + Routing Number (for US/other accounts)

3. **Fill in Details**
   - **Bank Name**: e.g., "Deutsche Bank", "Chase"
   - **Account Holder Name**: Your full legal name
   - **Account Type**: Checking, Savings, or Business
   - **IBAN** OR **Account Number + Routing Number**
   - **SWIFT/BIC**: Optional, for international transfers
   - **Currency**: EUR, USD, GBP, etc.
   - **Country**: Country code (e.g., DE, US, GB)
   - **Nickname**: Optional, e.g., "My Main Account"
   - **Set as Primary**: Check if this is your default account

4. **Save Account**
   - Click "Add Account"
   - Account status: PENDING_VERIFICATION
   - Account appears in your list

**Managing Existing Accounts**:

- **Set as Primary**: Click checkmark icon to make default
- **Delete Account**: Click trash icon to remove
- **View Details**: See masked account number for security

**Account Status**:
- 🟡 **PENDING_VERIFICATION**: Awaiting verification
- 🟢 **ACTIVE**: Ready to use
- 🔴 **SUSPENDED**: Temporarily disabled
- ⚫ **CLOSED**: Account closed

---

### 6. Viewing Transaction History

**Purpose**: See all your past transactions

**Flow**:
```
Activity Tab → View Transactions → 
Click Transaction → See Details
```

**Viewing History**:

1. **Navigate to Activity**
   - Click "Activity" tab in bottom navigation

2. **Browse Transactions**
   - See list of all transactions
   - Most recent at the top
   - Shows:
     - Recipient/Sender name
     - Amount and currency
     - Payment method icon
     - Status badge
     - Date and time
     - Message (if any)

3. **Filter and Search** (future feature)
   - Filter by payment method
   - Filter by status
   - Search by recipient/sender
   - Date range filter

4. **View Transaction Details**
   - Click on any transaction
   - See full details:
     - Transaction ID
     - Participants
     - Amount breakdown
     - Payment method
     - Status and timestamps
     - Message
     - Bank account details (if bank transfer)
     - Blockchain explorer link (if crypto)

**Transaction Status Meanings**:
- 🟡 **PENDING**: Transaction initiated, processing
- 🟢 **SETTLED**: Transaction completed successfully
- 🔴 **FAILED**: Transaction failed, funds returned
- ⚫ **CANCELLED**: Transaction cancelled by user

---

### 7. Checking Balance

**Purpose**: View your current balances

**Location**: Home tab, top of screen

**Balance Display Shows**:

1. **EUR Balance**
   - Total EUR balance
   - Available for instant transfers
   - Shown in large, prominent display

2. **Crypto Balances** (if wallet connected)
   - Balance for each token
   - Across all supported networks
   - Real-time updates from blockchain

3. **Total Portfolio Value**
   - Combined value of all assets
   - Converted to EUR equivalent
   - Includes EUR + Crypto

**Balance Actions**:
- **Add Funds**: Click to add EUR (future feature)
- **Withdraw**: Transfer to bank account (future feature)
- **Refresh**: Pull to refresh balances

---

### 8. Profile Management

**Purpose**: Manage your account settings

**Flow**:
```
Profile Tab → Edit Profile → Update Details → Save
```

**Profile Sections**:

1. **Personal Information**
   - Username (unique identifier)
   - Display Name (how others see you)
   - Email address
   - Wallet address (if connected)
   - Avatar (future feature)

2. **Bank Accounts**
   - View all linked bank accounts
   - Add new accounts
   - Manage existing accounts
   - Set primary account

3. **Security** (future feature)
   - Two-factor authentication
   - Connected devices
   - Login history
   - Password/PIN

4. **Preferences** (future feature)
   - Default payment method
   - Currency preference
   - Notification settings
   - Theme (light/dark)

5. **Account Actions**
   - Logout
   - Delete account (future feature)
   - Export data (future feature)

---

## Features Guide

### QR Code Payments

**Sending via QR Code**:
1. Click "Scan QR Code" in Send tab
2. Allow camera access
3. Point camera at recipient's QR code
4. Recipient info auto-fills
5. Enter amount and continue

**Receiving via QR Code**:
1. Go to Receive tab
2. Show your QR code to sender
3. Sender scans and sends payment
4. You receive funds instantly

**QR Code Contains**:
- Username
- Wallet address (for crypto)
- Payment preferences

---

### User Search

**Finding Users**:
1. Click "Search Users" in Send tab
2. Type username or display name
3. See matching results
4. Click "Pay" to send money

**Search Features**:
- Real-time search as you type
- Shows username and display name
- Avatar display (future feature)
- Recent recipients (future feature)

---

### Payment Method Selection

**Available Methods**:

1. **EUR Internal** (Green)
   - Icon: Wallet
   - Use when: Both users have EUR balance
   - Speed: Instant
   - Fees: Free

2. **Bank Transfer** (Blue)
   - Icon: Building
   - Use when: Traditional bank transfer needed
   - Speed: 1-3 business days
   - Fees: Bank fees may apply

3. **Crypto** (Purple)
   - Icon: Cryptocurrency symbol
   - Use when: On-chain payment needed
   - Speed: 1-5 minutes
   - Fees: Gas fees apply

**Selection Tips**:
- Default to EUR Internal for speed and no fees
- Use Bank Transfer for larger amounts or when recipient prefers
- Use Crypto for global, permissionless payments

---

### Balance Management

**Adding EUR Funds** (future feature):
- Bank transfer to Kodu account
- Card payment
- Crypto to EUR conversion

**Withdrawing EUR** (future feature):
- Transfer to linked bank account
- EUR to crypto conversion

**Current Workaround**:
- Contact admin to add test funds
- Use `init-eur-accounts.js` script (developers)

---

## Payment Methods

### Comparison Table

| Feature | EUR Internal | Bank Transfer | Crypto |
|---------|-------------|---------------|--------|
| **Speed** | Instant | 1-3 days | 1-5 minutes |
| **Fees** | Free | Bank fees | Gas fees |
| **Limits** | Balance limit | Bank limits | Wallet balance |
| **Reversible** | No | Possible | No |
| **Requires** | EUR balance | Bank account | Wallet + tokens |
| **Best For** | P2P transfers | Large amounts | Global payments |
| **Privacy** | Internal | Bank records | Public blockchain |
| **Availability** | 24/7 | Business hours | 24/7 |

### When to Use Each Method

**Use EUR Internal When**:
- ✅ Sending to another Kodu user
- ✅ Need instant settlement
- ✅ Want to avoid fees
- ✅ Small to medium amounts
- ✅ Both parties have EUR balance

**Use Bank Transfer When**:
- ✅ Recipient prefers bank deposit
- ✅ Large amounts (over €1000)
- ✅ Need traditional audit trail
- ✅ Recipient not on Kodu
- ✅ Business/invoice payments

**Use Crypto When**:
- ✅ Global payment needed
- ✅ Recipient prefers crypto
- ✅ Want blockchain verification
- ✅ Sending to non-EUR country
- ✅ Need permissionless payment

---

## Troubleshooting

### Common Issues

#### "Insufficient EUR balance"

**Problem**: Not enough EUR to complete payment

**Solutions**:
1. Check your EUR balance on home screen
2. Add funds to your EUR account
3. Use a different payment method (crypto or bank)
4. Reduce payment amount

---

#### "Bank accounts not available in demo mode"

**Problem**: Stuck in demo mode, can't add bank accounts

**Solutions**:
1. Visit `http://localhost:5173/clear-demo.html`
2. Click "Clear Demo Mode & Logout"
3. Log in again with real account
4. Try adding bank account again

**Alternative**:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

#### "Transaction pending for too long"

**Problem**: Transaction stuck in PENDING status

**Solutions**:

**For EUR Internal**:
- Should be instant - refresh page
- Check Activity tab for updates
- Contact support if still pending after 1 minute

**For Bank Transfer**:
- Normal to be pending for 1-3 business days
- Check bank account for debit
- Contact bank if longer than 3 days

**For Crypto**:
- Check blockchain explorer (click "View on Explorer")
- May need more confirmations
- Check if transaction failed on-chain
- Ensure sufficient gas was provided

---

#### "Wallet not connecting"

**Problem**: Can't connect MetaMask or other wallet

**Solutions**:
1. Refresh the page
2. Make sure wallet extension is installed
3. Unlock your wallet
4. Try different wallet provider
5. Clear browser cache
6. Check wallet is on correct network

---

#### "User not found"

**Problem**: Can't find recipient when searching

**Solutions**:
1. Check spelling of username
2. Ensure recipient has completed signup
3. Ask recipient for exact username
4. Try searching by display name
5. Use QR code instead

---

#### "Payment failed"

**Problem**: Payment transaction failed

**Possible Causes**:

**EUR Internal**:
- Insufficient balance
- Recipient account issue
- Database connection error

**Bank Transfer**:
- Invalid bank account details
- Bank account not verified
- Recipient bank account closed

**Crypto**:
- Insufficient gas
- Transaction reverted on-chain
- Network congestion
- Wallet rejected transaction

**Solutions**:
1. Check error message for specific reason
2. Verify all details are correct
3. Try again with correct information
4. Contact support if issue persists

---

#### "Can't see transaction history"

**Problem**: Activity tab is empty or not loading

**Solutions**:
1. Refresh the page
2. Check internet connection
3. Verify you're logged in
4. Clear browser cache
5. Check browser console for errors

---

### Getting Help

**Support Channels**:
- 📧 Email: support@kodu.app (future)
- 💬 In-app chat (future)
- 📚 Documentation: This guide
- 🐛 Bug reports: GitHub issues

**Before Contacting Support**:
1. Check this troubleshooting section
2. Note any error messages
3. Take screenshots if helpful
4. Note your username
5. Note transaction ID (if applicable)

---

## Best Practices

### Security

1. **Protect Your Credentials**
   - Never share your wallet private key
   - Keep email OTP codes private
   - Log out on shared devices

2. **Verify Recipients**
   - Double-check username before sending
   - Verify amount before confirming
   - Use messages to add context

3. **Monitor Activity**
   - Regularly check transaction history
   - Report suspicious activity immediately
   - Keep records of important transactions

### Efficient Usage

1. **Use EUR Internal for Speed**
   - Keep EUR balance for instant payments
   - Avoid unnecessary crypto gas fees
   - Save bank transfers for large amounts

2. **Organize Bank Accounts**
   - Set primary account for quick access
   - Use nicknames for easy identification
   - Keep account details updated

3. **Add Context to Payments**
   - Always add messages to payments
   - Use clear, descriptive messages
   - Helps with record-keeping

---

## Keyboard Shortcuts (Future Feature)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick search users |
| `Cmd/Ctrl + S` | Go to Send |
| `Cmd/Ctrl + R` | Go to Receive |
| `Cmd/Ctrl + H` | Go to Home |
| `Cmd/Ctrl + A` | Go to Activity |
| `Cmd/Ctrl + P` | Go to Profile |
| `Esc` | Close modal/go back |

---

## Mobile App (Future)

Kodu mobile app coming soon with:
- Native iOS and Android apps
- Push notifications
- Biometric authentication
- NFC payments
- Offline mode
- Camera QR scanning

---

## Conclusion

Kodu makes payments simple, fast, and secure. Whether you're sending EUR to a friend, making a bank transfer, or sending crypto globally, Kodu has you covered.

**Key Takeaways**:
- ⚡ EUR Internal for instant, free P2P payments
- 🏦 Bank Transfer for traditional banking needs
- ⛓️ Crypto for global, on-chain payments
- 📱 Simple, intuitive interface
- 🔒 Secure and reliable

Start sending and receiving payments today!
