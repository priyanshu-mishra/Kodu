# Thirdweb Integration Guide

## Overview
This document explains how the Kodu payment system integrates with thirdweb's APIs for wallet management, balance checking, and P2P payments.

## Configuration

### Environment Variables
Add the following to your `.env` file:

```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
```

Get your client ID from: https://thirdweb.com/dashboard/settings/api-keys

## API Integration

### 1. Balance Fetching

**Endpoint:** `GET /v1/wallets/{address}/balance`

**Implementation:** `getWalletBalance()` in `src/utils/thirdwebAPI.ts`

**Usage:**
```typescript
import { getWalletBalance } from '../utils/thirdwebAPI';

// Get ERC20 token balance
const balance = await getWalletBalance(
  walletAddress,
  chainId,
  tokenAddress
);

// Get native token balance (ETH, MATIC, etc.)
const nativeBalance = await getWalletBalance(
  walletAddress,
  chainId
  // omit tokenAddress for native tokens
);
```

**Response Format:**
```json
{
  "result": [
    {
      "chainId": 137,
      "decimals": 6,
      "displayValue": "10.5",
      "name": "USD Coin",
      "symbol": "USDC",
      "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "value": "10500000"
    }
  ]
}
```

### 2. P2P Payments

**Endpoint:** `POST /v1/wallets/send`

**Implementation:** `sendTokens()` in `src/utils/thirdwebAPI.ts`

**Flow:**
1. User selects recipient, amount, and token
2. `createPayment()` creates a payment intent (stored in sessionStorage)
3. `completePayment()` executes the transfer via `sendTokens()`
4. Transaction is monitored via `getTransactionStatus()`

**Usage:**
```typescript
import { createPayment, completePayment } from '../utils/thirdwebAPI';

// Step 1: Create payment intent
const payment = await createPayment(
  'Payment to @username',
  'Payment description',
  recipientAddress,
  tokenAddress,
  amountInWei,
  chainId,
  userAuthToken
);

// Step 2: Complete payment
const result = await completePayment(
  payment.id,
  senderAddress,
  userAuthToken
);

// Step 3: Monitor transaction
const status = await getTransactionStatus(result.result.transactionId);
```

### 3. Transaction Monitoring

**Endpoint:** `GET /v1/transactions/{transactionId}`

**Implementation:** `getTransactionStatus()` in `src/utils/thirdwebAPI.ts`

**Status Mapping:**
- `QUEUED` → `pending`
- `SUBMITTED` → `pending`
- `CONFIRMED` → `confirmed`
- `FAILED` → `failed`

## Components

### BalanceDisplay
**File:** `src/components/payments/BalanceDisplay.tsx`

Displays user's token balances across multiple chains using thirdweb's balance API.

**Features:**
- Multi-chain balance display
- Token filtering
- Real-time balance refresh
- USD value calculation

### SendPayment
**File:** `src/components/payments/SendPayment.tsx`

Payment initiation form with recipient selection, amount input, and token/chain selection.

**Features:**
- QR code scanning for recipient
- Username search
- Balance checking
- Multi-chain/token support

### PaymentConfirm
**File:** `src/components/payments/PaymentConfirm.tsx`

Payment confirmation and execution screen.

**Features:**
- Payment review
- Transaction execution
- Status monitoring
- Blockchain explorer links
- Insufficient funds handling

### TransactionDetails
**File:** `src/components/transactions/TransactionDetails.tsx`

Reusable component for displaying transaction information.

**Features:**
- Status badges (pending/confirmed/failed)
- Transaction flow visualization
- Blockchain explorer integration
- Timestamp and message display

## Blockchain Explorer Integration

**Supported Chains:**
- Ethereum (Etherscan)
- Polygon (Polygonscan)
- Base (Basescan)

**Utilities:**
```typescript
import { 
  getBlockExplorerUrl, 
  getBlockExplorerAddressUrl,
  getBlockExplorerName 
} from '../utils/thirdwebAPI';

// Get transaction URL
const txUrl = getBlockExplorerUrl(chainId, transactionHash);

// Get address URL
const addressUrl = getBlockExplorerAddressUrl(chainId, walletAddress);

// Get explorer name
const explorerName = getBlockExplorerName(chainId); // "Etherscan", "Polygonscan", etc.
```

## Error Handling

### Common Errors

1. **Authentication Failed (401)**
   - User token expired
   - Solution: Log out and log back in

2. **Insufficient Funds (400)**
   - Not enough balance for transaction
   - Solution: Show user option to add funds

3. **Invalid Request (400)**
   - Malformed request data
   - Solution: Validate inputs before sending

4. **Access Forbidden (403)**
   - Client ID permissions issue
   - Solution: Check thirdweb dashboard settings

## Testing

### Test Payment Flow

1. **Setup:**
   - Ensure `VITE_THIRDWEB_CLIENT_ID` is set
   - Have test accounts with balances on testnet

2. **Test Balance Display:**
   ```bash
   # Navigate to home page
   # Check that balances load correctly
   # Try refreshing balances
   ```

3. **Test Payment:**
   ```bash
   # Click "Send Payment"
   # Select recipient
   # Enter amount
   # Select token/chain
   # Confirm payment
   # Monitor transaction status
   # Verify on blockchain explorer
   ```

### Debug Mode

Enable detailed logging by checking browser console:
- Balance API calls
- Payment creation
- Transaction status updates

## Troubleshooting

### Balance Not Loading
- Check client ID is valid
- Verify wallet address is correct
- Check network connectivity
- Look for CORS errors in console

### Payment Fails
- Verify user has sufficient balance
- Check token address is correct
- Ensure user token is not expired
- Verify chain ID is supported

### Transaction Stuck
- Check blockchain explorer for actual status
- Verify transaction hash is correct
- Network congestion may cause delays
- Try refreshing transaction status

## Best Practices

1. **Always validate user input** before calling APIs
2. **Handle errors gracefully** with user-friendly messages
3. **Monitor transaction status** until confirmed or failed
4. **Store transaction records** in your database (Supabase)
5. **Use proper token decimals** when formatting amounts
6. **Cache balances** to reduce API calls
7. **Implement retry logic** for failed API calls

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Validate all user inputs** on both client and server
3. **Use HTTPS** for all API calls
4. **Store sensitive data** (tokens) securely
5. **Implement rate limiting** to prevent abuse
6. **Verify transaction signatures** when possible

## Future Enhancements

1. **Gas Estimation:** Show estimated gas fees before transaction
2. **Price Feeds:** Integrate real-time token prices
3. **Multi-recipient:** Support batch payments
4. **Scheduled Payments:** Allow recurring payments
5. **Payment Links:** Generate shareable payment links
6. **QR Codes:** Generate QR codes for receiving payments

## Resources

- [thirdweb Documentation](https://portal.thirdweb.com/)
- [thirdweb API Reference](https://portal.thirdweb.com/api-reference)
- [thirdweb Dashboard](https://thirdweb.com/dashboard)
- [Blockchain Explorers](https://etherscan.io/)

## Support

For issues with thirdweb integration:
1. Check thirdweb documentation
2. Review API logs in browser console
3. Contact thirdweb support
4. Check thirdweb Discord community
