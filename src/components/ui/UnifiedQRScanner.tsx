import React, { useState, useEffect } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { usePaymentMode } from '../../context/PaymentModeContext';
import { supabase } from '../../utils/supabase';
import type { User } from '../../utils/supabase';

interface UnifiedQRScannerProps {
  onClose: () => void;
  onScanSuccess: (recipient: User, paymentData?: any) => void;
}

interface BankPaymentData {
  type: 'bank_transfer';
  userId: string;
  username: string;
  displayName: string;
  bankAccountId: string;
  iban?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName: string;
  accountHolderName: string;
  currency: string;
}

const UnifiedQRScanner: React.FC<UnifiedQRScannerProps> = ({ onClose, onScanSuccess }) => {
  const { isFiatMode, isCryptoMode } = usePaymentMode();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onScanError = (errorMessage: string) => {
    // Ignore frequent scanning errors
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('QR scan error:', errorMessage);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError('');

    try {
      // Try to parse as JSON first (bank transfer QR)
      try {
        const data = JSON.parse(decodedText) as BankPaymentData;
        
        if (data.type === 'bank_transfer') {
          if (isCryptoMode) {
            setError('This is a bank transfer QR code. Switch to Fiat mode to use it.');
            setIsProcessing(false);
            return;
          }
          
          // Fetch user data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.userId)
            .single();

          if (userError || !userData) {
            setError('User not found');
            setIsProcessing(false);
            return;
          }

          // Pass both user and bank payment data
          onScanSuccess(userData as User, data);
          return;
        }
      } catch (e) {
        // Not JSON, might be wallet address
      }

      // Handle wallet address (crypto QR)
      if (decodedText.startsWith('ethereum:') || decodedText.startsWith('0x')) {
        if (isFiatMode) {
          setError('This is a crypto wallet QR code. Switch to Crypto mode to use it.');
          setIsProcessing(false);
          return;
        }

        const walletAddress = decodedText.replace('ethereum:', '');
        
        // Look up user by wallet address
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single();

        if (userError || !userData) {
          setError('User not found with this wallet address');
          setIsProcessing(false);
          return;
        }

        onScanSuccess(userData as User);
        return;
      }

      setError('Invalid QR code format');
      setIsProcessing(false);
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Failed to process QR code');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(handleScanSuccess, onScanError);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isCryptoMode ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
            }`}>
              <Camera className={`h-5 w-5 ${
                isCryptoMode ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scan QR Code
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCryptoMode ? 'Scan wallet QR code' : 'Scan bank account QR code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          <div id="qr-reader" className="rounded-lg overflow-hidden"></div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              How to scan:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Position the QR code within the frame</li>
              <li>• Hold steady until it scans automatically</li>
              <li>• Make sure you're in the correct mode ({isCryptoMode ? 'Crypto' : 'Fiat'})</li>
              <li>• Grant camera permission if prompted</li>
            </ul>
          </div>

          {/* Mode Warning */}
          <div className={`mt-4 p-3 rounded-lg ${
            isCryptoMode 
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}>
            <p className={`text-xs ${
              isCryptoMode 
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-green-700 dark:text-green-300'
            }`}>
              📱 Currently scanning for {isCryptoMode ? 'crypto wallet' : 'bank account'} QR codes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedQRScanner;
