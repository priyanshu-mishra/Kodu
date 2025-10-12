# Bank Account Management & Payment Feature

## Overview

This document describes the comprehensive bank account management and payment system that has been integrated into the Kodu application. Users can now:

1. **Add and manage bank accounts** in their profile
2. **Choose payment methods** when sending money (Crypto, EUR Internal, or Bank Transfer)
3. **Send payments via bank transfer** to other users who have connected bank accounts
4. **Simulate bank transfers** between users using Supabase

## Features Implemented

### 1. Database Schema (`sql/supabase-schema.sql`)

#### New Table: `bank_accounts`
Stores user bank account information with the following fields:
- **Bank Details**: `bank_name`, `account_holder_name`, `iban`, `account_number`, `routing_number`, `swift_bic`
- **Account Info**: `account_type` (CHECKING, SAVINGS, BUSINESS), `status` (PENDING_VERIFICATION, ACTIVE, SUSPENDED, CLOSED)
- **Metadata**: `currency`, `country`, `is_primary`, `nickname`
- **Timestamps**: `created_at`, `updated_at`, `verified_at`

#### Updated Tables:
- **`transactions`**: Added `from_bank_account_id` and `to_bank_account_id` fields
- **`payment_mode` enum**: Added `BANK_TRANSFER` option

#### New Enums:
- `bank_account_type`: CHECKING, SAVINGS, BUSINESS
- `bank_account_status`: PENDING_VERIFICATION, ACTIVE, SUSPENDED, CLOSED

### 2. TypeScript Types (`src/types/database.ts`)

Added comprehensive type definitions:
- `BankAccount` interface
- `BankAccountType` and `BankAccountStatus` enums
- Updated `PaymentMode` to include `BANK_TRANSFER`
- Updated `CreatePaymentRequest` with bank account fields

### 3. Bank Account Service (`src/services/bankAccountService.ts`)

Complete CRUD operations for bank accounts:
- `getUserBankAccounts()` - Get all bank accounts for a user
- `getBankAccount()` - Get specific bank account
- `getPrimaryBankAccount()` - Get user's primary account
- `createBankAccount()` - Add new bank account
- `updateBankAccount()` - Update existing account
- `deleteBankAccount()` - Remove account
- `setPrimaryBankAccount()` - Set account as primary
- `verifyBankAccount()` - Mark account as verified (admin function)
- `hasActiveBankAccounts()` - Check if user has active accounts
- Helper methods for display formatting

### 4. UI Components

#### `BankAccountList.tsx`
- Displays all user bank accounts
- Shows account status badges (Active, Pending, etc.)
- Allows setting primary account
- Delete functionality with confirmation
- Empty state with call-to-action

#### `AddBankAccountModal.tsx`
- Modal form for adding new bank accounts
- Supports both IBAN and Account Number + Routing Number
- Account type selection (Checking, Savings, Business)
- Currency and country selection
- Optional nickname field
- Primary account toggle
- Form validation

#### `PaymentMethodSelector.tsx`
- Visual selector for payment methods:
  - **Crypto Payment**: Pay with USDC or other cryptocurrencies
  - **EUR Balance**: Instant transfer from EUR balance
  - **Bank Transfer**: Transfer from connected bank account
- Shows availability status for each method
- Bank account dropdown when bank transfer is selected
- Displays recipient's bank account availability

#### `UnifiedSendPayment.tsx`
- Unified payment interface supporting all payment methods
- Dynamically shows relevant fields based on selected method
- Integrates PaymentMethodSelector
- Token/chain selector for crypto payments
- Amount input with quick amount buttons
- Message field
- Comprehensive validation

### 5. Payment Orchestrator Updates (`src/services/paymentOrchestrator.ts`)

Added bank transfer handling:
- `handleBankTransferPayment()` - Creates bank transfer transaction
- `completeBankTransfer()` - Simulates transfer completion (3-second delay)
- Creates `bank_movements` records for tracking
- Updates transaction status to SETTLED upon completion
- Validation for bank account requirements

### 6. Profile Integration (`src/App.tsx`)

Updated profile tab to include:
- Bank account management section
- Integrated `BankAccountList` component
- Positioned between user info and QR code sections

## Payment Flow

### Bank Transfer Payment Flow

1. **User selects recipient** from user search
2. **Payment method selection**:
   - System checks if both sender and recipient have active bank accounts
   - If available, bank transfer option is enabled
3. **User selects bank transfer method**:
   - Chooses their bank account from dropdown
   - System automatically selects recipient's primary (or first active) bank account
4. **User enters amount and message**
5. **Payment confirmation**:
   - Transaction created with status `PENDING`
   - Bank movement record created
6. **Simulated processing** (3 seconds):
   - In production, this would integrate with actual bank APIs
7. **Completion**:
   - Transaction status updated to `SETTLED`
   - Bank movement marked as `completed`

## Database Setup

