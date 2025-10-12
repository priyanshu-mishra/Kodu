import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet } from 'lucide-react';

interface ConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ onSuccess, onError }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { loginWithWallet } = useAuth();

  const connectWallet = async () => {
    if (!window.ethereum) {
      onError?.('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        
        // Use the existing loginWithWallet function from AuthContext
        await loginWithWallet(walletAddress);
        
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      if (error.code === 4001) {
        onError?.('User rejected the connection request.');
      } else if (error.code === -32002) {
        onError?.('Connection request already pending. Please check MetaMask.');
      } else {
        onError?.('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="venmo-button w-full flex items-center justify-center"
      >
        {isConnecting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
};

export default ConnectButton;
