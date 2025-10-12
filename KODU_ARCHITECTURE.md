

# Kodu Payment System - Complete Architecture

## 🎯 Executive Summary

Kodu provides instant, friction-free peer-to-peer EUR payments with optional crypto settlement. Users always think in EUR—they can optionally toggle "use crypto" for blockchain-based settlement. The system implements a double-entry ledger, supports multiple payment modes, and provides real-time balance updates.

---

## 📋 What's Implemented vs What Needs External Infrastructure

### ✅ **FULLY IMPLEMENTED (Working Now)**

#### 1. Database Schema
- ✅ Enhanced PostgreSQL schema with all tables
- ✅ Double-entry ledger system (`accounts`, `ledger_entries`)
- ✅ Transaction tracking with payment modes
- ✅ On-chain event monitoring structure
- ✅ Bank movement tracking
- ✅ Reconciliation framework

#### 2. Payment Modes
- ✅ **EUR_INTERNAL** (P1, P2) - Fully functional
  - Instant euro-to-euro transfers
  - Atomic database transactions
  - Real-time balance updates
  - Complete audit trail

- ⚠️ **CRYPTO_TO_FIAT** (P3) - Partially implemented
  - ✅ Transaction creation and tracking
  - ✅ Database structure for on-chain events
  - ✅ Ledger entry framework
  - ❌ Actual blockchain monitoring (needs infrastructure)
  - ❌ Off-ramp integration (needs partner API)

#### 3. Core Services
- ✅ Payment Orchestrator service
- ✅ Double-entry ledger functions
- ✅ Account management
- ✅ Balance queries
- ✅ Transaction history

#### 4. TypeScript Types
- ✅ Complete type definitions
- ✅ Payment mode enums
- ✅ Transaction status tracking
- ✅ Ledger entry types

### ❌ **NEEDS EXTERNAL INFRASTRUCTURE**

#### 1. Blockchain Integration
- ❌ **Blockchain node/provider** - Monitor on-chain transfers
- ❌ **Webhook service** - Receive blockchain events
- ❌ **Gas estimation** - Real-time gas price feeds
- ❌ **Transaction monitoring** - Track confirmation status

**Workaround for MVP**: Simulate on-chain events with manual API calls

#### 2. Off-Ramp Partner
- ❌ **Crypto exchange integration** - Convert USDC to EUR
- ❌ **OTC desk partnership** - Large volume conversions
- ❌ **Bank account** - Receive EUR from off-ramp

**Workaround for MVP**: Simulate instant 1:1 conversion

#### 3. Bank Integration
- ❌ **SEPA/Instant Payment rails** - Actual bank transfers
- ❌ **Bank API** - Initiate and track transfers
- ❌ **Reconciliation automation** - Match bank statements

**Workaround for MVP**: Track net positions in database only

#### 4. KYC/Compliance
- ❌ **KYC provider** - Identity verification
- ❌ **AML screening** - Transaction monitoring
- ❌ **Compliance reporting** - Regulatory requirements

**Workaround for MVP**: Basic user registration only

---

## 🏗️ System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  - Wallet connection                                        │
│  - EUR balance display (primary)                            │
│  - Payment mode toggle (EUR / Crypto)                       │
│  - Real-time updates via Supabase                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL + Realtime)               │
│  - Users & Accounts                                         │
│  - Transactions & Ledger Entries                            │
│  - Real-time subscriptions                                  │
│  - RPC functions for atomic operations                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            PAYMENT ORCHESTRATOR (TypeScript)                │
│  - Route payment by mode                                    │
│  - Execute EUR_INTERNAL instantly                           │
│  - Coordinate CRYPTO_TO_FIAT flow                           │
│  - Manage double-entry ledger                               │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   BLOCKCHAIN LAYER       │   │   BANKING LAYER          │
│   (Future/Simulated)     │   │   (Future/Simulated)     │
│  - Monitor transfers     │   │  - SEPA transfers        │
│  - Confirm on-chain      │   │  - Reconciliation        │
│  - Gas estimation        │   │  - Bank statements       │
└──────────────────────────┘   └──────────────────────────┘
```

---

## 💶 Payment Flows (Detailed)

### P1 & P2: EUR_INTERNAL (Fully Working)

**Example**: U1 sends €10 to U2

```
1. User Action
   └─> U1 selects U2, enters €10, taps Send

