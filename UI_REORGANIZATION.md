# UI Reorganization - Send/Receive & QR Code Updates

## Overview
Reorganized the payment UI to provide a unified Send/Receive experience with integrated QR code functionality.

---

## ✅ Changes Implemented

### 1. **QR Code Moved to Profile**
- **Before**: QR code was in header dropdown menu
- **After**: QR code is now permanently displayed in the Profile section

**Location**: Profile tab → "Receive Payments" section

**Benefits**:
- Always accessible without extra clicks
- Better context for receiving payments
- Cleaner header dropdown (only Sign Out option)

### 2. **Unified Send/Receive Page**
- **Before**: Separate "Pay" tab for sending only
- **After**: "Send/Receive" tab with toggle between modes

**New Component**: `src/components/payments/SendReceive.tsx`

**Features**:
- Toggle between Send and Receive modes
- Send mode: Search by username OR scan QR code
- Receive mode: Display your QR code and wallet address
- Seamless switching between modes

### 3. **Enhanced Send Options**
Users can now send payments using:
1. **Search by Username** - Find users in the system
2. **Scan QR Code** - Scan recipient's wallet QR code directly

Both options lead to the same payment form with proper recipient info.

---

## 🎨 New User Experience

### Send/Receive Tab Flow

```
┌─────────────────────────────────────┐
│  [Send] [Receive]  ← Toggle         │
├─────────────────────────────────────┤
│                                     │
│  SEND MODE:                         │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Search by Username       │   │
│  │    Find users by username   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📷 Scan QR Code             │   │
│  │    Scan wallet QR code      │   │
│  └─────────────────────────────┘   │
│                                     │
│  RECEIVE MODE:                      │
│  ┌─────────────────────────────┐   │
│  │  [QR CODE DISPLAY]          │   │
│  │  0x1234...5678              │   │
│  │  [Copy Address]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Profile Tab

```
┌─────────────────────────────────────┐
│  Profile                            │
├─────────────────────────────────────┤
│  👤 John Doe                        │
│     @johndoe                        │
│     john@example.com                │
│                                     │
│  Wallet Address:                    │
│  0x1234...5678                      │
├─────────────────────────────────────┤
│  Receive Payments                   │
│                                     │
│  Share your QR code or wallet       │
│  address to receive payments        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      [QR CODE]              │   │
│  │                             │   │
│  │   0x1234...5678             │   │
│  │   [Copy] ✓                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 📁 Files Modified

### Created
- ✅ `src/components/payments/SendReceive.tsx` - New unified component

### Modified
- ✅ `src/App.tsx` - Updated to use SendReceive component
- ✅ `src/components/ui/Layout.tsx` - Removed QR from dropdown, renamed tab
- ✅ Profile section in App.tsx - Added QR code display

---

## 🔄 Component Structure

### SendReceive Component

**States**:
- `mode`: 'send' | 'receive'
- `sendFlow`: 'select' | 'search' | 'scan' | 'form'
- `selectedRecipient`: User | null

**Send Mode Flows**:
1. **Select** → Choose between Search or Scan
2. **Search** → UserSearch component → Form
3. **Scan** → QRCodeScanner → Form
4. **Form** → SendPayment component → Confirm

**Receive Mode**:
- Always shows QRCodeDisplay with wallet address

---

## 🎯 User Flows

### Sending Payment

#### Option 1: Search by Username
1. Navigate to Send/Receive tab
2. Ensure "Send" mode is selected
3. Click "Search by Username"
4. Search for user
5. Select user
6. Enter amount and details
7. Confirm payment

#### Option 2: Scan QR Code
1. Navigate to Send/Receive tab
2. Ensure "Send" mode is selected
3. Click "Scan QR Code"
4. Point camera at recipient's QR code
5. QR code scanned → auto-fills recipient
6. Enter amount and details
7. Confirm payment

### Receiving Payment

#### From Send/Receive Tab
1. Navigate to Send/Receive tab
2. Toggle to "Receive" mode
3. Show QR code to sender
4. Or share wallet address

#### From Profile Tab
1. Navigate to Profile tab
2. Scroll to "Receive Payments" section
3. Show QR code to sender
4. Or copy and share wallet address

---

