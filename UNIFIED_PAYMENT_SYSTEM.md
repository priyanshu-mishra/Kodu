# Unified Payment System - Complete Implementation Guide

## Overview

The Kodu app now features a **unified payment experience** controlled by a global toggle that switches between **Crypto** and **Fiat** modes. This creates a seamless, mode-aware experience across the entire application.

## Key Features

### 🔄 Global Mode Toggle
- **Location**: Top-right header (next to theme toggle)
- **Modes**:
  - **Crypto Mode** (Blue): Wallet-based payments, crypto QR codes
  - **Fiat Mode** (Green): Bank transfers, bank account QR codes
- **Persistence**: Mode saved in localStorage

### 📱 Mode-Aware QR Codes

#### Crypto Mode QR Code
- Contains: Wallet address
- Format: `ethereum:{wallet_address}`
- Color scheme: Blue
- Icon: Wallet

#### Fiat Mode QR Code
- Contains: Bank account details (IBAN, account number, bank name, etc.)
- Format: JSON with bank payment data
- Color scheme: Green
- Icon: Building/Bank

### 🔍 Unified QR Scanner
- Automatically detects QR code type
- Validates against current mode
- Shows helpful error if wrong QR type scanned
- Extracts user information from both formats

### 💸 Unified Send/Receive Flow

#### Send Tab
**Mode-aware options:**
1. **Search Users**: Find by username/name
2. **Scan QR Code**: Scans appropriate QR type based on mode

**Payment Methods (Auto-selected based on mode):**
- **Crypto Mode**: Crypto payment with token selection
- **Fiat Mode**: 
  - EUR Internal transfer (instant)
  - Bank Transfer (if both users have bank accounts)

#### Receive Tab
- Shows appropriate QR code based on mode
- Crypto: Wallet QR code
- Fiat: Bank account QR code

## Installation & Setup

### 1. Install Required Dependencies

```bash
cd kodu
npm install qr-code-styling html5-qrcode
```

These packages are needed for:
- `qr-code-styling`: Generate beautiful, customizable QR codes
- `html5-qrcode`: Scan QR codes using device camera

### 2. Update Database Schema

Run the updated schema in Supabase SQL Editor:
```sql
-- File: sql/supabase-schema.sql
-- This includes bank_accounts table and BANK_TRANSFER payment mode
```

### 3. Add Test Bank Accounts

For testing, add bank accounts to users:

```sql
-- Add bank account for test user
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
  'John Doe',
  'DE89370400440532013000',
  'CHECKING',
  'ACTIVE',
  true,
  NOW()
);
```

### 4. Test the System

```bash
npm run dev
```

## User Flows

### Flow 1: Send Crypto Payment

1. **Toggle to Crypto Mode** (blue toggle in header)
2. Go to **Send** tab
3. Choose **Search Users** or **Scan QR Code**
4. Select recipient
5. **Payment method auto-selected**: Crypto
6. Choose network and token (Base, Ethereum, Polygon)
7. Enter amount
8. Confirm payment
9. Transaction executes on blockchain

### Flow 2: Send Bank Transfer

1. **Toggle to Fiat Mode** (green toggle in header)
2. Ensure you have a bank account connected (Profile → Bank Accounts)
3. Go to **Send** tab
4. Choose **Search Users** or **Scan QR Code**
5. Select recipient (must have bank account)
6. **Payment method options**:
   - EUR Internal (instant)
   - Bank Transfer (if both have bank accounts)
7. Select bank transfer
8. Choose your bank account
9. Enter amount
10. Confirm payment
11. Transfer processes (3-second simulation)

### Flow 3: Receive via QR Code

1. **Toggle to desired mode** (Crypto or Fiat)
2. Go to **Send** tab
3. Click **Receive** button
4. Share QR code with sender
5. **Crypto Mode**: Shows wallet QR
6. **Fiat Mode**: Shows bank account QR

### Flow 4: Scan and Pay

1. **Toggle to appropriate mode**
2. Go to **Send** tab
3. Click **Scan QR Code**
4. Grant camera permission
5. Point camera at QR code
6. System validates QR type matches mode
7. Auto-fills recipient information
8. Complete payment

## Component Architecture

### New Components

#### `PaymentModeContext.tsx`
- Global state management for Crypto/Fiat mode
- Provides: `mode`, `toggleMode`, `isFiatMode`, `isCryptoMode`
- Persists to localStorage

#### `ModeToggle.tsx`
- Visual toggle button in header
- Shows current mode with icon and color
- Animated switch indicator

#### `UnifiedQRCodeDisplay.tsx`
- Wrapper that shows appropriate QR based on mode
- Switches between `QRCodeDisplay` (crypto) and `BankAccountQRCode` (fiat)

#### `BankAccountQRCode.tsx`
- Generates QR code with bank account details
- Loads user's primary bank account
- Displays account info (masked)
- Download and copy functionality

#### `UnifiedQRScanner.tsx`
- Scans both crypto and fiat QR codes
- Validates QR type against current mode
- Extracts user data from QR payload
- Shows helpful error messages

#### `UnifiedSendReceive.tsx`
- Mode-aware send/receive interface
- Dynamic UI based on current mode
- Integrates all payment flows

#### `UnifiedSendPayment.tsx`
- Unified payment form
- Shows relevant fields based on mode
- Crypto: Token/chain selector
- Fiat: Payment method selector (EUR/Bank)

#### `PaymentMethodSelector.tsx`
- Visual payment method chooser
- Three options: Crypto, EUR Internal, Bank Transfer
- Shows availability based on connected accounts
- Bank account dropdown for transfers

