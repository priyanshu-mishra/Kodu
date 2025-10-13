import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, QrCode, Search as SearchIcon } from 'lucide-react';
import { type User } from '../../utils/supabase';
import UserSearch from '../users/UserSearch';
import SendPayment, { type PaymentData } from './SendPayment';
import QRCodeDisplay from '../ui/QRCodeDisplay';
import QRCodeScanner from '../ui/QRCodeScanner';

interface SendReceiveProps {
  onPaymentConfirm: (paymentData: PaymentData) => void;
}

type Mode = 'send' | 'receive';
type SendFlow = 'select' | 'search' | 'scan' | 'form';

const SendReceive: React.FC<SendReceiveProps> = ({ onPaymentConfirm }) => {
  const [mode, setMode] = useState<Mode>('send');
  const [sendFlow, setSendFlow] = useState<SendFlow>('select');
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);

  const handleModeToggle = (newMode: Mode) => {
    setMode(newMode);
    setSendFlow('select');
    setSelectedRecipient(null);
  };

  const handleUserSelect = (user: User) => {
    setSelectedRecipient(user);
    setSendFlow('form');
  };

  const handleQRScan = (address: string) => {
    // Create a temporary user object with the scanned address
    const tempUser: User = {
      id: address,
      username: address.slice(0, 8),
      wallet_address: address,
      email: '',
      display_name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedRecipient(tempUser);
    setSendFlow('form');
  };

  const handleBackToSelect = () => {
    setSendFlow('select');
    setSelectedRecipient(null);
  };

  // Render Send Mode
  if (mode === 'send') {
    // Send - Form view (when recipient is selected)
    if (sendFlow === 'form' && selectedRecipient) {
      return (
        <SendPayment
          recipient={selectedRecipient}
          onBack={handleBackToSelect}
          onPaymentConfirm={onPaymentConfirm}
          onRecipientSelect={handleUserSelect}
        />
      );
    }

    // Send - QR Scanner view
    if (sendFlow === 'scan') {
      return (
        <div className="p-4">
          <QRCodeScanner
            onScan={handleQRScan}
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
              <h2 className="text-lg font-semibold text-gray-900">Search Users</h2>
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
      <div className="p-4 space-y-6">
        {/* Mode Toggle */}
        <div className="venmo-card">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleModeToggle('send')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'send'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="h-5 w-5" />
              <span>Send</span>
            </button>
            <button
              onClick={() => handleModeToggle('receive')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'receive'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="h-5 w-5" />
              <span>Receive</span>
            </button>
          </div>
        </div>

        {/* Send Options */}
        <div className="venmo-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Payment</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose how you want to send payment
          </p>

          <div className="space-y-3">
            {/* Search by Username */}
            <button
              onClick={() => setSendFlow('search')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <SearchIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Search by Username</p>
                  <p className="text-sm text-gray-500">Find users by their username</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>

            {/* Scan QR Code */}
            <button
              onClick={() => setSendFlow('scan')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <QrCode className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Scan QR Code</p>
                  <p className="text-sm text-gray-500">Scan recipient's wallet QR code</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Receive Mode
  return (
    <div className="p-4 space-y-6">
      {/* Mode Toggle */}
      <div className="venmo-card">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => handleModeToggle('send')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'send'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="h-5 w-5" />
            <span>Send</span>
          </button>
          <button
            onClick={() => handleModeToggle('receive')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === 'receive'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowDownLeft className="h-5 w-5" />
            <span>Receive</span>
          </button>
        </div>
      </div>

      {/* Receive - QR Code Display */}
      <div className="venmo-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Receive Payment</h2>
        <p className="text-sm text-gray-600 mb-6">
          Share your QR code or wallet address to receive payments
        </p>
        <QRCodeDisplay showCloseButton={false} />
      </div>
    </div>
  );
};

export default SendReceive;
