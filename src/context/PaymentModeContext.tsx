/**
 * Payment Mode Context - Global EUR/Crypto Toggle
 * Controls the entire app payment experience
 */

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Global payment mode - determines entire UX
export type GlobalPaymentMode = 'FIAT' | 'CRYPTO';

interface PaymentModeContextType {
  mode: GlobalPaymentMode;
  toggleMode: () => void;
  setMode: (mode: GlobalPaymentMode) => void;
  isFiatMode: boolean;
  isCryptoMode: boolean;
  getModeLabel: () => string;
  getModeColor: () => string;
}

const PaymentModeContext = createContext<PaymentModeContextType | undefined>(undefined);

export const PaymentModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<GlobalPaymentMode>(() => {
    const saved = localStorage.getItem('kodu-global-payment-mode');
    return (saved === 'CRYPTO' ? 'CRYPTO' : 'FIAT') as GlobalPaymentMode;
  });

  const toggleMode = () => {
    setModeState(prev => {
      const newMode = prev === 'FIAT' ? 'CRYPTO' : 'FIAT';
      localStorage.setItem('kodu-global-payment-mode', newMode);
      return newMode;
    });
  };

  const setMode = (newMode: GlobalPaymentMode) => {
    setModeState(newMode);
    localStorage.setItem('kodu-global-payment-mode', newMode);
  };

  const getModeLabel = () => {
    return mode === 'FIAT' ? 'EUR/USD' : 'Crypto';
  };

  const getModeColor = () => {
    return mode === 'FIAT' ? 'green' : 'blue';
  };

  return (
    <PaymentModeContext.Provider
      value={{
        mode,
        toggleMode,
        setMode,
        isFiatMode: mode === 'FIAT',
        isCryptoMode: mode === 'CRYPTO',
        getModeLabel,
        getModeColor
      }}
    >
      {children}
    </PaymentModeContext.Provider>
  );
};

export const usePaymentMode = () => {
  const context = useContext(PaymentModeContext);
  if (!context) {
    throw new Error('usePaymentMode must be used within PaymentModeProvider');
  }
  return context;
};
