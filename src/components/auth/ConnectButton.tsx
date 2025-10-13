/**
 * ConnectButton - Thirdweb SDK Integration
 * Using thirdweb's ConnectWallet component for professional wallet connection
 */

import React, { useState, useEffect } from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";

interface ConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure QueryClient is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-xl font-medium cursor-not-allowed"
        >
          Initializing...
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ConnectWallet
        theme="light"
        btnTitle="Connect Wallet"
        modalTitle="Choose Your Wallet"
        modalSize="wide"
        welcomeScreen={{
          title: "Welcome to Kodu",
          subtitle: "Connect your wallet to get started with instant P2P payments",
        }}
        modalTitleIconUrl=""
        detailsBtn={() => {
          return <div>View Details</div>;
        }}
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
        }}
        switchToActiveChain={true}
        className="w-full"
        hideTestnetFaucet={true}
      />
    </div>
  );
};

export default ConnectButton;
