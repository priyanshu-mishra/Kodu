import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QRCodeDisplayProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ onClose, showCloseButton = true }) => {
  const { walletAddress } = useAuth();
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate QR code using a simple approach (we'll enhance this with Thirdweb later)
  useEffect(() => {
    if (walletAddress) {
      // For now, we'll use a simple QR code generation
      // In a real implementation, we'd use Thirdweb's QR code functionality
      const qrData = `ethereum:${walletAddress}`;
      
      // Create a simple QR code using a free service (we'll replace this with Thirdweb)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
      setQrCodeDataUrl(qrUrl);
    }
  }, [walletAddress]);

  const copyToClipboard = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletAddress) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No wallet connected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm mx-auto">
      {showCloseButton && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      <div className="text-center">
        <div className="mb-4">
          <QrCode className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">Your Wallet Address</h3>
          <p className="text-sm text-gray-600">Scan to receive payments</p>
        </div>

        {qrCodeDataUrl && (
          <div className="mb-4">
            <img
              src={qrCodeDataUrl}
              alt="Wallet QR Code"
              className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
            />
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
          <div className="flex items-center justify-center space-x-2">
            <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono">
              {formatAddress(walletAddress)}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Share this QR code or address to receive payments
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
