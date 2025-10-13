# Kodu - Diagram Generation Prompts

This document contains prompts for generating system diagrams using LLM tools (Claude, ChatGPT, etc.) with diagram generation capabilities (Mermaid, PlantUML, etc.).

## 📋 Table of Contents
1. [System Architecture Diagrams](#system-architecture-diagrams)
2. [Database Schema Diagrams](#database-schema-diagrams)
3. [Flow Diagrams](#flow-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Component Diagrams](#component-diagrams)

---

## System Architecture Diagrams

### 1. High-Level System Architecture

**Prompt**:
```
Create a high-level system architecture diagram for Kodu, a P2P payment application. The system should show:

1. Frontend Layer:
   - React + TypeScript application
   - Running on Vite
   - Styled with TailwindCSS
   - Using Thirdweb React SDK

2. Service Layer:
   - EurAccountService (EUR account management)
   - TransactionService (transaction creation and management)
   - BankAccountService (bank account CRUD)
   - PaymentOrchestrator (payment coordination)

3. Backend Services:
   - Supabase (PostgreSQL database)
     - Users table
     - Accounts table
     - Transactions table
     - Bank Accounts table
     - Ledger Entries table
   - Thirdweb API
     - Authentication (Email OTP + Wallet)
     - Payment API
     - Transaction monitoring
     - Wallet management

4. External Integrations:
   - Blockchain networks (Ethereum, Polygon, Base)
   - Wallet providers (MetaMask, Coinbase Wallet)

Show the data flow between layers with arrows indicating:
- User interactions
- API calls
- Database queries
- Blockchain transactions

Use a clean, professional style suitable for a presentation.
```

---

### 2. Component Architecture

**Prompt**:
```
Create a component architecture diagram for the Kodu React application showing:

1. Main App Component (App.tsx)
   - Wraps entire application
   - Manages routing and global state

2. Context Providers:
   - AuthContext (authentication state)
   - ThemeContext (light/dark mode)
   - PaymentModeContext (EUR/Crypto mode)

3. Major Component Groups:
   
   a) Authentication Components:
      - LoginForm
      - ConnectButton
      - UsernameSetup
   
   b) Payment Components:
      - UnifiedSendPayment
      - UnifiedPaymentConfirm
      - PaymentMethodSelector
      - EnhancedBalanceDisplay
   
   c) Profile Components:
      - UserProfile
      - BankAccountList
      - AddBankAccountModal
   
   d) Transaction Components:
      - TransactionHistory
      - TransactionDetails
   
   e) UI Components:
      - Layout
      - QRCodeDisplay
      - TokenChainSelector

4. Service Layer:
   - Show how components interact with services
   - Indicate data flow direction

Use a hierarchical tree structure with clear parent-child relationships.
Include icons or colors to differentiate component types.
```

---

## Database Schema Diagrams

### 3. Entity Relationship Diagram (ERD)

**Prompt**:
```
Create a detailed Entity Relationship Diagram (ERD) for the Kodu database with the following tables and relationships:

Tables:

1. users
   - id (UUID, PK)
   - email (TEXT, UNIQUE)
   - username (TEXT, UNIQUE)
   - display_name (TEXT)
   - wallet_address (TEXT, UNIQUE)
   - avatar_url (TEXT)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. accounts
   - id (UUID, PK)
   - user_id (UUID, FK -> users.id)
   - account_type (ENUM: USER_EUR, USER_CRYPTO)
   - currency (TEXT)
   - balance (DECIMAL)
   - available_balance (DECIMAL)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - UNIQUE(user_id, account_type, currency)

3. bank_accounts
   - id (UUID, PK)
   - user_id (UUID, FK -> users.id, CASCADE DELETE)
   - account_type (ENUM: CHECKING, SAVINGS, BUSINESS)
   - status (ENUM: PENDING_VERIFICATION, ACTIVE, SUSPENDED, CLOSED)
   - bank_name (TEXT)
   - account_holder_name (TEXT)
   - iban (TEXT, nullable)
   - account_number (TEXT, nullable)
   - routing_number (TEXT, nullable)
   - swift_bic (TEXT, nullable)
   - currency (TEXT)
   - country (TEXT)
   - is_primary (BOOLEAN)
   - nickname (TEXT, nullable)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - verified_at (TIMESTAMP, nullable)

4. transactions
   - id (UUID, PK)
   - ref_id (TEXT, UNIQUE)
   - from_user_id (UUID, FK -> users.id)
   - to_user_id (UUID, FK -> users.id)
   - from_account_id (UUID, FK -> accounts.id, nullable)
   - to_account_id (UUID, FK -> accounts.id, nullable)
   - from_bank_account_id (UUID, FK -> bank_accounts.id, nullable)
   - to_bank_account_id (UUID, FK -> bank_accounts.id, nullable)
   - amount_eur (DECIMAL, nullable)
   - amount_token (DECIMAL, nullable)
   - token_symbol (TEXT, nullable)
   - token_contract (TEXT, nullable)
   - chain_id (INTEGER, nullable)
   - mode (ENUM: EUR_INTERNAL, BANK_TRANSFER, ONCHAIN_DIRECT)
   - status (ENUM: PENDING, SETTLED, FAILED)
   - message (TEXT, nullable)
   - from_address (TEXT, nullable)
   - to_address (TEXT, nullable)
   - onchain_tx_hash (TEXT, nullable)
   - thirdweb_transaction_id (TEXT, nullable)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - settled_at (TIMESTAMP, nullable)

5. ledger_entries
   - id (UUID, PK)
   - transaction_id (UUID, FK -> transactions.id, CASCADE DELETE)
   - account_id (UUID, FK -> accounts.id)
   - amount (DECIMAL)
   - currency (TEXT)
   - entry_type (ENUM: DEBIT, CREDIT)
   - status (ENUM: PENDING, SETTLED)
   - description (TEXT, nullable)
   - created_at (TIMESTAMP)
   - settled_at (TIMESTAMP, nullable)

Relationships:
- users -> accounts (1:N)
- users -> bank_accounts (1:N)
- users -> transactions (1:N as sender, 1:N as recipient)
- accounts -> transactions (1:N as from_account, 1:N as to_account)
- bank_accounts -> transactions (1:N as from_bank, 1:N as to_bank)
- transactions -> ledger_entries (1:N)
- accounts -> ledger_entries (1:N)

Use crow's foot notation for cardinality.
Highlight primary keys in bold.
Show foreign key relationships with arrows.
Include data types and constraints.
Use a professional, clean layout suitable for technical documentation.
```

---

### 4. Database Schema - Simplified View

**Prompt**:
```
Create a simplified database schema diagram focusing on the core relationships:

1. Show only the main tables:
   - users
   - accounts (EUR balances)
   - bank_accounts
   - transactions

2. For each table, show only key fields:
   - Primary key
   - Foreign keys
   - Critical business fields (e.g., balance, amount, status)

3. Highlight the three payment flows:
   - EUR Internal: users -> accounts -> transactions -> accounts -> users
   - Bank Transfer: users -> bank_accounts -> transactions -> bank_accounts -> users
   - Crypto: users -> transactions (with blockchain data)

4. Use color coding:
   - Blue for user-related tables
   - Green for EUR/account tables
   - Orange for bank-related tables
   - Purple for transaction tables

Make it simple enough for a non-technical audience to understand the data relationships.
```

---

## Flow Diagrams

### 5. EUR Internal Payment Flow

**Prompt**:
```
Create a detailed flowchart for the EUR Internal Payment process:

Start: User initiates EUR payment

Steps:
1. User selects recipient
2. User enters amount and message
3. System validates:
   - Is recipient valid?
   - Does sender have EUR account?
   - Does recipient have EUR account?
   - Does sender have sufficient balance?
4. If validation fails -> Show error -> End
5. If validation passes -> Continue
6. Create transaction record (status: PENDING)
7. Begin atomic transfer:
   - Debit sender's EUR account
   - Credit recipient's EUR account
8. If transfer fails:
   - Mark transaction as FAILED
   - Show error
   - End
9. If transfer succeeds:
   - Create ledger entries (DEBIT + CREDIT)
   - Mark transaction as SETTLED
   - Update both account balances
10. Show success message
11. Update UI (balances, transaction history)

End: Payment complete

Use decision diamonds for validation steps.
Use process boxes for actions.
Use different colors for success/failure paths.
Include timing annotations (e.g., "Instant" for EUR transfers).
```

---

### 6. Bank Transfer Flow

**Prompt**:
```
Create a flowchart for the Bank Transfer process:

Start: User initiates bank transfer

Steps:
1. User selects recipient
2. System checks:
   - Does user have bank accounts?
   - Does recipient have bank accounts?
3. If no -> Show "Add bank account" message -> End
4. If yes -> Continue
5. User selects their bank account
6. User selects recipient's bank account
7. User enters amount and message
8. System validates:
   - Are bank accounts verified?
   - Is amount valid?
9. If validation fails -> Show error -> End
10. If validation passes -> Continue
11. Create transaction record:
    - mode: BANK_TRANSFER
    - status: PENDING
    - Link from_bank_account_id
    - Link to_bank_account_id
12. Show confirmation to user
13. (Future) Initiate bank API call
14. Transaction remains PENDING
15. (Future) Bank processes transfer (1-3 days)
16. (Future) Webhook updates status to SETTLED

End: Transaction created

Use swimlanes to show:
- User actions
- Kodu system actions
- Bank system actions (future)

Annotate with timing: "Instant creation, 1-3 days settlement"
```

---

### 7. Crypto Payment Flow

**Prompt**:
```
Create a flowchart for the Crypto Payment process:

Start: User initiates crypto payment

Steps:
1. User selects recipient
2. User selects payment method: Crypto
3. User selects blockchain network (Ethereum, Polygon, Base)
4. System loads available tokens for selected network
5. User selects token (USDC, USDT, ETH, etc.)
6. System fetches user's token balance
7. User enters amount and message
8. System validates:
   - Does user have sufficient token balance?
   - Does user have sufficient gas?
9. If validation fails -> Show error (with "Buy Crypto" option) -> End
10. If validation passes -> Continue
11. Create transaction record in database (status: PENDING)
12. Call Thirdweb API to create payment
13. Thirdweb returns payment link
14. Show payment UI to user
15. User approves transaction in wallet
16. If user rejects -> Mark as FAILED -> End
17. If user approves -> Continue
18. Thirdweb broadcasts transaction to blockchain
19. System receives transaction ID
20. Update database with thirdweb_transaction_id
21. Monitor transaction status:
    - Poll Thirdweb API every 5 seconds
    - Check for confirmations
22. When confirmed:
    - Update status to SETTLED
    - Save onchain_tx_hash
    - Update settled_at timestamp
23. Show success message with blockchain explorer link

End: Payment complete

Use different colors for:
- User actions (blue)
- Kodu system (green)
- Thirdweb API (orange)
- Blockchain (purple)

Include timing annotations for each step.
```

---

### 8. User Authentication Flow

**Prompt**:
```
Create two parallel flowcharts showing both authentication methods:

Flowchart 1: Wallet Authentication
Start: User clicks "Connect Wallet"
1. Thirdweb modal opens
2. User selects wallet provider (MetaMask, Coinbase, etc.)
3. Wallet connection request
4. User approves in wallet
5. System receives wallet address
6. Check if user exists in database (by wallet_address)
7. If exists:
   - Load user data
   - Check if username exists
   - If no username -> Show username setup
   - If has username -> Authenticated
8. If not exists:
   - Create new user record
   - wallet_address = connected address
   - email = null
   - Show username setup
9. After username setup -> Authenticated
End: User logged in

Flowchart 2: Email Authentication
Start: User enters email
1. User clicks "Send Code"
2. Call Thirdweb API to send OTP
3. Thirdweb sends 6-digit code to email
4. User receives email
5. User enters code in app
6. User clicks "Verify"
7. Call Thirdweb API to verify code
8. If code invalid -> Show error -> Back to step 5
9. If code valid -> Continue
10. Thirdweb returns wallet address + token
11. Check if user exists (by wallet_address)
12. If exists:
    - Load user data
    - Update email if different
    - Check username
    - If no username -> Show username setup
    - If has username -> Authenticated
13. If not exists:
    - Create new user record
    - wallet_address = from Thirdweb
    - email = user's email
    - Show username setup
14. After username setup -> Authenticated
End: User logged in

Show both flows side-by-side for comparison.
Highlight the common steps (username setup, user creation).
Use consistent colors for similar actions.
```

---

## Sequence Diagrams

### 9. EUR Internal Payment Sequence

**Prompt**:
```
Create a sequence diagram for EUR Internal Payment showing interactions between:

Actors/Systems:
- User (Frontend)
- UnifiedSendPayment Component
- UnifiedPaymentConfirm Component
- TransactionService
- EurAccountService
- Supabase Database

Sequence:
1. User -> UnifiedSendPayment: Select recipient, enter amount
2. UnifiedSendPayment -> User: Show payment form
3. User -> UnifiedSendPayment: Click "Continue"
4. UnifiedSendPayment -> UnifiedPaymentConfirm: Pass payment data
5. UnifiedPaymentConfirm -> User: Show confirmation screen
6. User -> UnifiedPaymentConfirm: Click "Confirm & Send"
7. UnifiedPaymentConfirm -> TransactionService: createEurInternalTransaction()
8. TransactionService -> EurAccountService: getOrCreateUserEurAccount(senderId)
9. EurAccountService -> Supabase: SELECT from accounts WHERE user_id = senderId
10. Supabase -> EurAccountService: Return sender account
11. TransactionService -> EurAccountService: getOrCreateUserEurAccount(recipientId)
12. EurAccountService -> Supabase: SELECT from accounts WHERE user_id = recipientId
13. Supabase -> EurAccountService: Return recipient account
14. TransactionService -> EurAccountService: hasSufficientBalance(senderId, amount)
15. EurAccountService -> TransactionService: Return true/false
16. TransactionService -> Supabase: INSERT INTO transactions
17. Supabase -> TransactionService: Return transaction record
18. TransactionService -> EurAccountService: transferBetweenAccounts()
19. EurAccountService -> Supabase: UPDATE accounts (sender) SET balance = balance - amount
20. Supabase -> EurAccountService: Success
21. EurAccountService -> Supabase: UPDATE accounts (recipient) SET balance = balance + amount
22. Supabase -> EurAccountService: Success
23. TransactionService -> Supabase: UPDATE transactions SET status = 'SETTLED'
24. Supabase -> TransactionService: Success
25. TransactionService -> UnifiedPaymentConfirm: Return transaction
26. UnifiedPaymentConfirm -> User: Show success message
27. User -> Activity Tab: Navigate to view transaction

Use UML sequence diagram notation.
Show activation boxes for processing time.
Include notes for important steps (e.g., "Atomic operation").
```

---

### 10. Crypto Payment Sequence

**Prompt**:
```
Create a sequence diagram for Crypto Payment showing interactions between:

Actors/Systems:
- User (Frontend)
- User's Wallet (MetaMask)
- UnifiedPaymentConfirm Component
- PaymentConfirm Component
- Thirdweb API
- Blockchain Network
- Supabase Database

Sequence:
1. User -> UnifiedPaymentConfirm: Initiate crypto payment
2. UnifiedPaymentConfirm -> PaymentConfirm: Delegate to crypto handler
3. PaymentConfirm -> Supabase: CREATE transaction record (status: PENDING)
4. Supabase -> PaymentConfirm: Return transaction ID
5. PaymentConfirm -> Thirdweb API: createPayment(recipient, token, amount)
6. Thirdweb API -> PaymentConfirm: Return payment object with ID
7. PaymentConfirm -> Thirdweb API: completePayment(paymentId, senderAddress)
8. Thirdweb API -> User's Wallet: Request transaction approval
9. User's Wallet -> User: Show transaction details
10. User -> User's Wallet: Approve transaction
11. User's Wallet -> Blockchain: Broadcast transaction
12. Blockchain -> User's Wallet: Return transaction hash
13. User's Wallet -> Thirdweb API: Transaction submitted
14. Thirdweb API -> PaymentConfirm: Return transaction ID
15. PaymentConfirm -> Supabase: UPDATE transaction SET thirdweb_transaction_id
16. PaymentConfirm -> User: Show "Monitoring" status
17. PaymentConfirm -> Thirdweb API: getTransactionStatus() [Loop every 5s]
18. Thirdweb API -> Blockchain: Check transaction status
19. Blockchain -> Thirdweb API: Return status + confirmations
20. Thirdweb API -> PaymentConfirm: Return status
21. [When confirmed] PaymentConfirm -> Supabase: UPDATE transaction SET status = 'SETTLED'
22. Supabase -> PaymentConfirm: Success
23. PaymentConfirm -> User: Show success with explorer link

Use UML sequence diagram notation.
Show the polling loop clearly.
Include timing annotations (e.g., "1-5 minutes for confirmation").
Use different colors for different systems.
```

---

## Component Diagrams

### 11. Service Layer Architecture

**Prompt**:
```
Create a component diagram showing the Service Layer architecture:

Components:

1. EurAccountService
   - Responsibilities:
     - Get/create EUR accounts
     - Check balances
     - Transfer funds
     - Validate sufficient funds
   - Dependencies:
     - Supabase Client
   - Exports:
     - getOrCreateUserEurAccount()
     - getUserEurBalance()
     - hasSufficientBalance()
     - transferBetweenAccounts()

2. TransactionService
   - Responsibilities:
     - Create transactions (all types)
     - Update transaction status
     - Retrieve transaction history
   - Dependencies:
     - Supabase Client
     - EurAccountService
   - Exports:
     - createEurInternalTransaction()
     - createBankTransferTransaction()
     - createCryptoTransaction()
     - updateTransactionStatus()
     - getUserTransactions()

3. BankAccountService
   - Responsibilities:
     - CRUD operations for bank accounts
     - Set primary account
     - Mask sensitive data
   - Dependencies:
     - Supabase Client
   - Exports:
     - createBankAccount()
     - getUserBankAccounts()
     - setPrimaryBankAccount()
     - deleteBankAccount()
     - getMaskedAccountNumber()

4. PaymentOrchestrator (Future)
   - Responsibilities:
     - Coordinate complex payment flows
     - Handle payment routing
     - Manage payment state
   - Dependencies:
     - All other services
   - Exports:
     - executePayment()
     - routePayment()

Show:
- Component boxes with rounded corners
- Dependency arrows
- Interface definitions
- Method signatures
- Clear separation of concerns

Use UML component diagram notation.
```

---

### 12. React Component Hierarchy

**Prompt**:
```
Create a tree diagram showing the React component hierarchy:

Root:
- App.tsx
  - ThirdwebProvider
    - QueryClientProvider
      - ThemeProvider
        - PaymentModeProvider
          - AuthProvider
            - AppContent
              - Layout
                - [Current Tab Content]
                  
                  If Home Tab:
                  - EnhancedBalanceDisplay
                  - UnifiedSendReceive
                    - If Send Mode:
                      - If Search Flow:
                        - UserSearch
                      - If Scan Flow:
                        - UnifiedQRScanner
                      - If Form Flow:
                        - UnifiedSendPayment
                          - PaymentMethodSelector
                          - TokenChainSelector (if crypto)
                    - If Receive Mode:
                      - UnifiedQRCodeDisplay
                  
                  If Send Tab:
                  - If Confirm Flow:
                    - UnifiedPaymentConfirm
                      - If Crypto:
                        - PaymentConfirm
                  - If Main Flow:
                    - UnifiedSendReceive (same as Home)
                  
                  If Activity Tab:
                  - TransactionHistory
                    - TransactionDetails (modal)
                  
                  If Profile Tab:
                  - UserProfile
                    - BankAccountList
                      - AddBankAccountModal (when open)
                
                - BottomNavigation
                  - NavButton (Home)
                  - NavButton (Send)
                  - NavButton (Activity)
                  - NavButton (Profile)

Use a tree structure with:
- Indentation to show nesting
- Boxes for components
- Different colors for:
  - Providers (purple)
  - Layout components (blue)
  - Feature components (green)
  - UI components (orange)
- Conditional rendering shown with "If" statements
```

---

### 13. Payment Method Decision Tree

**Prompt**:
```
Create a decision tree diagram for selecting the appropriate payment method:

Start: User wants to send payment

Decision 1: Is recipient a Kodu user?
- No -> Use Crypto (on-chain to any address)
- Yes -> Continue to Decision 2

Decision 2: Do both users have EUR accounts?
- No -> Continue to Decision 3
- Yes -> Continue to Decision 2a

Decision 2a: Does sender have sufficient EUR balance?
- No -> Continue to Decision 3
- Yes -> Recommend EUR Internal (Instant, Free)

Decision 3: Do both users have bank accounts linked?
- No -> Continue to Decision 4
- Yes -> Recommend Bank Transfer (1-3 days, Bank fees)

Decision 4: Does sender have crypto wallet connected?
- No -> Show error: "No payment method available"
- Yes -> Continue to Decision 4a

Decision 4a: Does sender have sufficient crypto balance?
- No -> Show "Buy Crypto" option
- Yes -> Recommend Crypto Payment (1-5 min, Gas fees)

End: Payment method selected

Use:
- Diamond shapes for decisions
- Rectangle shapes for recommendations
- Different colors for each payment method
- Include pros/cons for each method
- Show the "happy path" in bold/highlighted
```

---

## Usage Instructions

### How to Use These Prompts

1. **Choose a Diagram**: Select the diagram you want to generate from the list above

2. **Copy the Prompt**: Copy the entire prompt text

3. **Use with LLM Tool**: Paste into one of these tools:
   - **Claude** (Anthropic): Can generate Mermaid diagrams
   - **ChatGPT** (OpenAI): Can generate various diagram formats
   - **Mermaid Live Editor**: https://mermaid.live
   - **PlantUML**: https://www.plantuml.com

4. **Specify Format**: Add to the prompt:
   ```
   Generate this diagram in [Mermaid/PlantUML/SVG] format.
   ```

5. **Refine**: If the output isn't perfect, ask for modifications:
   ```
   Make the diagram more compact
   Use different colors for each layer
   Add more detail to the [specific section]
   Simplify the [specific part]
   ```

6. **Export**: Export the diagram as:
   - PNG for presentations
   - SVG for scalable graphics
   - PDF for documentation

### Example Workflow

```
1. Copy Prompt #1 (High-Level System Architecture)
2. Open Claude or ChatGPT
3. Paste: "[Prompt] Generate in Mermaid format suitable for a technical presentation"
4. Review generated Mermaid code
5. Copy code to Mermaid Live Editor (https://mermaid.live)
6. Adjust colors/styling as needed
7. Export as PNG
8. Add to presentation
```

### Customization Tips

**For Presentations**:
- Request larger fonts
- Use high contrast colors
- Simplify complex relationships
- Focus on key components only

**For Documentation**:
- Include all details
- Use standard UML notation
- Add comprehensive legends
- Include annotations

**For Stakeholders**:
- Minimize technical jargon
- Use business-friendly terms
- Focus on user value
- Show clear benefits

---

## Mermaid Syntax Reference

### Basic Mermaid Diagram Types

```mermaid
# Flowchart
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]

# Sequence Diagram
sequenceDiagram
    User->>System: Request
    System->>Database: Query
    Database-->>System: Response
    System-->>User: Result

# Class Diagram
classDiagram
    class User {
        +String id
        +String email
        +login()
    }

# Entity Relationship
erDiagram
    USER ||--o{ ACCOUNT : has
    USER {
        uuid id
        string email
    }
```

---

## Conclusion

These prompts will help you generate comprehensive, professional diagrams for:
- Technical documentation
- Presentations
- Architecture reviews
- Onboarding materials
- Stakeholder communications

Adjust the prompts based on your specific needs and audience. The diagrams will help visualize the complex Kodu payment system in an accessible way.
