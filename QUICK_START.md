# Quick Start Guide - Kodu Payment System

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment
```bash
cd kodu
cp env.example .env
```

Edit `.env` and add your thirdweb Client ID:
```env
VITE_THIRDWEB_CLIENT_ID=your_client_id_here
```

**Get your Client ID**: https://thirdweb.com/dashboard/settings/api-keys

### Step 2: Install & Run
```bash
npm install
npm run dev
```

### Step 3: Test Features
Open http://localhost:5173 and try:
- ✅ View your balance
- ✅ Buy crypto (click the + button)
- ✅ Send payment to another user
- ✅ View transaction on blockchain explorer

---

## 🎯 Key Features

### 1. Balance Display
**Location**: Home page

**Features**:
- View balances across multiple chains
- Filter by network and token
- Refresh balances anytime
- **NEW**: Buy Crypto button (+ icon in header)

**How to use**:
1. Balances load automatically on login
2. Click refresh icon to update
3. Click + button to buy more crypto
4. Click eye icon to hide/show amounts

### 2. Buy Crypto
**Location**: 
- Balance Display (+ button)
- Payment Confirmation (when insufficient funds)

**Features**:
- Select network and token
- Optional amount specification
- Opens thirdweb's secure buy modal
- Supports credit/debit cards and bank transfers

**How to use**:
1. Click "Buy Crypto" or + button
2. Select network (Base, Ethereum, Polygon)
3. Select token (USDC, USDT, etc.)
4. Enter amount (optional)
5. Click "Buy Crypto"
6. Complete purchase in popup window
7. Wait for balance to update

### 3. Send Payment
**Location**: Home page → Send Payment

**Features**:
- Search by username or scan QR code
- Select network and token
- Real-time balance checking
- Payment confirmation screen
- Transaction monitoring

**How to use**:
1. Click "Send Payment"
2. Select recipient (username or QR)
3. Choose network and token
4. Enter amount
5. Add optional message
6. Review and confirm
7. **If insufficient funds**: Buy crypto option appears
8. Monitor transaction status
9. View on blockchain explorer

### 4. Transaction Details
**Location**: After payment confirmation

**Features**:
- Status badges (pending/confirmed/failed)
- Transaction hash
- Blockchain explorer link
- From/To addresses
- Amount and network info

---

## 🔑 API Integration Points

### Balance API
```typescript
// Get balance for specific token
const balance = await getWalletBalance(
  walletAddress,
  chainId,
  tokenAddress
);

// Get native token balance
const nativeBalance = await getWalletBalance(
  walletAddress,
  chainId
);

// Get balances across multiple chains
const multiBalance = await getMultiChainBalance(
  walletAddress,
  [1, 137, 8453] // Ethereum, Polygon, Base
);
```

### Payment API
```typescript
// Create and execute payment
const payment = await createPayment(
  name, description, recipient,
  tokenAddress, amount, chainId, userToken
);

const result = await completePayment(
  payment.id, senderAddress, userToken
);

// Monitor transaction
const status = await getTransactionStatus(
  result.result.transactionId
);
```

### Buy Crypto API
```typescript
// Open buy crypto modal
openBuyCryptoModal({
  walletAddress: user.wallet_address,
  chainId: 8453, // Base
  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
  amount: '10' // Optional
});
```

---

## 🌐 Supported Networks

