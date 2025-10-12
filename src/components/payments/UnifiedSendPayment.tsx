import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, MessageCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type User } from '../../utils/supabase';
import PaymentMethodSelector, { type PaymentMethodType } from './PaymentMethodSelector';
import { CHAINS, type TokenContract, parseTokenAmount } from '../../utils/contracts';
import TokenChainSelector from '../ui/TokenChainSelector';
import { useChainTokenPreference } from '../../hooks/useChainTokenPreference';
import { getWalletBalance } from '../../utils/thirdwebAPI';

const QUICK_AMOUNTS = ['10', '25', '50', '100', '250'];

interface UnifiedSendPaymentProps {
  recipient: User;
  onBack: () => void;
  onPaymentConfirm: (paymentData: UnifiedPaymentData) => void;
}

export interface UnifiedPaymentData {
  recipient: User;
  amount: string;
  message: string;
  paymentMethod: PaymentMethodType;
  
  // For crypto payments
  token?: TokenContract;
  amountWei?: string;
  
  // For bank transfers
  fromBankAccountId?: string;
  toBankAccountId?: string;
}

const UnifiedSendPayment: React.FC<UnifiedSendPaymentProps> = ({ recipient, onBack, onPaymentConfirm }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('eur_internal');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [recipientBankAccountId, setRecipientBankAccountId] = useState<string>('');
  const [error, setError] = useState('');

  // Crypto-specific state
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenContract | null>(null);
  const { preference, updateChain, updateToken } = useChainTokenPreference();
  const { chainId: selectedChainId } = preference;

  // Load crypto tokens and balances when crypto payment is selected
  useEffect(() => {
    if (paymentMethod === 'crypto' && user?.wallet_address) {
      loadTokensAndBalances();
    }
  }, [paymentMethod, user?.wallet_address, selectedChainId]);

  const loadTokensAndBalances = async () => {
    if (!user?.wallet_address) return;

    setIsLoadingBalances(true);
    const balanceMap: Record<string, string> = {};

    try {
      const selectedChain = CHAINS.find(c => c.id === selectedChainId);
      if (selectedChain) {
        for (const token of selectedChain.tokens) {
          try {
            const balanceResponse = await getWalletBalance(
              user.wallet_address,
              token.chainId,
              token.address
            );
            const balanceData = Array.isArray(balanceResponse.result) 
              ? balanceResponse.result[0] 
              : balanceResponse.result;
            balanceMap[token.address] = balanceData?.value || '0';
          } catch (error) {
            console.error(`Failed to fetch balance for ${token.symbol}:`, error);
            balanceMap[token.address] = '0';
          }
        }

        // Auto-select first token if none selected
        if (selectedChain.tokens.length > 0 && !selectedToken) {
          setSelectedToken(selectedChain.tokens[0]);
        }
      }

      setBalances(balanceMap);
    } catch (error) {
      console.error('Failed to load tokens and balances:', error);
      setError('Failed to load available tokens');
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethodType, bankAccountId?: string, recipientBankAccId?: string) => {
    setPaymentMethod(method);
    if (bankAccountId) {
      setSelectedBankAccountId(bankAccountId);
    }
    if (recipientBankAccId) {
      setRecipientBankAccountId(recipientBankAccId);
    }
    setError('');
  };

  const handleChainSelect = (chainId: number) => {
    updateChain(chainId);
    setSelectedToken(null);
  };

  const handleTokenSelect = (token: TokenContract) => {
    updateToken(token);
    setSelectedToken(token);
  };

  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const validatePayment = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (paymentMethod === 'crypto' && !selectedToken) {
      setError('Please select a token');
      return false;
    }

    if (paymentMethod === 'bank_transfer' && !selectedBankAccountId) {
      setError('Please select a bank account');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validatePayment()) return;

    const paymentData: UnifiedPaymentData = {
      recipient,
      amount,
      message: message.trim(),
      paymentMethod
    };

    if (paymentMethod === 'crypto' && selectedToken) {
      paymentData.token = selectedToken;
      paymentData.amountWei = parseTokenAmount(amount, selectedToken.decimals);
    }

    if (paymentMethod === 'bank_transfer') {
      paymentData.fromBankAccountId = selectedBankAccountId;
      paymentData.toBankAccountId = recipientBankAccountId;
    }

    onPaymentConfirm(paymentData);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Send Payment</h1>
      </div>

      {/* Recipient Info */}
      <div className="venmo-card">
        <div className="flex items-center space-x-3">
          <div className="venmo-avatar">
            {recipient.display_name?.[0]?.toUpperCase() || recipient.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {recipient.display_name || recipient.username}
            </p>
            <p className="text-sm text-gray-500">@{recipient.username}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="venmo-card">
        <PaymentMethodSelector
          currentUser={user}
          recipient={recipient}
          onMethodSelect={handleMethodSelect}
          selectedMethod={paymentMethod}
        />
      </div>

      {/* Payment Form */}
      <div className="venmo-card space-y-6">
        {/* Crypto Token Selector (only show for crypto payments) */}
        {paymentMethod === 'crypto' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network & Currency
            </label>
            {isLoadingBalances ? (
              <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
            ) : (
              <TokenChainSelector
                selectedChainId={selectedChainId}
                selectedTokenAddress={selectedToken?.address || null}
                onChainSelect={handleChainSelect}
                onTokenSelect={handleTokenSelect}
                balances={balances}
                showBalances={true}
              />
            )}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (EUR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="venmo-input pl-10 text-2xl font-semibold text-center"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="mt-3 flex space-x-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                €{quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's this for?"
              className="venmo-input pl-10"
              maxLength={100}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {message.length}/100 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!amount || parseFloat(amount) <= 0}
          className="venmo-button w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4 mr-2" />
          Continue
        </button>
      </div>
    </div>
  );
};

export default UnifiedSendPayment;
