# Thirdweb SDK Migration - Quick Start Guide

## Why Migrate?

You're currently using **lucide-react** for icons and **manual API calls** for blockchain interactions. Thirdweb provides:

- ✅ **Pre-built React components** (ConnectWallet, Web3Button, etc.)
- ✅ **React hooks** for all blockchain operations
- ✅ **Automatic error handling** and loading states
- ✅ **80% less code** to maintain
- ✅ **Production-ready** UI components

---

## Step 1: Install Thirdweb React SDK

```bash
cd /Users/priyanshum/Developer/Kodu/Kodu-test/kodu
npm install @thirdweb-dev/react @thirdweb-dev/sdk ethers@^5
```

---

## Step 2: Wrap Your App with ThirdwebProvider

**File: `src/main.tsx` or `src/App.tsx`**

```typescript
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Base, Ethereum, Polygon } from "@thirdweb-dev/chains";

// Add this wrapper OUTSIDE your other providers
function App() {
  return (
    <ThirdwebProvider
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
      activeChain={Base}
      supportedChains={[Base, Ethereum, Polygon]}
    >
      <ThemeProvider>
        <PaymentModeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PaymentModeProvider>
      </ThemeProvider>
    </ThirdwebProvider>
  );
}
```

---

## Step 3: Replace ConnectButton (Easiest Win!)

### Before (100+ lines of custom code):
```typescript
// src/components/auth/ConnectButton.tsx
import { Wallet } from 'lucide-react';

const ConnectButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  // ... 100+ lines of wallet connection logic
  
  return (
    <button onClick={handleConnect}>
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  );
};
```

### After (1 line!):
```typescript
// src/components/auth/ConnectButton.tsx
import { ConnectWallet } from "@thirdweb-dev/react";

const ConnectButton = () => {
  return (
    <ConnectWallet
      theme="light"
      btnTitle="Connect Wallet"
      modalTitle="Choose Your Wallet"
      switchToActiveChain={true}
    />
  );
};
```

**Result:** Delete 100+ lines, get better UX! ✨

---

## Step 4: Update Balance Display

### Before (Manual API calls):
```typescript
// src/components/payments/BalanceDisplay.tsx
import { getWalletBalance } from '../../utils/thirdwebAPI';

const BalanceDisplay = () => {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const result = await getWalletBalance(address, chainId, tokenAddress);
        setBalance(result.value);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, [address, chainId, tokenAddress]);
  
  return <div>{isLoading ? 'Loading...' : balance}</div>;
};
```

### After (With hooks):
```typescript
// src/components/payments/BalanceDisplay.tsx
import { useTokenBalance, useAddress, useContract } from "@thirdweb-dev/react";

const BalanceDisplay = ({ tokenAddress }: { tokenAddress: string }) => {
  const address = useAddress();
  const { contract } = useContract(tokenAddress);
  const { data: balance, isLoading } = useTokenBalance(contract, address);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {balance?.displayValue} {balance?.symbol}
    </div>
  );
};
```

**Result:** Automatic caching, error handling, and type safety! 🎯

---

## Step 5: Update Send Payment

### Before (Complex transaction handling):
```typescript
// src/components/payments/SendPayment.tsx
const handleSend = async () => {
  setIsLoading(true);
  try {
    const result = await sendTokens(
      fromAddress,
      toAddress,
      amount,
      tokenAddress,
      chainId,
      userToken
    );
    // Manual status checking
    // Manual error handling
    // Manual success notification
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

return (
  <button onClick={handleSend} disabled={isLoading}>
    {isLoading ? 'Sending...' : 'Send Payment'}
  </button>
);
```

### After (With Web3Button):
```typescript
// src/components/payments/SendPayment.tsx
import { Web3Button, useContract } from "@thirdweb-dev/react";

const SendPayment = ({ recipient, amount, tokenAddress }) => {
  return (
    <Web3Button
      contractAddress={tokenAddress}
      action={async (contract) => {
        await contract.erc20.transfer(recipient, amount);
      }}
      onSuccess={(result) => {
        console.log("✅ Payment sent!", result);
        // Show success message
      }}
      onError={(error) => {
        console.error("❌ Payment failed:", error);
        // Show error message
      }}
    >
      Send Payment
    </Web3Button>
  );
};
```

**Result:** Automatic loading states, error handling, and transaction tracking! 🚀

---

## Step 6: Update AuthContext

### Before (Manual wallet management):
```typescript
// src/context/AuthContext.tsx
const [walletAddress, setWalletAddress] = useState<string | null>(null);
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  // Manual wallet detection
  // Manual connection status tracking
  // Manual account change listening
}, []);
```

