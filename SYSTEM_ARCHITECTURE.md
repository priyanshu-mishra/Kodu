# Kodu - System Architecture & Design

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Payment System Design](#payment-system-design)
6. [Authentication Flow](#authentication-flow)
7. [Security & Data Flow](#security--data-flow)
8. [API Integration](#api-integration)

---

## Overview

**Kodu** is a modern P2P payment application that supports multiple payment methods:
- **EUR Internal Transfers**: Instant peer-to-peer transfers using internal EUR balances
- **Bank Transfers**: Traditional bank-to-bank transfers with proper account linking
- **Crypto Payments**: On-chain cryptocurrency payments via Thirdweb SDK

### Key Features
- Multi-payment method support (EUR, Bank, Crypto)
- Real-time balance management
- Transaction history and tracking
- Bank account management
- Wallet integration (MetaMask, Coinbase, etc.)
- Email-based authentication
- QR code payments
- User search and discovery

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + TypeScript + Vite + TailwindCSS + Thirdweb React  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  • EurAccountService     • TransactionService               │
│  • BankAccountService    • PaymentOrchestrator              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Supabase        │    │  Thirdweb API    │
│  (PostgreSQL)    │    │  (Blockchain)    │
│  • Users         │    │  • Payments      │
│  • Accounts      │    │  • Transactions  │
│  • Transactions  │    │  • Wallet Auth   │
│  • Bank Accounts │    │  • Token Mgmt    │
└──────────────────┘    └──────────────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── ConnectButton.tsx
│   │   └── UsernameSetup.tsx
│   ├── payments/          # Payment components
│   │   ├── UnifiedSendPayment.tsx
│   │   ├── UnifiedPaymentConfirm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── EnhancedBalanceDisplay.tsx
│   ├── profile/           # User profile components
│   │   ├── UserProfile.tsx
│   │   ├── BankAccountList.tsx
│   │   └── AddBankAccountModal.tsx
│   ├── transactions/      # Transaction components
│   │   ├── TransactionHistory.tsx
│   │   └── TransactionDetails.tsx
│   └── ui/               # Reusable UI components
│       ├── Layout.tsx
│       ├── QRCodeDisplay.tsx
│       └── TokenChainSelector.tsx
├── services/             # Business logic services
│   ├── eurAccountService.ts
│   ├── transactionService.ts
│   ├── bankAccountService.ts
│   └── paymentOrchestrator.ts
├── context/              # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── PaymentModeContext.tsx
├── utils/                # Utility functions
│   ├── supabase.ts
│   ├── thirdwebAPI.ts
│   └── contracts.ts
└── config/               # Configuration
    └── thirdweb.ts
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Lucide React (icons)
- **State Management**: React Context API
- **Routing**: Single Page Application (SPA)

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Thirdweb Auth + Email OTP
- **Blockchain**: Thirdweb SDK v4
- **API Client**: Supabase JS Client
- **Query Management**: TanStack React Query

### Blockchain Integration
- **SDK**: Thirdweb SDK v4
- **Supported Chains**: Ethereum, Polygon, Base
- **Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect
- **Tokens**: USDC, USDT, ETH, MATIC

---

## Database Schema

### Core Tables

#### 1. **users**
Primary user information table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  wallet_address TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store user profiles and authentication data  
**Key Fields**: 
- `wallet_address`: Blockchain wallet address
- `email`: For email-based authentication
- `username`: Unique identifier for user search

#### 2. **accounts**
User account balances (EUR and crypto).

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_type account_type NOT NULL,  -- 'USER_EUR', 'USER_CRYPTO'
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  available_balance DECIMAL(20, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_type, currency)
);
```

**Purpose**: Track user balances for different currencies  
**Key Fields**:
- `balance`: Total balance
- `available_balance`: Balance available for transactions
- `account_type`: Type of account (EUR or CRYPTO)

#### 3. **bank_accounts**
User's linked bank accounts.

```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type bank_account_type NOT NULL DEFAULT 'CHECKING',
  status bank_account_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  
  -- Bank details
  bank_name TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  iban TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_bic TEXT,
  
  -- Additional info
  currency TEXT NOT NULL DEFAULT 'EUR',
  country TEXT NOT NULL DEFAULT 'EU',
  is_primary BOOLEAN DEFAULT FALSE,
  nickname TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT bank_account_identifier_check CHECK (
    iban IS NOT NULL OR 
    (account_number IS NOT NULL AND routing_number IS NOT NULL)
  )
);
```

**Purpose**: Store user's bank account information  
**Key Fields**:
- `iban` OR `account_number + routing_number`: Account identifiers
- `is_primary`: Default account for transfers
- `status`: Verification status

#### 4. **transactions**
All payment transactions.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_id TEXT UNIQUE,
  
  -- Participants
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  
  -- Bank transfer references
  from_bank_account_id UUID REFERENCES bank_accounts(id),
  to_bank_account_id UUID REFERENCES bank_accounts(id),
  
  -- Amounts
  amount_eur DECIMAL(20, 6),
  amount_token DECIMAL(20, 6),
  token_symbol TEXT,
  token_contract TEXT,
  chain_id INTEGER,
  
  -- Payment details
  mode payment_mode NOT NULL,  -- 'EUR_INTERNAL', 'BANK_TRANSFER', 'ONCHAIN_DIRECT'
  status transaction_status NOT NULL DEFAULT 'PENDING',
  message TEXT,
  
  -- Blockchain data
  from_address TEXT,
  to_address TEXT,
  onchain_tx_hash TEXT,
  thirdweb_transaction_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Purpose**: Record all payment transactions  
**Key Fields**:
- `mode`: Payment method (EUR_INTERNAL, BANK_TRANSFER, ONCHAIN_DIRECT)
- `status`: Transaction status (PENDING, SETTLED, FAILED)
- Bank account references for bank transfers
- Blockchain data for crypto transactions

#### 5. **ledger_entries**
Double-entry bookkeeping for EUR transactions.

```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL,
  entry_type ledger_entry_type NOT NULL,  -- 'DEBIT', 'CREDIT'
  status ledger_entry_status NOT NULL DEFAULT 'PENDING',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**: Maintain audit trail for EUR transfers  
**Key Fields**:
- `entry_type`: DEBIT (outgoing) or CREDIT (incoming)
- `account_id`: Reference to EUR account

### Enums

```sql
CREATE TYPE account_type AS ENUM ('USER_EUR', 'USER_CRYPTO', 'SYSTEM_RESERVE');
CREATE TYPE bank_account_type AS ENUM ('CHECKING', 'SAVINGS', 'BUSINESS');
CREATE TYPE bank_account_status AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE payment_mode AS ENUM ('EUR_INTERNAL', 'BANK_TRANSFER', 'CRYPTO_TO_FIAT', 'ONCHAIN_DIRECT');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SETTLED', 'FAILED', 'CANCELLED');
CREATE TYPE ledger_entry_type AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE ledger_entry_status AS ENUM ('PENDING', 'SETTLED', 'REVERSED');
```

---

## Payment System Design

### Payment Flow Architecture

```
User Initiates Payment
         │
         ▼
┌────────────────────┐
│ Payment Method     │
│ Selection          │
└────────┬───────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    ▼         ▼            ▼              ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌────────────┐
│ EUR    │ │ Bank │ │  Crypto  │ │   Other    │
│Internal│ │Transfer│ │ Payment  │ │  Methods   │
└───┬────┘ └───┬──┘ └────┬─────┘ └─────┬──────┘
    │          │         │              │
    ▼          ▼         ▼              ▼
┌─────────────────────────────────────────────┐
│      Transaction Service Layer              │
│  • Validate                                 │
│  • Create Transaction Record                │
│  • Execute Payment                          │
│  • Update Balances                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Transaction  │
         │   Complete    │
         └───────────────┘
```

### Payment Methods

#### 1. EUR Internal Transfer
**Flow**:
1. User selects recipient and amount
2. System checks sender's EUR balance
3. Creates transaction record with `mode='EUR_INTERNAL'`
4. Atomically transfers funds between EUR accounts
5. Creates ledger entries (DEBIT sender, CREDIT recipient)
6. Marks transaction as SETTLED
7. Updates both users' balances

**Characteristics**:
- ⚡ Instant settlement
- 💰 No fees
- 🔒 Internal to Kodu platform
- ✅ Guaranteed execution

#### 2. Bank Transfer
**Flow**:
1. User selects their bank account
2. User selects recipient's bank account
3. Creates transaction with `mode='BANK_TRANSFER'`
4. Links `from_bank_account_id` and `to_bank_account_id`
5. Transaction status: PENDING
6. (Future) External bank API processes transfer
7. (Future) Webhook updates status to SETTLED

**Characteristics**:
- 🕐 1-3 business days
- 💵 Bank fees may apply
- 🏦 Traditional banking rails
- 📋 Requires verification

#### 3. Crypto Payment
**Flow**:
1. User selects network (Ethereum, Polygon, Base)
2. User selects token (USDC, USDT, ETH, etc.)
3. Creates transaction with `mode='ONCHAIN_DIRECT'`
4. Thirdweb SDK creates payment intent
5. User approves transaction in wallet
6. Transaction broadcast to blockchain
7. System monitors for confirmations
8. Updates status to SETTLED when confirmed

**Characteristics**:
- ⛓️ On-chain settlement
- ⚡ 1-5 minutes
- ⛽ Gas fees apply
- 🌐 Global, permissionless

### Service Layer Design

#### EurAccountService
**Responsibilities**:
- Create/retrieve EUR accounts
- Check balances
- Validate sufficient funds
- Transfer between accounts
- Add/remove funds

**Key Methods**:
```typescript
getOrCreateUserEurAccount(userId: string): Promise<EurAccount>
getUserEurBalance(userId: string): Promise<{ balance, available }>
hasSufficientBalance(userId: string, amount: string): Promise<boolean>
transferBetweenAccounts(fromId, toId, amount): Promise<void>
```

#### TransactionService
**Responsibilities**:
- Create transactions for all payment types
- Update transaction status
- Retrieve transaction history
- Handle transaction lifecycle

**Key Methods**:
```typescript
createEurInternalTransaction(fromUserId, toUserId, amount, message)
createBankTransferTransaction(fromUserId, toUserId, fromBankId, toBankId, amount)
createCryptoTransaction(fromUserId, toUserId, tokenData, amount)
updateTransactionStatus(transactionId, status, txHash)
getUserTransactions(userId): Promise<Transaction[]>
```

#### BankAccountService
**Responsibilities**:
- CRUD operations for bank accounts
- Set primary account
- Validate account data
- Mask sensitive information

**Key Methods**:
```typescript
createBankAccount(userId, accountData): Promise<BankAccount>
getUserBankAccounts(userId): Promise<BankAccount[]>
setPrimaryBankAccount(accountId, userId): Promise<void>
deleteBankAccount(accountId, userId): Promise<void>
getMaskedAccountNumber(account): string
```

---

## Authentication Flow

### Multi-Method Authentication

Kodu supports two authentication methods:

#### 1. Wallet Authentication (Web3)
```
User clicks "Connect Wallet"
         │
         ▼
Thirdweb ConnectWallet Modal
         │
         ▼
User selects wallet (MetaMask, Coinbase, etc.)
         │
         ▼
Wallet connection established
         │
         ▼
Get wallet address
         │
         ▼
Check if user exists in database
         │
    ┌────┴────┐
    ▼         ▼
Existing   New User
User       │
    │      ▼
    │   Create user record
    │   with wallet address
    │      │
    └──────┴──────┐
                  ▼
          Check username
                  │
            ┌─────┴─────┐
            ▼           ▼
        Has         No Username
      Username          │
            │           ▼
            │    Show Username Setup
            │           │
            └───────────┴──────┐
                               ▼
                        Authenticated
                               │
                               ▼
                        Redirect to App
```

#### 2. Email Authentication (Web2)
```
User enters email
         │
         ▼
Request OTP code via Thirdweb API
         │
         ▼
User receives 6-digit code
         │
         ▼
User enters code
         │
         ▼
Verify code with Thirdweb API
         │
         ▼
Get wallet address from Thirdweb
         │
         ▼
Check if user exists
         │
    ┌────┴────┐
    ▼         ▼
Existing   New User
User       │
    │      ▼
    │   Create user record
    │      │
    └──────┴──────┐
                  ▼
          Check username
                  │
            ┌─────┴─────┐
            ▼           ▼
        Has         No Username
      Username          │
            │           ▼
            │    Show Username Setup
            │           │
            └───────────┴──────┐
                               ▼
                        Authenticated
```

### AuthContext Design

The `AuthContext` manages authentication state across the application:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  authMethod: 'wallet' | 'email' | null;
}

interface AuthContextType extends AuthState {
  sendCode: (email: string) => Promise<void>;
  login: (email: string, code: string) => Promise<void>;
  logout: () => void;
  isTokenExpired: () => boolean;
  handleTokenExpiration: () => void;
}
```

**Key Features**:
- Persistent authentication (localStorage)
- Token expiration handling
- Automatic user creation/retrieval
- Username setup flow
- Multi-method support

---

## Security & Data Flow

### Security Measures

#### 1. Authentication Security
- **Wallet Signatures**: Cryptographic proof of wallet ownership
- **OTP Codes**: 6-digit time-limited codes for email auth
- **Token Management**: JWT tokens with expiration
- **Session Persistence**: Secure localStorage storage

#### 2. Database Security
- **Row Level Security (RLS)**: Supabase RLS policies
- **User Isolation**: Users can only access their own data
- **Cascade Deletes**: Automatic cleanup of related records
- **Unique Constraints**: Prevent duplicate accounts

#### 3. Transaction Security
- **Atomic Operations**: Database transactions for consistency
- **Balance Validation**: Check sufficient funds before transfer
- **Double-Entry Ledger**: Audit trail for all EUR transactions
- **Status Tracking**: Clear transaction lifecycle

### Data Flow

#### EUR Internal Transfer Data Flow
```
Frontend                Service Layer           Database
   │                         │                     │
   │  Send Payment Request   │                     │
   │─────────────────────────>                     │
   │                         │                     │
   │                         │  Check Balance      │
   │                         │────────────────────>│
   │                         │<────────────────────│
   │                         │                     │
   │                         │  Create Transaction │
   │                         │────────────────────>│
   │                         │<────────────────────│
   │                         │                     │
   │                         │  Transfer Funds     │
   │                         │────────────────────>│
   │                         │<────────────────────│
   │                         │                     │
   │                         │  Update Status      │
   │                         │────────────────────>│
   │                         │<────────────────────│
   │                         │                     │
   │<─────────────────────────                     │
   │  Success Response       │                     │
```

#### Crypto Payment Data Flow
```
Frontend          Service Layer      Thirdweb API      Blockchain
   │                   │                   │                │
   │  Send Payment     │                   │                │
   │──────────────────>│                   │                │
   │                   │  Create Payment   │                │
   │                   │──────────────────>│                │
   │                   │<──────────────────│                │
   │                   │  Payment Link     │                │
   │<──────────────────│                   │                │
   │  Show Payment UI  │                   │                │
   │                   │                   │                │
   │  User Approves    │                   │                │
   │──────────────────>│                   │                │
   │                   │  Complete Payment │                │
   │                   │──────────────────>│                │
   │                   │                   │  Broadcast TX  │
   │                   │                   │───────────────>│
   │                   │                   │<───────────────│
   │                   │<──────────────────│  TX Hash       │
   │                   │  Transaction ID   │                │
   │<──────────────────│                   │                │
   │                   │                   │                │
   │                   │  Monitor Status   │                │
   │                   │──────────────────>│                │
   │                   │<──────────────────│                │
   │                   │  Status Updates   │                │
```

---

## API Integration

### Supabase Integration

**Configuration**:
```typescript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

**Key Operations**:
- User CRUD
- Account management
- Transaction creation/retrieval
- Bank account management
- Real-time subscriptions (future)

### Thirdweb Integration

**Configuration**:
```typescript
const THIRDWEB_CONFIG = {
  clientId: process.env.VITE_THIRDWEB_CLIENT_ID,
  activeChain: Ethereum,
  supportedChains: [Ethereum, Polygon, Base]
};
```

**Key APIs**:
- **Authentication**: Email OTP and wallet connection
- **Payment API**: Create and complete payments
- **Transaction API**: Monitor transaction status
- **Wallet API**: Get balances and wallet info

**API Endpoints Used**:
```
POST /auth/send-code          # Send OTP code
POST /auth/verify-code        # Verify OTP code
POST /payments                # Create payment
POST /payments/:id/complete   # Complete payment
GET  /transactions/:id        # Get transaction status
GET  /wallets/:address/balance # Get wallet balance
```

---

## Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=your-client-id
VITE_THIRDWEB_SECRET_KEY=your-secret-key (backend only)

# Application Configuration
VITE_APP_NAME=Kodu
VITE_APP_ENV=development
```

### Supported Networks

```typescript
const CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    tokens: [
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
      { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 }
    ]
  },
  {
    id: 137,
    name: 'Polygon',
    tokens: [
      { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
      { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
      { symbol: 'MATIC', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 }
    ]
  }
];
```

---

## Performance Considerations

### Optimization Strategies

1. **React Query Caching**: Cache API responses to reduce network calls
2. **Lazy Loading**: Code splitting for faster initial load
3. **Optimistic Updates**: Update UI before server confirmation
4. **Debounced Search**: Reduce API calls during user search
5. **Memoization**: Cache computed values in components

### Scalability

1. **Database Indexing**: Indexes on frequently queried fields
2. **Connection Pooling**: Supabase handles connection management
3. **Stateless Services**: Services can be horizontally scaled
4. **Async Operations**: Non-blocking transaction processing
5. **Queue System** (future): Background job processing

---

## Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket integration for live transaction updates
2. **Recurring Payments**: Schedule automatic payments
3. **Payment Requests**: Request money from other users
4. **Multi-currency Support**: Support for more fiat currencies
5. **Advanced Analytics**: Transaction insights and spending patterns
6. **Mobile App**: React Native mobile application
7. **KYC Integration**: Identity verification for higher limits
8. **Merchant Tools**: Invoice generation and payment links
9. **API for Developers**: Public API for third-party integrations
10. **Smart Contract Integration**: Direct smart contract interactions

---

## Conclusion

Kodu's architecture is designed for:
- **Flexibility**: Support multiple payment methods
- **Scalability**: Handle growing user base and transaction volume
- **Security**: Protect user data and funds
- **Maintainability**: Clean separation of concerns
- **Extensibility**: Easy to add new features

The system leverages modern web technologies and blockchain infrastructure to provide a seamless payment experience across traditional and crypto payment rails.
