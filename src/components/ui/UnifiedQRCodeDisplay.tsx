import React from 'react';
import { usePaymentMode } from '../../context/PaymentModeContext';
import QRCodeDisplay from './QRCodeDisplay';
import BankAccountQRCode from './BankAccountQRCode';
import { Wallet, Building2 } from 'lucide-react';

interface UnifiedQRCodeDisplayProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const UnifiedQRCodeDisplay: React.FC<UnifiedQRCodeDisplayProps> = ({ onClose, showCloseButton = true }) => {
  const { mode, isFiatMode, isCryptoMode, getModeLabel } = usePaymentMode();

  return (
    <div className="space-y-4">
      {/* Mode Indicator */}
      <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {isCryptoMode ? (
          <>
            <Wallet className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Crypto Wallet QR Code
            </span>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Bank Account QR Code
            </span>
          </>
        )}
      </div>

      {/* QR Code Display */}
      {isCryptoMode ? (
        <QRCodeDisplay onClose={onClose} showCloseButton={showCloseButton} />
      ) : (
        <BankAccountQRCode onClose={onClose} showCloseButton={showCloseButton} />
      )}

      {/* Mode Switch Hint */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Currently showing {getModeLabel()} QR code. Toggle mode in settings to switch.
      </div>
    </div>
  );
};

export default UnifiedQRCodeDisplay;
