import React, { useState } from 'react';
import { CreditCard, ExternalLink, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { openBuyCryptoModal, generateBuyCryptoUrl } from '../../utils/thirdwebAPI';
import { CHAINS, type TokenContract } from '../../utils/contracts';
import TokenChainSelector from '../ui/TokenChainSelector';
import { useChainTokenPreference } from '../../hooks/useChainTokenPreference';

interface BuyCryptoProps {
  preselectedChainId?: number;
  preselectedTokenAddress?: string;
  preselectedAmount?: string;
  onClose?: () => void;
}

const BuyCrypto: React.FC<BuyCryptoProps> = ({
  preselectedChainId,
  preselectedTokenAddress,
  preselectedAmount,
  onClose
}) => {
  const { user } = useAuth();
  const { preference, updateChain, updateToken } = useChainTokenPreference();
  const [amount, setAmount] = useState(preselectedAmount || '');
  const [selectedToken, setSelectedToken] = useState<TokenContract | null>(null);

  // Use preselected values or preference
  const chainId = preselectedChainId || preference.chainId;
  const tokenAddress = preselectedTokenAddress || preference.tokenAddress;

  const handleChainSelect = (newChainId: number) => {
    updateChain(newChainId);
    setSelectedToken(null);
  };

  const handleTokenSelect = (token: TokenContract) => {
    updateToken(token);
    setSelectedToken(token);
  };

  const handleBuyCrypto = () => {
    if (!user?.wallet_address) {
      alert('Please log in to buy crypto');
      return;
    }

    openBuyCryptoModal({
      walletAddress: user.wallet_address,
      chainId: chainId,
      tokenAddress: selectedToken?.address,
      amount: amount || undefined
    });
  };

  const getBuyCryptoUrl = () => {
    if (!user?.wallet_address) return '';
    
    return generateBuyCryptoUrl({
      walletAddress: user.wallet_address,
      chainId: chainId,
      tokenAddress: selectedToken?.address,
      amount: amount || undefined
    });
  };

  const chainName = CHAINS.find(c => c.id === chainId)?.name || 'Unknown Chain';

  return (
    <div className="venmo-card space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Buy Crypto</h2>
          <p className="text-sm text-gray-500">Add funds to your wallet</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">i</span>
            </div>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Powered by thirdweb</p>
            <p className="text-xs">
              Buy crypto with credit card, debit card, or bank transfer. 
              Funds will be sent directly to your wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Chain and Token Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Network & Token
        </label>
        <TokenChainSelector
          selectedChainId={chainId}
          selectedTokenAddress={tokenAddress}
          onChainSelect={handleChainSelect}
          onTokenSelect={handleTokenSelect}
          showBalances={false}
        />
        
        {selectedToken && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected:</span> {selectedToken.symbol} on {chainName}
            </p>
          </div>
        )}
      </div>

      {/* Amount Input (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (Optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in USD"
            className="venmo-input pl-10"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Leave empty to choose amount in the next step
        </p>
      </div>

      {/* Wallet Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receiving Address
        </label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-mono text-gray-700 break-all">
            {user?.wallet_address || 'Not logged in'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleBuyCrypto}
          disabled={!user?.wallet_address}
          className="venmo-button w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Buy Crypto
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
        <ol className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start">
            <span className="font-medium mr-2">1.</span>
            <span>Click "Buy Crypto" to open the purchase window</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">2.</span>
            <span>Choose your payment method and complete the purchase</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">3.</span>
            <span>Crypto will be sent directly to your wallet address</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">4.</span>
            <span>Refresh your balance to see the updated amount</span>
          </li>
        </ol>
      </div>

      {/* Debug Link (Development Only) */}
      {import.meta.env.DEV && user?.wallet_address && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Debug: Buy Crypto URL</p>
          <a
            href={getBuyCryptoUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all flex items-center"
          >
            {getBuyCryptoUrl()}
            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
};

export default BuyCrypto;
