import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Building2 } from 'lucide-react';
import { BankAccountService } from '../../services/bankAccountService';
import type { BankAccount } from '../../types/database';
import type { User } from '../../utils/supabase';

export type PaymentMethodType = 'crypto' | 'eur_internal' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  currentUser: User;
  recipient: User;
  onMethodSelect: (method: PaymentMethodType, bankAccountId?: string, recipientBankAccountId?: string) => void;
  selectedMethod?: PaymentMethodType;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  currentUser,
  recipient,
  onMethodSelect,
  selectedMethod
}) => {
  const [userBankAccounts, setUserBankAccounts] = useState<BankAccount[]>([]);
  const [recipientBankAccounts, setRecipientBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBankAccounts();
  }, [currentUser.id, recipient.id]);

  const loadBankAccounts = async () => {
    try {
      setIsLoading(true);
      const [userAccounts, recipAccounts] = await Promise.all([
        BankAccountService.getUserBankAccounts(currentUser.id),
        BankAccountService.getUserBankAccounts(recipient.id)
      ]);
      
      setUserBankAccounts(userAccounts.filter(acc => acc.status === 'ACTIVE'));
      setRecipientBankAccounts(recipAccounts.filter(acc => acc.status === 'ACTIVE'));
      
      // Auto-select primary bank account if available
      const primaryAccount = userAccounts.find(acc => acc.is_primary && acc.status === 'ACTIVE');
      if (primaryAccount) {
        setSelectedBankAccount(primaryAccount.id);
      }
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodClick = (method: PaymentMethodType) => {
    if (method === 'bank_transfer') {
      // Get recipient's primary bank account or first active account
      const recipientAccount = recipientBankAccounts.find(acc => acc.is_primary) || recipientBankAccounts[0];
      onMethodSelect(method, selectedBankAccount, recipientAccount?.id);
    } else {
      onMethodSelect(method);
    }
  };

  const handleBankAccountChange = (accountId: string) => {
    setSelectedBankAccount(accountId);
    if (selectedMethod === 'bank_transfer') {
      const recipientAccount = recipientBankAccounts.find(acc => acc.is_primary) || recipientBankAccounts[0];
      onMethodSelect('bank_transfer', accountId, recipientAccount?.id);
    }
  };

  const hasBankTransferAvailable = userBankAccounts.length > 0 && recipientBankAccounts.length > 0;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Payment Method
        </h3>
        <div className="space-y-3">
          {/* Crypto Payment */}
          <button
            type="button"
            onClick={() => handleMethodClick('crypto')}
            className={`w-full p-4 border-2 rounded-xl transition-all ${
              selectedMethod === 'crypto'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === 'crypto'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Crypto Payment
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay with USDC or other cryptocurrencies
                </p>
              </div>
              {selectedMethod === 'crypto' && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>

          {/* EUR Internal Transfer */}
          <button
            type="button"
            onClick={() => handleMethodClick('eur_internal')}
            className={`w-full p-4 border-2 rounded-xl transition-all ${
              selectedMethod === 'eur_internal'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === 'eur_internal'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  EUR Balance
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instant transfer from your EUR balance
                </p>
              </div>
              {selectedMethod === 'eur_internal' && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            type="button"
            onClick={() => handleMethodClick('bank_transfer')}
            disabled={!hasBankTransferAvailable}
            className={`w-full p-4 border-2 rounded-xl transition-all ${
              selectedMethod === 'bank_transfer'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : hasBankTransferAvailable
                ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === 'bank_transfer'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Bank Transfer
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hasBankTransferAvailable
                    ? 'Transfer from your connected bank account'
                    : 'Connect a bank account to enable'}
                </p>
              </div>
              {selectedMethod === 'bank_transfer' && (
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>

          {/* Bank Account Selector (shown when bank transfer is selected) */}
          {selectedMethod === 'bank_transfer' && hasBankTransferAvailable && (
            <div className="ml-4 pl-4 border-l-2 border-purple-200 dark:border-purple-800 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Bank Account
              </label>
              <select
                value={selectedBankAccount}
                onChange={(e) => handleBankAccountChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose an account...</option>
                {userBankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {BankAccountService.getAccountDisplayName(account)}
                    {account.is_primary ? ' (Primary)' : ''}
                  </option>
                ))}
              </select>
              
              {recipientBankAccounts.length > 0 && (
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    ✓ Recipient has {recipientBankAccounts.length} bank account{recipientBankAccounts.length > 1 ? 's' : ''} connected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      {!hasBankTransferAvailable && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Connect a bank account in your profile to enable bank transfers
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
