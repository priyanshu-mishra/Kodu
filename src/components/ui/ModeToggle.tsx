import React from 'react';
import { Wallet, Building2 } from 'lucide-react';
import { usePaymentMode } from '../../context/PaymentModeContext';

const ModeToggle: React.FC = () => {
  const { mode, toggleMode, isFiatMode, isCryptoMode, getModeLabel } = usePaymentMode();

  return (
    <button
      onClick={toggleMode}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg ${
        isCryptoMode
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      }`}
      title={`Switch to ${isCryptoMode ? 'Fiat' : 'Crypto'} mode`}
    >
      {isCryptoMode ? (
        <>
          <Wallet className="h-4 w-4" />
          <span className="text-sm">Crypto</span>
        </>
      ) : (
        <>
          <Building2 className="h-4 w-4" />
          <span className="text-sm">Fiat</span>
        </>
      )}
      <div className="w-10 h-5 bg-white bg-opacity-30 rounded-full relative">
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            isCryptoMode ? 'translate-x-0.5' : 'translate-x-5'
          }`}
        />
      </div>
    </button>
  );
};

export default ModeToggle;