2. Frontend
   └─> Calls PaymentOrchestrator.createPayment()
       mode: 'EUR_INTERNAL'

3. Database (Atomic Transaction)
   ├─> Validate: Check U1 balance >= €10
   ├─> Create transaction record (status: PENDING)
   ├─> Create ledger entries:
   │   ├─> DEBIT U1's EUR account: -€10
   │   └─> CREDIT U2's EUR account: +€10
   ├─> Update account balances atomically
   └─> Mark transaction SETTLED

4. Real-time Update
   └─> Supabase broadcasts balance changes
       ├─> U1 sees -€10 instantly
       └─> U2 sees +€10 instantly

5. Result
   └─> Instant settlement, no blockchain involved
```

**SQL Function**: `process_eur_internal_payment()`
- Validates balance
- Creates transaction + ledger entries
- Updates balances atomically
- Returns complete transaction

**Status**: ✅ **FULLY FUNCTIONAL**

---

### P3: CRYPTO_TO_FIAT (Partially Implemented)

**Example**: U1 sends €1 to U2 via crypto

```
1. User Action
   └─> U1 selects U2, toggles "Use Crypto", enters €1

2. Frontend
   ├─> Calls PaymentOrchestrator.createPayment()
   │   mode: 'CRYPTO_TO_FIAT'
   └─> Receives crypto_payment_details:
       ├─> recipient_address: K's wallet (0xKODU...)
       ├─> token_contract: USDC address
       ├─> amount_token: 1.0
       └─> chain_id: 8453 (Base)

3. User Wallet Interaction
   └─> Frontend prompts wallet to send 1 USDC to K's address
       (User signs transaction)

4. Blockchain (NEEDS INFRASTRUCTURE)
   ├─> Transaction broadcasts to blockchain
   ├─> Confirmations accumulate (10-30 seconds)
   └─> [SIMULATED] Backend detects transfer to K's wallet

5. Backend Processing
   ├─> Calls handleOnchainReceived()
   ├─> Updates transaction: status = ONCHAIN_RECEIVED
   └─> Decision point:
       ├─> If FRONT_LIQUIDITY = true:
       │   └─> Credit U2 immediately from reserve
       └─> If FRONT_LIQUIDITY = false:
           └─> Initiate off-ramp process

6. Off-Ramp (NEEDS PARTNER API)
   ├─> [SIMULATED] Convert 1 USDC → €1
   ├─> [SIMULATED] EUR lands in K's bank (B3)
   └─> Calls handleOfframpComplete()

7. Credit Recipient
   ├─> Create ledger entries:
   │   ├─> DEBIT K's EUR account: -€1
   │   └─> CREDIT U2's EUR account: +€1
   ├─> Update balances
   └─> Mark transaction: CREDITED_TO_RECIPIENT

8. Real-time Update
   └─> U2 sees +€1 in EUR balance

9. Result
   └─> U1 sent crypto, U2 received EUR
       K acted as intermediary
