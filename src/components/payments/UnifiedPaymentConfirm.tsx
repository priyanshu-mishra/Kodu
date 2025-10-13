import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle, CreditCard, Building2, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TransactionService } from '../../services/transactionService';
import { BankAccountService } from '../../services/bankAccountService';
import { type UnifiedPaymentData } from './UnifiedSendPayment';
import PaymentConfirm from './PaymentConfirm';
import { type PaymentData } from './SendPayment';

interface UnifiedPaymentConfirmProps {
  paymentData: UnifiedPaymentData | PaymentData;
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'confirming' | 'processing' | 'success' | 'failed';

const UnifiedPaymentConfirm: React.FC<UnifiedPaymentConfirmProps> = ({ paymentData, onBack, onSuccess }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PaymentStatus>('confirming');
  const [error, setError] = useState('');

  // Check if this is a crypto payment (has token property)
  const isCryptoPayment = 'token' in paymentData && paymentData.token;

  // If crypto payment, use the existing PaymentConfirm component
  if (isCryptoPayment) {
    return (
      <PaymentConfirm
        paymentData={paymentData as PaymentData}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    );
  }

  // Otherwise, handle EUR internal or bank transfer
  const unifiedData = paymentData as UnifiedPaymentData;
  const { recipient, amount, message, paymentMethod, fromBankAccountId, toBankAccountId } = unifiedData;

  const [fromBankAccount, setFromBankAccount] = useState<any>(null);
  const [toBankAccount, setToBankAccount] = useState<any>(null);

  // Load bank account details if bank transfer
  useEffect(() => {
    if (paymentMethod === 'bank_transfer' && fromBankAccountId && toBankAccountId) {
      loadBankAccounts();
    }
  }, [paymentMethod, fromBankAccountId, toBankAccountId]);

  const loadBankAccounts = async () => {
    if (!fromBankAccountId || !toBankAccountId) return;

    try {
      const [fromAccount, toAccount] = await Promise.all([
        BankAccountService.getBankAccount(fromBankAccountId),
        BankAccountService.getBankAccount(toBankAccountId)
      ]);
      setFromBankAccount(fromAccount);
      setToBankAccount(toAccount);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    }
  };

  const executePayment = async () => {
    if (!user) return;

    try {
      setStatus('processing');
      setError('');

      let transaction;

      if (paymentMethod === 'eur_internal') {
        // EUR internal transfer
        transaction = await TransactionService.createEurInternalTransaction(
          user.id,
          recipient.id,
          amount,
          message
        );
      } else if (paymentMethod === 'bank_transfer') {
        // Bank transfer
        if (!fromBankAccountId || !toBankAccountId) {
          throw new Error('Bank account information missing');
        }

        transaction = await TransactionService.createBankTransferTransaction(
          user.id,
          recipient.id,
          fromBankAccountId,
          toBankAccountId,
          amount,
          message
        );
      } else {
        throw new Error('Unsupported payment method');
      }

      setStatus('success');

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setStatus('failed');
    }
  };

  const getPaymentMethodIcon = () => {
    if (paymentMethod === 'eur_internal') {
      return <Wallet className="h-8 w-8 text-green-600" />;
    } else if (paymentMethod === 'bank_transfer') {
      return <Building2 className="h-8 w-8 text-blue-600" />;
    }
    return <CreditCard className="h-8 w-8 text-gray-600" />;
  };

  const getPaymentMethodLabel = () => {
    if (paymentMethod === 'eur_internal') return 'EUR Internal Transfer';
    if (paymentMethod === 'bank_transfer') return 'Bank Transfer';
    return 'Payment';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-12 w-12 text-red-600" />;
      default:
        return getPaymentMethodIcon();
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return paymentMethod === 'eur_internal' 
          ? 'Processing EUR transfer...' 
          : 'Creating bank transfer...';
      case 'success':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Review your payment';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        {status === 'confirming' && (
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Payment</h1>
          </div>
        )}

        {/* Status Card */}
        <div className="venmo-card text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {getStatusMessage()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {getPaymentMethodLabel()}
          </p>
        </div>

        {/* Payment Details */}
        <div className="venmo-card space-y-4">
          {/* Recipient */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">To</p>
            <div className="flex items-center space-x-3">
              <div className="venmo-avatar">
                {recipient.display_name?.[0]?.toUpperCase() || recipient.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {recipient.display_name || recipient.username}
                </p>
                <p className="text-sm text-gray-500">@{recipient.username}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              €{parseFloat(amount).toFixed(2)}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Message</p>
              <p className="text-gray-900 dark:text-white">{message}</p>
            </div>
          )}

          {/* Bank Account Details (for bank transfers) */}
          {paymentMethod === 'bank_transfer' && fromBankAccount && toBankAccount && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">From Account</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {fromBankAccount.bank_name} - {BankAccountService.getMaskedAccountNumber(fromBankAccount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">To Account</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {toBankAccount.bank_name} - {BankAccountService.getMaskedAccountNumber(toBankAccount)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'confirming' && (
          <button
            onClick={executePayment}
            className="venmo-button w-full flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Confirm & Send €{parseFloat(amount).toFixed(2)}
          </button>
        )}

        {status === 'failed' && (
          <div className="space-y-3">
            <button
              onClick={executePayment}
              className="venmo-button w-full"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {status === 'success' && (
          <button
            onClick={onSuccess}
            className="venmo-button w-full"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedPaymentConfirm;