| Network | Chain ID | Tokens | Explorer |
|---------|----------|--------|----------|
| **Base** (Default) | 8453 | USDC | [Basescan](https://basescan.org) |
| **Ethereum** | 1 | USDC, USDT | [Etherscan](https://etherscan.io) |
| **Polygon** | 137 | USDC, USDT | [Polygonscan](https://polygonscan.com) |

---

## 🛠️ Troubleshooting

### Balance not loading?
- Check that `VITE_THIRDWEB_CLIENT_ID` is set in `.env`
- Verify wallet address is correct
- Check browser console for errors
- Try refreshing the page

### Payment fails?
- Ensure sufficient balance (or use Buy Crypto)
- Check that user token hasn't expired (re-login if needed)
- Verify network and token are correct
- Check blockchain explorer for transaction status

### Buy Crypto modal doesn't open?
- Check browser popup blocker settings
- Ensure you're logged in
- Try a different browser
- Check browser console for errors

### Transaction stuck?
- Blockchain confirmations can take 10-30 seconds
- Check actual status on blockchain explorer
- Network congestion may cause delays
- Transaction will eventually confirm or fail

---

## 📱 User Flows

### First Time User
1. Sign up with email
2. Receive wallet address
3. Click "Buy Crypto" to add funds
4. Complete purchase
5. Start sending payments!

### Sending Your First Payment
1. Click "Send Payment"
2. Search for recipient by username
3. Select amount and token
4. Review details
5. Confirm payment
6. Wait for confirmation
7. View on blockchain explorer

### Adding More Funds
1. Go to Balance Display
2. Click + button in header
3. Select network and token
4. Enter amount (optional)
5. Complete purchase
6. Balance updates automatically

---

## 🎨 UI Components

### Balance Display
```
┌─────────────────────────────────┐
│ 💰 Your Balance        [+][👁][🔄] │
├─────────────────────────────────┤
│ Filter Balances                 │
│ [Network] [Token]               │
├─────────────────────────────────┤
│ $100.00                         │
│ Total USD value                 │
├─────────────────────────────────┤
│ 🔵 USDC                    50.00│
│    USD Coin              Base   │
│                                 │
│ 🟣 USDC                    50.00│
│    USD Coin (PoS)      Polygon  │
└─────────────────────────────────┘
```

### Buy Crypto
```
┌─────────────────────────────────┐
│ 💳 Buy Crypto                   │
│    Add funds to your wallet     │
├─────────────────────────────────┤
│ ℹ️ Powered by thirdweb          │
│    Buy with card or bank        │
├─────────────────────────────────┤
│ Select Network & Token          │
│ [Base ▼] [USDC ▼]              │
├─────────────────────────────────┤
│ Amount (Optional)               │
│ $ [Enter amount in USD]         │
├─────────────────────────────────┤
│ Receiving Address               │
│ 0x1234...5678                   │
├─────────────────────────────────┤
│ [Buy Crypto]                    │
│ [Cancel]                        │
└─────────────────────────────────┘
```

### Payment Confirmation
```
┌─────────────────────────────────┐
│ ← Confirm Payment               │
├─────────────────────────────────┤
│        📤                        │
│   Review your payment details   │
├─────────────────────────────────┤
│ Payment Details                 │
│                                 │
│ To:        @testuser1          │
│ Amount:    10 USDC             │
│ Network:   Polygon             │
│ Message:   "test"              │
├─────────────────────────────────┤
│ [Send Payment]                  │
└─────────────────────────────────┘
```

---

## 🔗 Important Links

- **thirdweb Dashboard**: https://thirdweb.com/dashboard
- **thirdweb Docs**: https://portal.thirdweb.com/
- **API Reference**: https://portal.thirdweb.com/api-reference
- **Base Explorer**: https://basescan.org
- **Ethereum Explorer**: https://etherscan.io
- **Polygon Explorer**: https://polygonscan.com

---

## 💡 Pro Tips

1. **Use Base for lower fees**: Base has the lowest transaction fees
2. **Buy in bulk**: Purchase larger amounts to save on fees
3. **Check explorer**: Always verify transactions on blockchain explorer
4. **Keep some native tokens**: Keep small amount of ETH/MATIC for gas
5. **Test with small amounts**: Start with small transactions to test
6. **Save wallet address**: Bookmark or save your wallet address
7. **Monitor status**: Watch transaction status until confirmed

---

## 🎓 Learn More

### Understanding Blockchain
- Transactions require network confirmations (10-30 seconds)
- Gas fees are paid in native tokens (ETH, MATIC)
- Smart wallets abstract away gas complexity
- All transactions are public on blockchain

### Security Best Practices
- Never share your private keys
- Always verify recipient address
- Double-check amounts before confirming
- Use secure networks (avoid public WiFi)
- Keep your login credentials safe

### Token Types
- **Native Tokens**: ETH (Ethereum), MATIC (Polygon)
- **Stablecoins**: USDC, USDT (pegged to USD)
- **ERC20 Tokens**: Standard token format on Ethereum

---

## ✅ Checklist for Production

Before deploying to production:

- [ ] Set production `VITE_THIRDWEB_CLIENT_ID`
- [ ] Configure Supabase production database
- [ ] Add production domain to thirdweb allowlist
- [ ] Test all payment flows on mainnet
- [ ] Verify explorer links work
- [ ] Test buy crypto on production
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Add analytics tracking
- [ ] Test on mobile devices
- [ ] Perform security audit
- [ ] Set up backup systems

---

## 🆘 Support

Need help?
1. Check `THIRDWEB_INTEGRATION.md` for detailed docs
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Check browser console for error messages
4. Visit thirdweb Discord: https://discord.gg/thirdweb
5. Check thirdweb documentation: https://portal.thirdweb.com/

---

**Ready to start?** Run `npm run dev` and open http://localhost:5173 🚀