```

**Status**: 
- ✅ Database structure complete
- ✅ Transaction flow logic implemented
- ❌ Blockchain monitoring needs infrastructure
- ❌ Off-ramp needs partner integration

**MVP Workaround**:
- Simulate on-chain events with API calls
- Assume instant 1:1 USDC→EUR conversion
- Front liquidity from reserve immediately

---

## 📊 Database Schema

### Core Tables

#### `users`
```sql
- id (UUID)
- email (TEXT, unique)
- username (TEXT, unique)
- wallet_address (TEXT, unique)
- display_name (TEXT)
- bank_id (TEXT) -- B1, B2, etc.
- kyc_status (TEXT)
- created_at, updated_at
```

#### `accounts` (Double-Entry Ledger)
```sql
- id (UUID)
- user_id (UUID, nullable for company accounts)
- account_type (ENUM: USER_EUR, COMPANY_EUR, SETTLEMENT_RESERVE, etc.)
- currency (TEXT: EUR, USDC, etc.)
- balance (DECIMAL)
- available_balance (DECIMAL) -- balance minus pending
- created_at, updated_at
```

#### `transactions`
```sql
- id (UUID)
- ref_id (TEXT, unique) -- idempotency key
- from_user_id, to_user_id (UUID)
- from_account_id, to_account_id (UUID)
- amount_eur, amount_token (DECIMAL)
- token_symbol, token_contract, chain_id
- mode (ENUM: EUR_INTERNAL, CRYPTO_TO_FIAT, ONCHAIN_DIRECT)
- status (ENUM: PENDING, ONCHAIN_RECEIVED, SETTLED, etc.)
- message (TEXT)
- onchain_tx_hash (TEXT)
- thirdweb_transaction_id (TEXT)
- offramp_partner, offramp_reference, offramp_eur_received
- created_at, updated_at, settled_at, etc.
- events (JSONB) -- audit trail
- metadata (JSONB)
```

#### `ledger_entries`
```sql
- id (UUID)
- transaction_id (UUID)
- account_id (UUID)
- amount (DECIMAL)
- currency (TEXT)
- entry_type (ENUM: DEBIT, CREDIT)
- status (ENUM: PENDING, LOCKED, SETTLED, REVERSED)
- description (TEXT)
- created_at, updated_at, settled_at
```

#### `onchain_events`
```sql
- id (UUID)
- tx_hash (TEXT, unique)
- from_address, to_address (TEXT)
- token_contract, token_symbol (TEXT)
- amount (DECIMAL)
- chain_id (INTEGER)
- confirmations (INTEGER)
- processed (BOOLEAN)
- transaction_id (UUID) -- link to our transaction
- created_at, processed_at
```

#### `bank_movements`
```sql
- id (UUID)
- bank_tx_id (TEXT, unique)
- transaction_id (UUID)
- amount (DECIMAL)
- currency (TEXT)
- from_bank, to_bank (TEXT) -- B1, B2, B3
- status (TEXT)
- created_at, completed_at
```

#### `reconciliations`
```sql
- id (UUID)
- period_start, period_end (TIMESTAMPTZ)
- status (TEXT)
- total_transactions (INTEGER)
- total_eur_volume (DECIMAL)
- net_positions (JSONB) -- bank-to-bank net positions
- settlement_instructions (JSONB)
- created_at, completed_at
```

---

## 🔄 Double-Entry Ledger System

Every transaction creates balanced ledger entries:

### EUR_INTERNAL Example (€10 from U1 to U2)

```
Ledger Entries:
┌────────────────────────────────────────────────────┐
│ DEBIT  │ U1's EUR Account │ -€10 │ SETTLED        │
│ CREDIT │ U2's EUR Account │ +€10 │ SETTLED        │
└────────────────────────────────────────────────────┘
Total: €0 (balanced)
```

### CRYPTO_TO_FIAT Example (€1 from U1 to U2 via crypto)

**Step 1**: On-chain received (if fronting liquidity)
```
Ledger Entries:
┌────────────────────────────────────────────────────┐
│ DEBIT  │ Settlement Reserve │ -€1  │ SETTLED       │
│ CREDIT │ U2's EUR Account   │ +€1  │ SETTLED       │
└────────────────────────────────────────────────────┘
```

**Step 2**: Off-ramp completes (replenish reserve)
```
Ledger Entries:
┌────────────────────────────────────────────────────┐
│ DEBIT  │ K's EUR Account    │ -€1  │ SETTLED       │
│ CREDIT │ Settlement Reserve │ +€1  │ SETTLED       │
└────────────────────────────────────────────────────┘
```

**Net Effect**:
- U2: +€1 EUR
- K: -€1 EUR (from off-ramp proceeds)
- Reserve: €0 (replenished)

---

## 🏦 Bank Reconciliation (Future)

### Daily Reconciliation Window

**Purpose**: Settle net positions between banks

**Process**:
1. Aggregate all EUR_INTERNAL transactions for the day
2. Calculate net positions per bank:
   ```
   Example:
   - B1 (U1's bank): -€8 net (sent more than received)
   - B2 (U2's bank): +€8 net (received more than sent)
   ```
3. Generate settlement instructions:
   ```json
   {
     "from_bank": "B1",
     "to_bank": "B2",
     "amount_eur": "8.00",
     "instruction_type": "SEPA",
     "reference": "KODU_RECON_2025-10-12"
   }
   ```
4. Execute bank transfers via SEPA/Instant Payment rails
5. Mark transactions as `SETTLED` when bank confirms

**Status**: ❌ Needs bank API integration

**MVP Workaround**: Track net positions in database only

---

## 🔐 Security & Compliance

### Implemented
- ✅ Row Level Security (RLS) on all tables
- ✅ Idempotency keys for duplicate prevention
- ✅ Atomic database transactions
- ✅ Audit trail (events JSONB field)
- ✅ Balance locking during transfers

### Needs Implementation
- ❌ KYC/AML screening
- ❌ Transaction limits per user tier
- ❌ Fraud detection
- ❌ Regulatory reporting
- ❌ Data encryption at rest

---

## 📱 User Experience

### Balance Display
```
┌─────────────────────────────────┐
│ Your Balance                    │
│                                 │
│ €123.45                         │
│ Available: €120.00              │
│                                 │
│ [Show Crypto Balances] toggle   │
│                                 │
│ When toggled:                   │
│ 💎 USDC: 50.00                  │
│    (≈ €50.00)                   │
└─────────────────────────────────┘
```

### Send Payment
```
┌─────────────────────────────────┐
│ Send to: @alice                 │
│ Amount: €10                     │
│                                 │
│ Payment Mode:                   │
│ ○ EUR (Instant)                 │
│ ● Crypto (via stablecoin)       │
│                                 │
│ Estimated fee: €0.001           │
│ Estimated time: 30 seconds      │
│                                 │
│ [Send Payment]                  │
└─────────────────────────────────┘
```

### Transaction History
```
┌─────────────────────────────────┐
│ Recent Transactions             │
│                                 │
│ ✅ Sent €10 to @alice           │
│    EUR_INTERNAL • Settled       │
│    Oct 12, 3:45 PM              │
│                                 │
│ ⏳ Sent €1 to @bob              │
│    CRYPTO_TO_FIAT • Pending     │
│    Oct 12, 3:40 PM              │
│    [View on Explorer]           │
│                                 │
│ ✅ Received €5 from @charlie    │
│    EUR_INTERNAL • Settled       │
│    Oct 12, 2:30 PM              │
└─────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: MVP (Current) ✅
- [x] Enhanced database schema
- [x] EUR_INTERNAL payments (fully functional)
- [x] Double-entry ledger
- [x] Payment orchestrator
- [x] TypeScript types
- [x] SQL functions for atomic operations

### Phase 2: Crypto Integration (Partial) ⚠️
- [x] CRYPTO_TO_FIAT database structure
- [x] Transaction flow logic
- [ ] Blockchain monitoring service
- [ ] Webhook receiver for on-chain events
- [ ] Gas estimation API
- [ ] Transaction confirmation tracking

### Phase 3: Off-Ramp Integration ❌
- [ ] Partner selection (exchange/OTC)
- [ ] API integration
- [ ] EUR bank account setup
- [ ] Conversion rate feeds
- [ ] Slippage handling
- [ ] Failure recovery

### Phase 4: Bank Integration ❌
- [ ] Bank API integration
- [ ] SEPA/Instant Payment rails
- [ ] Reconciliation automation
- [ ] Bank statement parsing
- [ ] Net position settlement

### Phase 5: Compliance ❌
- [ ] KYC provider integration
- [ ] AML screening
- [ ] Transaction monitoring
- [ ] Regulatory reporting
- [ ] Audit logs

### Phase 6: Production Hardening ❌
- [ ] Load testing
- [ ] Disaster recovery
- [ ] Monitoring & alerting
- [ ] Rate limiting
- [ ] DDoS protection

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test EUR_INTERNAL payment
test('EUR_INTERNAL payment succeeds with sufficient balance', async () => {
  // Setup: U1 has €100, U2 has €0
  // Action: U1 sends €10 to U2
  // Assert: U1 has €90, U2 has €10, transaction SETTLED
});

// Test insufficient balance
test('EUR_INTERNAL payment fails with insufficient balance', async () => {
  // Setup: U1 has €5
  // Action: U1 tries to send €10
  // Assert: Transaction fails, balances unchanged
});
```

### Integration Tests
```typescript
// Test CRYPTO_TO_FIAT flow
test('CRYPTO_TO_FIAT payment completes end-to-end', async () => {
  // 1. Create transaction
  // 2. Simulate on-chain transfer
  // 3. Simulate off-ramp completion
  // 4. Assert recipient credited
});
```

### Manual Testing Scenarios
1. **Happy Path EUR_INTERNAL**
   - U1 sends €10 to U2
   - Both see instant balance updates
   - Transaction shows as SETTLED

2. **Happy Path CRYPTO_TO_FIAT (Simulated)**
   - U1 toggles crypto mode
   - Sends €1 to U2
   - Simulates on-chain confirmation
   - U2 receives EUR credit

3. **Edge Cases**
   - Insufficient balance
   - Duplicate idempotency key
   - Concurrent transactions
   - Network failures

---

## 📊 Monitoring & Observability

### Key Metrics to Track
- Transaction volume (EUR_INTERNAL vs CRYPTO_TO_FIAT)
- Average settlement time
- Failed transaction rate
- Off-ramp conversion slippage
- Bank reconciliation accuracy
- User balance accuracy

### Alerts
- Failed transactions > threshold
- Off-ramp delays > 5 minutes
- Reconciliation mismatches
- Insufficient reserve liquidity
- Database connection issues

---

## 💡 Key Design Decisions

### 1. EUR-First UX
**Decision**: Show EUR balances by default, crypto as optional toggle

**Rationale**: Users think in familiar currency, crypto is implementation detail

### 2. Double-Entry Ledger
**Decision**: Implement full double-entry bookkeeping

**Rationale**: Ensures balance accuracy, enables audit, standard accounting practice

### 3. Fronting Liquidity
**Decision**: K can front EUR before off-ramp completes

**Rationale**: Best UX (instant recipient credit), K accepts settlement risk

### 4. Atomic Transactions
**Decision**: Use PostgreSQL transactions for EUR_INTERNAL

**Rationale**: Guarantees consistency, prevents race conditions

### 5. Event Sourcing
**Decision**: Store events JSONB array in transactions table

**Rationale**: Complete audit trail, easy debugging, regulatory compliance

---

## 🎓 For Developers

### Quick Start
```bash
# 1. Apply database migrations
cd supabase
supabase db push

# 2. Add test funds to user
SELECT add_funds_to_user(
  '<user_id>'::uuid,
  100.00,
  'Initial test funds'
);

# 3. Test EUR_INTERNAL payment
SELECT process_eur_internal_payment(
  '<from_user_id>'::uuid,
  '<to_user_id>'::uuid,
  10.00,
  'Test payment'
);

# 4. Check balances
SELECT * FROM user_balances;
```

### Key Files
- `supabase/migrations/001_enhanced_schema.sql` - Database schema
- `supabase/migrations/002_payment_functions.sql` - SQL functions
- `src/types/database.ts` - TypeScript types
- `src/services/paymentOrchestrator.ts` - Payment logic

### API Examples
```typescript
// Create EUR_INTERNAL payment
const result = await PaymentOrchestrator.createPayment(
  fromUserId,
  {
    to_user_id: toUserId,
    amount_eur: '10.00',
    mode: 'EUR_INTERNAL',
    message: 'Coffee money'
  }
);

// Create CRYPTO_TO_FIAT payment
const result = await PaymentOrchestrator.createPayment(
  fromUserId,
  {
    to_user_id: toUserId,
    amount_eur: '1.00',
    mode: 'CRYPTO_TO_FIAT',
    token_contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chain_id: 8453
  }
);

// Get user balance
const balance = await PaymentOrchestrator.getUserEurBalance(userId);
```

---

## 📞 Support & Questions

For questions about implementation:
1. Check this document first
2. Review SQL migration files
3. Examine TypeScript types
4. Test with SQL functions directly

**Remember**: EUR_INTERNAL is fully functional now. CRYPTO_TO_FIAT needs external infrastructure but the framework is ready.

---

**Last Updated**: October 12, 2025
**Version**: 1.0
**Status**: MVP Complete, Production Requires External Infrastructure