## QR Code Data Formats

### Crypto QR Code
```
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Fiat QR Code
```json
{
  "type": "bank_transfer",
  "userId": "uuid",
  "username": "johndoe",
  "displayName": "John Doe",
  "bankAccountId": "uuid",
  "iban": "DE89370400440532013000",
  "bankName": "Deutsche Bank",
  "accountHolderName": "John Doe",
  "currency": "EUR"
}
```

## Mode Behavior Matrix

| Feature | Crypto Mode | Fiat Mode |
|---------|-------------|-----------|
| QR Code | Wallet address | Bank account details |
| QR Color | Blue | Green |
| Payment Options | Crypto only | EUR Internal + Bank Transfer |
| User Search | All users | All users |
| Scan Validation | Wallet QR only | Bank QR only |
| Balance Display | Crypto balances | EUR balance |
| Transaction Type | On-chain | Off-chain / Bank |

## Error Handling

### Wrong QR Type Scanned
- **Crypto QR in Fiat Mode**: "This is a crypto wallet QR code. Switch to Crypto mode to use it."
- **Fiat QR in Crypto Mode**: "This is a bank transfer QR code. Switch to Fiat mode to use it."

### Missing Bank Account
- **Sender**: "Connect a bank account in your profile to enable bank transfers"
- **Recipient**: "Recipient doesn't have a bank account connected"

### Invalid QR Code
- "Invalid QR code format"
- "User not found"

## Testing Checklist

### Mode Toggle
- [ ] Toggle appears in header
- [ ] Switches between Crypto (blue) and Fiat (green)
- [ ] Mode persists after page refresh
- [ ] All UI elements update based on mode

### QR Codes
- [ ] Crypto mode shows wallet QR (blue)
- [ ] Fiat mode shows bank account QR (green)
- [ ] QR codes are scannable
- [ ] Download QR code works
- [ ] Copy info works

### QR Scanner
- [ ] Camera permission requested
- [ ] Scans crypto QR in crypto mode
- [ ] Scans fiat QR in fiat mode
- [ ] Shows error for wrong QR type
- [ ] Extracts user data correctly

### Payment Flow
- [ ] Crypto mode: Shows crypto payment options
- [ ] Fiat mode: Shows EUR/Bank transfer options
- [ ] Bank transfer only available if both users have accounts
- [ ] Payment completes successfully
- [ ] Transaction appears in history

### User Experience
- [ ] Mode indicator clear and visible
- [ ] Smooth transitions between modes
- [ ] Helpful error messages
- [ ] Consistent color scheme (blue/green)
- [ ] Mobile responsive

## Production Considerations

### Security
1. **QR Code Validation**: Verify QR data on backend
2. **Bank Account Verification**: Implement real verification (Plaid, Stripe)
3. **Transaction Limits**: Add daily/monthly limits
4. **Fraud Detection**: Monitor suspicious patterns

### Performance
1. **QR Generation**: Cache generated QR codes
2. **Scanner Optimization**: Limit scan frequency
3. **Image Optimization**: Compress QR code images

### UX Improvements
1. **Onboarding**: Guide users through mode concept
2. **Tooltips**: Explain mode differences
3. **Quick Actions**: Add shortcuts for common flows
4. **History Filtering**: Filter by payment mode

### Integration
1. **Bank APIs**: Integrate with Plaid, TrueLayer, or Stripe
2. **KYC/AML**: Implement compliance checks
3. **Webhooks**: Real-time bank transfer status
4. **Push Notifications**: Notify on payment received

## Troubleshooting

### QR Scanner Not Working
- Check camera permissions in browser
- Ensure HTTPS (camera requires secure context)
- Try different lighting conditions
- Clear browser cache

### Mode Not Persisting
- Check localStorage is enabled
- Clear localStorage and try again
- Check browser console for errors

### Bank Transfer Not Available
- Verify both users have ACTIVE bank accounts
- Check database for bank_accounts records
- Ensure primary account is set

### QR Code Not Generating
- Check npm packages installed correctly
- Verify bank account data exists
- Check browser console for errors

## API Reference

### PaymentModeContext

```typescript
const { 
  mode,              // 'CRYPTO' | 'FIAT'
  toggleMode,        // () => void
  setMode,           // (mode: GlobalPaymentMode) => void
  isFiatMode,        // boolean
  isCryptoMode,      // boolean
  getModeLabel,      // () => string
  getModeColor       // () => string
} = usePaymentMode();
```

### BankAccountService

```typescript
// Get user's bank accounts
const accounts = await BankAccountService.getUserBankAccounts(userId);

// Get primary account
const primary = await BankAccountService.getPrimaryBankAccount(userId);

// Create bank account
const account = await BankAccountService.createBankAccount(userId, {
  bank_name: 'Test Bank',
  account_holder_name: 'John Doe',
  iban: 'DE89370400440532013000',
  account_type: 'CHECKING',
  is_primary: true
});
```

## Summary

The unified payment system provides:
- ✅ **Single toggle** controls entire app experience
- ✅ **Mode-aware QR codes** (crypto wallet vs bank account)
- ✅ **Smart QR scanner** validates and extracts data
- ✅ **Unified payment flow** adapts to mode
- ✅ **Seamless UX** with consistent visual language
- ✅ **Production-ready architecture** for bank API integration

Users can now seamlessly switch between crypto and fiat payments with a single toggle, making Kodu a true **unified instant P2P payment platform**.
