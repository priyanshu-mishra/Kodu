import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Copy, Check, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BankAccountService } from '../../services/bankAccountService';
import type { BankAccount } from '../../types/database';

interface BankAccountQRCodeProps {
  showCloseButton?: boolean;
  onClose?: () => void;
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

const BankAccountQRCode: React.FC<BankAccountQRCodeProps> = ({ showCloseButton = true, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    loadPrimaryBankAccount();
  }, [user?.id]);

  const loadPrimaryBankAccount = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const primary = await BankAccountService.getPrimaryBankAccount(user.id);
      
      if (!primary) {
        // Get first active account if no primary
        const accounts = await BankAccountService.getUserBankAccounts(user.id);
        const activeAccount = accounts.find(acc => acc.status === 'ACTIVE');
        setBankAccount(activeAccount || null);
      } else {
        setBankAccount(primary);
      }
    } catch (error) {
      console.error('Failed to load bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !bankAccount || !qrCodeRef.current) return;

    const paymentData: BankPaymentData = {
      type: 'bank_transfer',
      userId: user.id,
      username: user.username,
      displayName: user.display_name || user.username,
      bankAccountId: bankAccount.id,
      iban: bankAccount.iban,
      accountNumber: bankAccount.account_number,
      routingNumber: bankAccount.routing_number,
      bankName: bankAccount.bank_name,
      accountHolderName: bankAccount.account_holder_name,
      currency: bankAccount.currency
    };

    const qrData = JSON.stringify(paymentData);

    qrCodeInstance.current = new QRCodeStyling({
      width: 280,
      height: 280,
      data: qrData,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'M'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 4
      },
      dotsOptions: {
        color: '#10b981',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        color: '#059669',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#059669',
        type: 'dot'
      }
    });

    qrCodeRef.current.innerHTML = '';
    qrCodeInstance.current.append(qrCodeRef.current);
  }, [user, bankAccount]);

  const handleDownload = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: `${user?.username}-bank-qr`,
        extension: 'png'
      });
    }
  };

  const handleCopy = () => {
    if (!bankAccount) return;
    
    const accountInfo = bankAccount.iban 
      ? `IBAN: ${bankAccount.iban}`
      : `Account: ${bankAccount.account_number} | Routing: ${bankAccount.routing_number}`;
    
    const textToCopy = `${user?.display_name || user?.username}\n${accountInfo}\nBank: ${bankAccount.bank_name}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bank account...</p>
      </div>
    );
  }

  if (!bankAccount) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Building2 className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Bank Account Connected
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add a bank account in your profile to receive bank transfers
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Profile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-3">
          {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {user.display_name || user.username}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div ref={qrCodeRef} className="flex items-center justify-center" />
      </div>

      {/* Bank Account Info */}
      <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">{bankAccount.bank_name}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {bankAccount.account_holder_name}
        </p>
        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {bankAccount.iban 
            ? `IBAN: ${BankAccountService.getMaskedAccountNumber(bankAccount)}`
            : `Account: ${BankAccountService.getMaskedAccountNumber(bankAccount)}`
          }
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {bankAccount.currency} • {bankAccount.account_type}
        </p>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs">
        <p>Scan this QR code to send me money via bank transfer</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Info</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>

      {/* Close Button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default BankAccountQRCode;