To enable this feature, run the updated schema:

```sql
-- Run in Supabase SQL Editor
-- File: sql/supabase-schema.sql
```

This will:
- Create the `bank_accounts` table
- Add bank transfer support to transactions
- Set up proper indexes and RLS policies
- Create necessary enums and types

## Usage Examples

### Adding a Bank Account

1. Navigate to **Profile** tab
2. Scroll to **Bank Accounts** section
3. Click **Add Account** button
4. Fill in bank details:
   - Bank name (e.g., "Deutsche Bank")
   - Account holder name
   - Choose IBAN or Account Number method
   - Enter account identifier
   - Optional: SWIFT/BIC code
   - Select currency and country
   - Optional: Add nickname
   - Toggle "Set as primary" if desired
5. Click **Add Account**

### Sending a Bank Transfer

1. Navigate to **Send** tab
2. Search for and select recipient
3. In payment method selector, choose **Bank Transfer**
4. Select your bank account from dropdown
5. Enter amount (e.g., €100)
6. Optional: Add message
7. Click **Continue** to confirm

### Managing Bank Accounts

- **Set as Primary**: Click checkmark icon on any active account
- **Delete Account**: Click trash icon and confirm
- **View Details**: All accounts show masked account numbers for security

## Security Features

- **Masked Account Numbers**: Only last 4 digits shown in UI
- **Account Verification**: New accounts start as `PENDING_VERIFICATION`
- **Row Level Security**: Supabase RLS policies protect bank account data
- **Validation**: Ensures either IBAN or Account Number + Routing Number is provided

## Simulation vs Production

### Current (Simulation)
- Bank transfers complete automatically after 3 seconds
- No actual bank API integration
- All accounts can be instantly "verified"
- Suitable for testing and demonstration

### Production Requirements
To make this production-ready:
1. Integrate with bank API provider (e.g., Plaid, Stripe, TrueLayer)
2. Implement real account verification (micro-deposits, instant verification)
3. Add webhook handlers for bank transfer status updates
4. Implement proper KYC/AML checks
5. Add transaction limits and fraud detection
6. Implement proper error handling and retry logic
7. Add audit logging for compliance

## API Integration Points

For production, you would integrate:

1. **Account Verification**: 
   - Plaid Link for instant verification
   - Or micro-deposit verification flow

2. **Bank Transfers**:
   - SEPA transfers for EU
   - ACH transfers for US
   - Real-time payment rails where available

3. **Webhooks**:
   - Transfer status updates
   - Account status changes
   - Balance updates

## Testing

### Test Scenarios

1. **Add Bank Account**:
   - Add with IBAN
   - Add with Account Number + Routing Number
   - Set as primary
   - Add multiple accounts

2. **Bank Transfer Payment**:
   - Send to user with bank account
   - Send to user without bank account (should disable option)
   - Send without selecting bank account (should show error)

3. **Account Management**:
   - Change primary account
   - Delete account
   - Update account details

### Sample Test Data

```sql
-- Create test users with bank accounts
-- User 1: alice@example.com
INSERT INTO bank_accounts (user_id, bank_name, account_holder_name, iban, account_type, status, is_primary)
VALUES 
  ('user-id-1', 'Deutsche Bank', 'Alice Smith', 'DE89370400440532013000', 'CHECKING', 'ACTIVE', true);

-- User 2: bob@example.com  
INSERT INTO bank_accounts (user_id, bank_name, account_holder_name, iban, account_type, status, is_primary)
VALUES 
  ('user-id-2', 'BNP Paribas', 'Bob Johnson', 'FR1420041010050500013M02606', 'CHECKING', 'ACTIVE', true);
```

## Future Enhancements

1. **Multi-currency Support**: Handle different currencies with exchange rates
2. **Recurring Transfers**: Schedule automatic payments
3. **Payment Requests**: Request money from other users
4. **Transaction Limits**: Daily/monthly limits per account
5. **Beneficiary Management**: Save frequent recipients
6. **Transaction History**: Filter by payment method
7. **Export Statements**: Download transaction history
8. **Notifications**: Email/push notifications for transfers
9. **Dispute Resolution**: Handle failed/disputed transfers
10. **Compliance Features**: Tax reporting, regulatory compliance

## Support

For issues or questions:
- Check transaction history for payment status
- Verify bank account is ACTIVE status
- Ensure recipient has connected bank account
- Check transaction events for detailed status updates

## Summary

This implementation provides a complete bank account management and payment system that:
- ✅ Allows users to add/manage bank accounts in their profile
- ✅ Provides payment method selection (Crypto, EUR, Bank Transfer)
- ✅ Enables bank transfers between users with connected accounts
- ✅ Simulates the full payment flow using Supabase
- ✅ Includes comprehensive UI/UX for all features
- ✅ Ready for production bank API integration

The system is designed to be extensible and production-ready with proper API integration.
