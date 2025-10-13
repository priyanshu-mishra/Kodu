import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, QrCode, Search as SearchIcon, Wallet, Building2 } from 'lucide-react';
import { usePaymentMode } from '../../context/PaymentModeContext';
import { type User } from '../../utils/supabase';
import UserSearch from '../users/UserSearch';
import SendPayment, { type PaymentData } from './SendPayment';
import UnifiedSendPayment, { type UnifiedPaymentData } from './UnifiedSendPayment';
import UnifiedQRCodeDisplay from '../ui/UnifiedQRCodeDisplay';
import UnifiedQRScanner from '../ui/UnifiedQRScanner';

interface UnifiedSendReceiveProps {
  onPaymentConfirm: (paymentData: any) => void;
}

type Mode = 'send' | 'receive';
type SendFlow = 'select' | 'search' | 'scan' | 'form';

const UnifiedSendReceive: React.FC<UnifiedSendReceiveProps> = ({ onPaymentConfirm }) => {
  const { mode: paymentMode, isFiatMode, isCryptoMode, getModeLabel, getModeColor } = usePaymentMode();
  const [mode, setMode] = useState<Mode>('send');
  const [sendFlow, setSendFlow] = useState<SendFlow>('select');
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [bankPaymentData, setBankPaymentData] = useState<any>(null);

  const handleModeToggle = (newMode: Mode) => {
    setMode(newMode);
    setSendFlow('select');
    setSelectedRecipient(null);
    setBankPaymentData(null);
  };

  const handleUserSelect = (user: User, additionalData?: any) => {
    setSelectedRecipient(user);
    if (additionalData) {
      setBankPaymentData(additionalData);
    }
    setSendFlow('form');
  };

  const handleBackToSelect = () => {
    setSendFlow('select');
    setSelectedRecipient(null);
    setBankPaymentData(null);
  };

  const handleUnifiedPaymentConfirm = (data: UnifiedPaymentData) => {
    // Convert unified payment data to appropriate format
    if (data.paymentMethod === 'crypto' && data.token) {
      // Crypto payment
      const cryptoPayment: PaymentData = {
        recipient: data.recipient,
        token: data.token,
        amount: data.amount,
        amountWei: data.amountWei!,
        message: data.message
      };
      onPaymentConfirm(cryptoPayment);
    } else {
      // Fiat payment (EUR internal or bank transfer)
      onPaymentConfirm(data);
    }
  };

  // Render Send Mode
  if (mode === 'send') {
    // Send - Form view (when recipient is selected)
    if (sendFlow === 'form' && selectedRecipient) {
      return (
        <UnifiedSendPayment
          recipient={selectedRecipient}
          onBack={handleBackToSelect}
          onPaymentConfirm={handleUnifiedPaymentConfirm}
        />
      );
    }

    // Send - QR Scanner view
    if (sendFlow === 'scan') {
      return (
        <div className="p-4">
          <UnifiedQRScanner
            onScanSuccess={handleUserSelect}
            onClose={handleBackToSelect}
          />
        </div>
      );
    }

    // Send - User Search view
    if (sendFlow === 'search') {
      return (
        <div className="p-4 space-y-6">
          <div className="venmo-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Users</h2>
              <button
                onClick={handleBackToSelect}
                className="text-sm text-blue-600 hover:underline"
              >
                Back
              </button>
            </div>
            <UserSearch 
              showPayButton={true}
              onUserSelect={handleUserSelect}
            />
          </div>
        </div>
      );
    }

    // Send - Selection view (default)
    return (
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Mode Indicator */}
        <div className={`venmo-card ${
          isCryptoMode 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
            : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCryptoMode ? (
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getModeLabel()} Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isCryptoMode 
                    ? 'Send crypto payments via blockchain' 
                    : 'Send fiat payments via bank transfer or EUR balance'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleModeToggle('send')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold transition-all ${
              mode === 'send'
                ? isCryptoMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <ArrowUpRight className="h-5 w-5" />
            <span>Send</span>
          </button>
          <button
            onClick={() => handleModeToggle('receive')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold transition-all ${
              mode === 'receive'
                ? isCryptoMode
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <ArrowDownLeft className="h-5 w-5" />
            <span>Receive</span>
          </button>
        </div>

        {/* Send Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
            Choose how to send:
          </h3>

          {/* Search Users */}
          <button
            onClick={() => setSendFlow('search')}
            className="venmo-card w-full text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCryptoMode 
                  ? 'bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200' 
                  : 'bg-green-100 dark:bg-green-900 group-hover:bg-green-200'
              }`}>
                <SearchIcon className={`h-6 w-6 ${
                  isCryptoMode ? 'text-blue-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Search Users
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find someone by username or name
                </p>
              </div>
            </div>
          </button>

          {/* Scan QR Code */}
          <button
            onClick={() => setSendFlow('scan')}
            className="venmo-card w-full text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCryptoMode 
                  ? 'bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200' 
                  : 'bg-green-100 dark:bg-green-900 group-hover:bg-green-200'
              }`}>
                <QrCode className={`h-6 w-6 ${
                  isCryptoMode ? 'text-blue-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Scan QR Code
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isCryptoMode 
                    ? 'Scan a wallet QR code' 
                    : 'Scan a bank account QR code'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Render Receive Mode
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex space-x-3">
        <button
          onClick={() => handleModeToggle('send')}
          className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold transition-all ${
            mode === 'send'
              ? isCryptoMode
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <ArrowUpRight className="h-5 w-5" />
          <span>Send</span>
        </button>
        <button
          onClick={() => handleModeToggle('receive')}
          className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold transition-all ${
            mode === 'receive'
              ? isCryptoMode
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <ArrowDownLeft className="h-5 w-5" />
          <span>Receive</span>
        </button>
      </div>

      {/* QR Code Display */}
      <div className="venmo-card">
        <UnifiedQRCodeDisplay showCloseButton={false} />
      </div>
    </div>
  );
};

export default UnifiedSendReceive;
