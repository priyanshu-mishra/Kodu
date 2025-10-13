# Kodu - Developer Guide

## 📋 Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Service Layer Documentation](#service-layer-documentation)
5. [Component Documentation](#component-documentation)
6. [Database Operations](#database-operations)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

---

## Setup & Installation

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0 or yarn >= 1.22.0
Git
```

### Environment Setup

1. **Clone the Repository**
```bash
git clone https://github.com/priyanshu-mishra/Kodu.git
cd Kodu
```

2. **Install Dependencies**
```bash
yarn install
# or
npm install
```

3. **Configure Environment Variables**

Create `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your-client-id-here
VITE_THIRDWEB_SECRET_KEY=your-secret-key-here

# Application Configuration
VITE_APP_NAME=Kodu
VITE_APP_ENV=development
```

4. **Initialize Database**

Run the database schema in Supabase SQL Editor:
```bash
# Copy contents of sql/supabase-schema.sql
# Paste and run in Supabase SQL Editor
```

5. **Initialize EUR Accounts**
```bash
npm run init-eur-accounts
```

6. **Verify Database Setup**
```bash
npm run verify-db
```

7. **Start Development Server**
```bash
yarn dev
# or
npm run dev
```

Application will be available at `http://localhost:5173`

---

## Project Structure

```
kodudev/
├── public/                    # Static assets
│   ├── clear-demo.html       # Demo mode clearer tool
│   └── ...
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ConnectButton.tsx
│   │   │   └── UsernameSetup.tsx
│   │   ├── payments/        # Payment components
│   │   │   ├── UnifiedSendPayment.tsx
│   │   │   ├── UnifiedPaymentConfirm.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   ├── EnhancedBalanceDisplay.tsx
│   │   │   └── PaymentConfirm.tsx (crypto only)
│   │   ├── profile/         # Profile components
│   │   │   ├── UserProfile.tsx
│   │   │   ├── BankAccountList.tsx
│   │   │   └── AddBankAccountModal.tsx
│   │   ├── transactions/    # Transaction components
│   │   │   ├── TransactionHistory.tsx
│   │   │   └── TransactionDetails.tsx
│   │   ├── users/           # User components
│   │   │   └── UserSearch.tsx
│   │   └── ui/              # Reusable UI components
│   │       ├── Layout.tsx
│   │       ├── QRCodeDisplay.tsx
│   │       ├── TokenChainSelector.tsx
│   │       └── ...
│   ├── services/            # Business logic services
│   │   ├── eurAccountService.ts
│   │   ├── transactionService.ts
│   │   ├── bankAccountService.ts
│   │   └── paymentOrchestrator.ts
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── PaymentModeContext.tsx
│   ├── utils/               # Utility functions
│   │   ├── supabase.ts
│   │   ├── thirdwebAPI.ts
│   │   └── contracts.ts
│   ├── config/              # Configuration files
│   │   └── thirdweb.ts
│   ├── types/               # TypeScript type definitions
│   │   └── database.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── sql/                     # Database schemas
│   └── supabase-schema.sql
├── scripts/                 # Utility scripts
│   ├── init-eur-accounts.js
│   └── verify-database.js
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # TailwindCSS configuration
```

---

## Development Workflow

### Branch Strategy

```
main          # Production-ready code
  ├── develop # Development branch
  │   ├── feature/payment-system
  │   ├── feature/bank-accounts
  │   └── bugfix/auth-issue
  └── test    # Testing branch
```

### Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
```bash
# Edit files
# Test locally
```

3. **Commit Changes**
```bash
git add .
git commit -m "feat: Add your feature description"
```

4. **Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## Service Layer Documentation

### EurAccountService

**Location**: `src/services/eurAccountService.ts`

**Purpose**: Manage EUR account operations and balances

#### Methods

```typescript
// Get or create EUR account for user
static async getOrCreateUserEurAccount(userId: string): Promise<EurAccount>

// Get user's EUR balance
static async getUserEurBalance(userId: string): Promise<{ balance: string; available: string }>

// Check if user has sufficient balance
static async hasSufficientBalance(userId: string, amount: string): Promise<boolean>

// Update account balance
static async updateBalance(accountId: string, newBalance: string, newAvailableBalance: string): Promise<void>

// Transfer EUR between accounts (atomic)
static async transferBetweenAccounts(fromAccountId: string, toAccountId: string, amount: string): Promise<void>

// Add funds to account (for testing)
static async addFunds(userId: string, amount: string): Promise<void>
```

#### Usage Example

```typescript
import { EurAccountService } from './services/eurAccountService';

// Get or create EUR account
const account = await EurAccountService.getOrCreateUserEurAccount(userId);

// Check balance
const { balance, available } = await EurAccountService.getUserEurBalance(userId);
console.log(`Balance: €${balance}, Available: €${available}`);

// Check sufficient funds
const hasFunds = await EurAccountService.hasSufficientBalance(userId, '50.00');
if (!hasFunds) {
  throw new Error('Insufficient balance');
}

// Transfer between accounts
await EurAccountService.transferBetweenAccounts(
  fromAccountId,
  toAccountId,
  '25.00'
);
```

---

### TransactionService

**Location**: `src/services/transactionService.ts`

**Purpose**: Create and manage transactions for all payment types

#### Methods

```typescript
// Create EUR internal transaction
static async createEurInternalTransaction(
  fromUserId: string,
  toUserId: string,
  amount: string,
  message?: string
): Promise<Transaction>

// Create bank transfer transaction
static async createBankTransferTransaction(
  fromUserId: string,
  toUserId: string,
  fromBankAccountId: string,
  toBankAccountId: string,
  amount: string,
  message?: string
): Promise<Transaction>

// Create crypto transaction
static async createCryptoTransaction(
  fromUserId: string,
  toUserId: string,
  fromAddress: string,
  toAddress: string,
  amount: string,
  tokenContract: string,
  tokenSymbol: string,
  chainId: number,
  message?: string,
  thirdwebTransactionId?: string
): Promise<Transaction>

// Update transaction status
static async updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  transactionHash?: string
): Promise<void>

// Get transaction by ID
static async getTransaction(transactionId: string): Promise<Transaction | null>

// Get user's transactions
static async getUserTransactions(userId: string): Promise<Transaction[]>
```

#### Usage Example

```typescript
import { TransactionService } from './services/transactionService';

// EUR internal transfer
const transaction = await TransactionService.createEurInternalTransaction(
  senderId,
  recipientId,
  '50.00',
  'Lunch money'
);
console.log('Transaction created:', transaction.id);

// Bank transfer
const bankTx = await TransactionService.createBankTransferTransaction(
  senderId,
  recipientId,
  senderBankAccountId,
  recipientBankAccountId,
  '100.00',
  'Invoice payment'
);

// Update status
await TransactionService.updateTransactionStatus(
  transaction.id,
  'SETTLED'
);

// Get user transactions
const transactions = await TransactionService.getUserTransactions(userId);
```

---

### BankAccountService

**Location**: `src/services/bankAccountService.ts`

**Purpose**: Manage user bank accounts

#### Methods

```typescript
// Create bank account
static async createBankAccount(
  userId: string,
  request: CreateBankAccountRequest
): Promise<BankAccount>

// Get user's bank accounts
static async getUserBankAccounts(userId: string): Promise<BankAccount[]>

// Get bank account by ID
static async getBankAccount(accountId: string): Promise<BankAccount | null>

// Set primary bank account
static async setPrimaryBankAccount(accountId: string, userId: string): Promise<void>

// Delete bank account
static async deleteBankAccount(accountId: string, userId: string): Promise<void>

// Get account display name
static getAccountDisplayName(account: BankAccount): string

// Get masked account number
static getMaskedAccountNumber(account: BankAccount): string
```

#### Usage Example

```typescript
import { BankAccountService } from './services/bankAccountService';

// Create bank account
const account = await BankAccountService.createBankAccount(userId, {
  bank_name: 'Deutsche Bank',
  account_holder_name: 'John Doe',
  account_type: 'CHECKING',
  iban: 'DE89370400440532013000',
  currency: 'EUR',
  country: 'DE',
  is_primary: true
});

// Get user's accounts
const accounts = await BankAccountService.getUserBankAccounts(userId);

// Set primary
await BankAccountService.setPrimaryBankAccount(accountId, userId);

// Get masked number
const masked = BankAccountService.getMaskedAccountNumber(account);
// Returns: "DE89 **** **** **** **3000"
```

---

## Component Documentation

### UnifiedPaymentConfirm

**Location**: `src/components/payments/UnifiedPaymentConfirm.tsx`

**Purpose**: Handle payment confirmation for all payment types

#### Props

```typescript
interface UnifiedPaymentConfirmProps {
  paymentData: UnifiedPaymentData | PaymentData;
  onBack: () => void;
  onSuccess: () => void;
}
```

#### Payment Data Types

```typescript
interface UnifiedPaymentData {
  recipient: User;
  amount: string;
  message: string;
  paymentMethod: 'eur_internal' | 'bank_transfer' | 'crypto';
  
  // For crypto payments
  token?: TokenContract;
  amountWei?: string;
  
  // For bank transfers
  fromBankAccountId?: string;
  toBankAccountId?: string;
}
```

#### Usage

```typescript
import UnifiedPaymentConfirm from './components/payments/UnifiedPaymentConfirm';

<UnifiedPaymentConfirm
  paymentData={paymentData}
  onBack={() => setStep('form')}
  onSuccess={() => {
    setStep('success');
    navigate('/activity');
  }}
/>
```

#### Flow

1. Receives payment data
2. Determines payment type (EUR, bank, crypto)
3. For crypto: Delegates to `PaymentConfirm` component
4. For EUR/bank: Handles confirmation internally
5. Executes payment via appropriate service
6. Shows status (processing, success, failed)
7. Calls `onSuccess` when complete

---

### UnifiedSendPayment

**Location**: `src/components/payments/UnifiedSendPayment.tsx`

**Purpose**: Payment form with method selection

#### Props

```typescript
interface UnifiedSendPaymentProps {
  recipient: User;
  onBack: () => void;
  onPaymentConfirm: (paymentData: UnifiedPaymentData) => void;
}
```

#### Features

- Payment method selector (EUR, bank, crypto)
- Amount input with quick amounts
- Message input
- Token/chain selector (for crypto)
- Bank account selector (for bank transfers)
- Balance display
- Validation

#### Usage

```typescript
<UnifiedSendPayment
  recipient={selectedUser}
  onBack={() => setFlow('search')}
  onPaymentConfirm={(data) => {
    setPaymentData(data);
    setFlow('confirm');
  }}
/>
```

---

### BankAccountList

**Location**: `src/components/profile/BankAccountList.tsx`

**Purpose**: Display and manage user's bank accounts

#### Props

```typescript
interface BankAccountListProps {
  userId: string;
}
```

#### Features

- List all bank accounts
- Add new account (opens modal)
- Set primary account
- Delete account
- Show account status badges
- Masked account numbers for security

#### Usage

```typescript
<BankAccountList userId={user.id} />
```

---

### AddBankAccountModal

**Location**: `src/components/profile/AddBankAccountModal.tsx`

**Purpose**: Modal for adding new bank account

#### Props

```typescript
interface AddBankAccountModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

#### Features

- Toggle between IBAN and Account Number input
- Validate required fields
- Support for multiple currencies
- Nickname for easy identification
- Set as primary option

#### Usage

```typescript
{showModal && (
  <AddBankAccountModal
    userId={user.id}
    onClose={() => setShowModal(false)}
    onSuccess={() => {
      setShowModal(false);
      loadBankAccounts();
    }}
  />
)}
```

---

## Database Operations

### Direct Supabase Queries

#### Get User by Wallet Address

```typescript
import { supabase } from './utils/supabase';

const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('wallet_address', walletAddress)
  .single();
```

#### Create Transaction

```typescript
const { data: transaction, error } = await supabase
  .from('transactions')
  .insert({
    from_user_id: senderId,
    to_user_id: recipientId,
    amount_eur: '50.00',
    mode: 'EUR_INTERNAL',
    status: 'PENDING',
    message: 'Payment message'
  })
  .select()
  .single();
```

#### Get User Transactions

```typescript
const { data: transactions, error } = await supabase
  .from('transactions')
  .select('*')
  .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

#### Update Account Balance

```typescript
const { error } = await supabase
  .from('accounts')
  .update({
    balance: newBalance,
    available_balance: newAvailableBalance,
    updated_at: new Date().toISOString()
  })
  .eq('id', accountId);
```

---

### Database Migrations

When adding new features that require database changes:

1. **Create Migration SQL**
```sql
-- migrations/001_add_feature.sql
ALTER TABLE users ADD COLUMN new_field TEXT;
CREATE INDEX idx_users_new_field ON users(new_field);
```

2. **Run in Supabase SQL Editor**
- Go to Supabase Dashboard
- Navigate to SQL Editor
- Paste and run migration
- Test changes

3. **Update TypeScript Types**
```typescript
// src/types/database.ts
export interface User {
  // ... existing fields
  new_field?: string;
}
```

---

## API Integration

### Thirdweb API

#### Authentication

```typescript
import { sendLoginCode, verifyLoginCode } from './utils/thirdwebAPI';

// Send OTP code
await sendLoginCode(email, clientId);

// Verify code
const result = await verifyLoginCode(email, code, clientId);
const { walletAddress, token } = result;
```

#### Payments

```typescript
import { createPayment, completePayment } from './utils/thirdwebAPI';

// Create payment
const payment = await createPayment(
  'Payment to @username',
  'Description',
  recipientAddress,
  tokenAddress,
  amountWei,
  chainId,
  authToken
);

// Complete payment
const result = await completePayment(
  payment.id,
  senderAddress,
  authToken
);
```

#### Get Balance

```typescript
import { getWalletBalance } from './utils/thirdwebAPI';

const balance = await getWalletBalance(
  walletAddress,
  chainId,
  tokenAddress
);
```

---

### Error Handling

#### Service Layer Errors

```typescript
try {
  await TransactionService.createEurInternalTransaction(...);
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    // Handle insufficient balance
  } else if (error.message.includes('User not found')) {
    // Handle user not found
  } else {
    // Handle generic error
    console.error('Transaction failed:', error);
  }
}
```

#### API Errors

```typescript
try {
  const result = await thirdwebAPI.call();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
    handleTokenExpiration();
  } else if (error.response?.status === 402) {
    // Handle insufficient funds
    showInsufficientFundsModal();
  } else {
    // Handle other errors
    showErrorMessage(error.message);
  }
}
```

---

## Testing

### Unit Tests (Future)

```typescript
// src/services/__tests__/eurAccountService.test.ts
import { EurAccountService } from '../eurAccountService';

describe('EurAccountService', () => {
  it('should create EUR account', async () => {
    const account = await EurAccountService.getOrCreateUserEurAccount(userId);
    expect(account).toBeDefined();
    expect(account.currency).toBe('EUR');
  });

  it('should check sufficient balance', async () => {
    const hasFunds = await EurAccountService.hasSufficientBalance(userId, '50.00');
    expect(hasFunds).toBe(true);
  });
});
```

### Integration Tests (Future)

```typescript
// src/__tests__/payment-flow.test.ts
describe('Payment Flow', () => {
  it('should complete EUR internal payment', async () => {
    // Create users
    // Add EUR balance
    // Send payment
    // Verify balances updated
    // Verify transaction created
  });
});
```

### Manual Testing

```bash
# Start dev server
yarn dev

# Test EUR internal payment
1. Log in as User A
2. Navigate to Send
3. Search for User B
4. Select EUR Internal
5. Enter amount
6. Confirm payment
7. Verify success
8. Check balances
9. Check transaction history

# Test bank transfer
1. Add bank accounts for both users
2. Send bank transfer
3. Verify transaction created with bank IDs
4. Check transaction status

# Test crypto payment
1. Connect wallet
2. Send crypto payment
3. Approve in wallet
4. Verify on-chain transaction
5. Check transaction history
```

---

## Deployment

### Build for Production

```bash
# Build application
yarn build

# Preview production build
yarn preview
```

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://production.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_THIRDWEB_CLIENT_ID=production-client-id
VITE_APP_ENV=production
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
yarn build

# Deploy
netlify deploy --prod --dir=dist
```

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with conventional commits
5. Push to GitHub
6. Create Pull Request
7. Request review
8. Address feedback
9. Merge when approved

### Code Review Checklist

- [ ] Code follows style guide
- [ ] No console.log statements (use proper logging)
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Comments added where needed
- [ ] No hardcoded values
- [ ] Environment variables used correctly
- [ ] Tests pass (when implemented)
- [ ] Documentation updated

---

## Debugging

### Browser DevTools

```javascript
// Check auth state
console.log(localStorage.getItem('wallet_address'));
console.log(localStorage.getItem('mock_user'));

// Check Supabase connection
import { supabase } from './utils/supabase';
const { data, error } = await supabase.from('users').select('count');
console.log('Users count:', data);

// Check EUR balance
import { EurAccountService } from './services/eurAccountService';
const balance = await EurAccountService.getUserEurBalance(userId);
console.log('Balance:', balance);
```

### Common Debug Commands

```bash
# Verify database
npm run verify-db

# Check EUR accounts
npm run init-eur-accounts

# Clear demo mode
# Visit: http://localhost:5173/clear-demo.html

# Check git status
git status

# View recent commits
git log --oneline -10
```

---

## Performance Optimization

### React Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Query Optimization

```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data: transactions } = useQuery({
  queryKey: ['transactions', userId],
  queryFn: () => TransactionService.getUserTransactions(userId),
  staleTime: 30000, // 30 seconds
});
```

---

## Security Best Practices

1. **Never commit sensitive data**
   - Use `.env` for secrets
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Validate user input**
   - Sanitize inputs
   - Validate amounts
   - Check permissions

3. **Use Row Level Security**
   - Enable RLS on all tables
   - Users can only access their own data
   - Admin role for special operations

4. **Secure API calls**
   - Use authentication tokens
   - Check token expiration
   - Handle 401 errors

5. **Protect sensitive data**
   - Mask bank account numbers
   - Don't log sensitive information
   - Use HTTPS only

---

## Useful Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "verify-db": "node verify-database.js",
    "init-eur-accounts": "node init-eur-accounts.js"
  }
}
```

---

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Thirdweb Documentation](https://portal.thirdweb.com)

### Tools
- [VS Code](https://code.visualstudio.com)
- [GitHub Desktop](https://desktop.github.com)
- [Postman](https://www.postman.com) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## Conclusion

This developer guide covers the essential aspects of working with the Kodu codebase. For questions or issues, refer to the documentation or create an issue on GitHub.

Happy coding! 🚀