### After (With hooks):
```typescript
// src/context/AuthContext.tsx
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";

const AuthProvider = ({ children }) => {
  const address = useAddress(); // Automatically updates!
  const connectionStatus = useConnectionStatus();
  const isConnected = connectionStatus === "connected";
  
  // That's it! No manual tracking needed
  
  return (
    <AuthContext.Provider value={{ address, isConnected }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Result:** Automatic updates, no manual listeners! 🎉

---

## Quick Wins Checklist

### Immediate (Do in 30 minutes):
- [ ] Install thirdweb React SDK
- [ ] Add ThirdwebProvider to app root
- [ ] Replace ConnectButton component

### Today (Do in 2 hours):
- [ ] Update balance fetching to use `useTokenBalance()`
- [ ] Update AuthContext to use `useAddress()` and `useConnectionStatus()`
- [ ] Test wallet connection and balance display

### This Week:
- [ ] Migrate payment sending to `Web3Button`
- [ ] Update transaction history with thirdweb hooks
- [ ] Replace manual API calls in `thirdwebAPI.ts`

---

## Common Patterns

### Pattern 1: Get Wallet Address
```typescript
// Before
const { walletAddress } = useAuth();

// After
import { useAddress } from "@thirdweb-dev/react";
const address = useAddress();
```

### Pattern 2: Check Connection Status
```typescript
// Before
const { isConnected } = useAuth();

// After
import { useConnectionStatus } from "@thirdweb-dev/react";
const status = useConnectionStatus();
const isConnected = status === "connected";
```

### Pattern 3: Get Token Balance
```typescript
// Before
const balance = await getWalletBalance(address, chainId, tokenAddress);

// After
import { useTokenBalance, useContract } from "@thirdweb-dev/react";
const { contract } = useContract(tokenAddress);
const { data: balance } = useTokenBalance(contract, address);
```

### Pattern 4: Send Transaction
```typescript
// Before
await sendTokens(from, to, amount, token, chain, userToken);

// After
import { Web3Button } from "@thirdweb-dev/react";
<Web3Button
  contractAddress={tokenAddress}
  action={(contract) => contract.erc20.transfer(to, amount)}
>
  Send
</Web3Button>
```

### Pattern 5: Switch Chain
```typescript
// Before
// Manual chain switching logic

// After
import { useSwitchChain } from "@thirdweb-dev/react";
const switchChain = useSwitchChain();
await switchChain(137); // Switch to Polygon
```

---

## Benefits Summary

| Feature | Before (Manual) | After (Thirdweb SDK) |
|---------|----------------|---------------------|
| **Code Lines** | 1000+ lines | 200 lines |
| **Wallet Connection** | Custom implementation | `<ConnectWallet />` |
| **Balance Fetching** | Manual API calls | `useTokenBalance()` |
| **Transactions** | Complex error handling | `<Web3Button />` |
| **Loading States** | Manual management | Automatic |
| **Error Handling** | Manual try/catch | Built-in |
| **Type Safety** | Partial | Full TypeScript |
| **Maintenance** | High | Low |
| **UX Quality** | Good | Excellent |

---

## Migration Priority

### 🔴 High Priority (Do First)
1. **ConnectButton** - Easiest win, biggest impact
2. **Balance Display** - Core feature, simple migration
3. **AuthContext** - Foundation for everything else

### 🟡 Medium Priority (Do Next)
4. **Send Payment** - Important feature, moderate complexity
5. **Transaction History** - Nice to have, good UX improvement
6. **Chain Switching** - Better multi-chain support

### 🟢 Low Priority (Do Later)
7. **Icon Replacements** - Cosmetic, can keep lucide-react
8. **Styling Updates** - Match thirdweb design system
9. **Advanced Features** - Swaps, NFTs, etc.

---

## Testing Checklist

After each migration step, test:

- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Transactions send properly
- [ ] Error messages show appropriately
- [ ] Loading states work
- [ ] Mobile responsive
- [ ] Dark mode compatible

---

## Need Help?

### Thirdweb Resources
- 📚 [Thirdweb React SDK Docs](https://portal.thirdweb.com/react)
- 🎥 [Video Tutorials](https://www.youtube.com/c/thirdweb)
- 💬 [Discord Community](https://discord.gg/thirdweb)
- 📖 [Example Apps](https://github.com/thirdweb-example)

### Your Documentation
- `THIRDWEB_OPTIMIZATION.md` - Detailed analysis
- `THIRDWEB_INTEGRATION.md` - Original integration guide
- `IMPLEMENTATION_SUMMARY.md` - Current state

---

## Quick Start Command

```bash
# Install SDK
npm install @thirdweb-dev/react @thirdweb-dev/sdk ethers@^5

# Start dev server
npm run dev

# Test the changes!
```

---

**Ready to migrate? Start with Step 1 and you'll have a better, more maintainable app in no time!** 🚀