## 🔑 Key Features

### Toggle Between Modes
- Smooth transition between Send and Receive
- State resets when switching modes
- Clear visual indication of active mode

### Multiple Send Options
- **Search**: Traditional username search
- **Scan**: Quick QR code scanning
- Both lead to same payment form

### QR Code Integration
- **Send**: Scan recipient's QR code
- **Receive**: Display your QR code
- **Profile**: Permanent QR code display

### Wallet Address Handling
- QR scanner creates temporary user object
- Wallet address displayed as username
- Seamless integration with payment flow

---

## 💡 Technical Details

### QR Code Scanning
When a QR code is scanned:
```typescript
const tempUser: User = {
  id: address,
  username: address.slice(0, 8),
  wallet_address: address,
  email: '',
  display_name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

### Mode Management
```typescript
const handleModeToggle = (newMode: Mode) => {
  setMode(newMode);
  setSendFlow('select');
  setSelectedRecipient(null);
};
```

### Flow Navigation
```typescript
// Send flows
'select' → User chooses search or scan
'search' → UserSearch component
'scan' → QRCodeScanner component
'form' → SendPayment component

// Receive flow
Always shows QRCodeDisplay
```

---

## 🎨 UI Components Used

### Icons
- `ArrowUpRight` - Send mode indicator
- `ArrowDownLeft` - Receive mode indicator
- `QrCode` - QR code actions
- `Search` - Username search
- `ArrowLeftRight` - Tab icon

### Components
- `UserSearch` - Search users by username
- `QRCodeScanner` - Scan QR codes
- `QRCodeDisplay` - Display wallet QR code
- `SendPayment` - Payment form
- `PaymentConfirm` - Confirmation screen

---

## 📱 Navigation Updates

### Bottom Navigation
- **Before**: "Pay" tab
- **After**: "Send/Receive" tab with `ArrowLeftRight` icon

### Header Dropdown
- **Before**: "Show QR Code" + "Sign Out"
- **After**: "Sign Out" only

### Profile Tab
- **Added**: "Receive Payments" section with QR code

---

## ✨ Benefits

### For Users
1. **Easier to receive payments** - QR code always visible in profile
2. **More send options** - Username search OR QR scan
3. **Unified experience** - One page for both sending and receiving
4. **Better organization** - Related features grouped together

### For Development
1. **Cleaner code** - Single component handles send/receive
2. **Better state management** - Clear flow states
3. **Reusable components** - QR components used in multiple places
4. **Maintainable** - Logical component structure

---

## 🧪 Testing Checklist

### Send Mode
- [ ] Toggle to Send mode works
- [ ] "Search by Username" opens search
- [ ] User search works correctly
- [ ] Selected user flows to payment form
- [ ] "Scan QR Code" opens scanner
- [ ] QR scan creates temp user
- [ ] Scanned address flows to payment form
- [ ] Back navigation works at each step

### Receive Mode
- [ ] Toggle to Receive mode works
- [ ] QR code displays correctly
- [ ] Wallet address shown
- [ ] Copy address works
- [ ] QR code is scannable

### Profile Tab
- [ ] QR code section displays
- [ ] QR code matches wallet address
- [ ] Copy functionality works
- [ ] Layout looks good

### Navigation
- [ ] Tab renamed to "Send/Receive"
- [ ] Icon updated correctly
- [ ] Header dropdown only shows Sign Out
- [ ] All tabs navigate correctly

---

## 🔄 Migration Notes

### Breaking Changes
None - all existing functionality preserved

### New Features
- Unified Send/Receive page
- QR scanning for payments
- QR code in profile

### Removed Features
- QR code from header dropdown (moved to profile)

---

## 📚 Related Documentation

- **Main Integration**: `THIRDWEB_INTEGRATION.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Quick Start**: `QUICK_START.md`

---

## 🎉 Summary

The UI has been successfully reorganized to provide:
- ✅ Unified Send/Receive experience with toggle
- ✅ Multiple send options (search + QR scan)
- ✅ QR code permanently in Profile
- ✅ Cleaner navigation and better UX
- ✅ All existing functionality preserved

**Ready to test!** Run `npm run dev` and navigate to the Send/Receive tab to try the new experience.
