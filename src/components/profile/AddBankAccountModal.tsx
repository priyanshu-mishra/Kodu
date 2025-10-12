import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { BankAccountService, type CreateBankAccountRequest } from '../../services/bankAccountService';
import type { BankAccountType } from '../../types/database';

interface AddBankAccountModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({ userId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateBankAccountRequest>({
    bank_name: '',
    account_holder_name: '',
    account_type: 'CHECKING',
    iban: '',
    account_number: '',
    routing_number: '',
    swift_bic: '',
    currency: 'EUR',
    country: 'EU',
    nickname: '',
    is_primary: false
  });
  const [useIban, setUseIban] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Prepare the request based on whether using IBAN or account number
      const request: CreateBankAccountRequest = {
        ...formData,
        iban: useIban ? formData.iban : undefined,
        account_number: !useIban ? formData.account_number : undefined,
        routing_number: !useIban ? formData.routing_number : undefined
      };

      await BankAccountService.createBankAccount(userId, request);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to add bank account:', err);
      setError(err.message || 'Failed to add bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateBankAccountRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Bank Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your bank account for transfers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              placeholder="e.g., Deutsche Bank, BNP Paribas"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              value={formData.account_holder_name}
              onChange={(e) => handleChange('account_holder_name', e.target.value)}
              placeholder="Full name as it appears on the account"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Type *
            </label>
            <select
              value={formData.account_type}
              onChange={(e) => handleChange('account_type', e.target.value as BankAccountType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          {/* Account Identifier Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Identifier
            </label>
            <div className="flex space-x-2 mb-3">
              <button
                type="button"
                onClick={() => setUseIban(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  useIban
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                IBAN
              </button>
              <button
                type="button"
                onClick={() => setUseIban(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !useIban
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Account Number
              </button>
            </div>

            {useIban ? (
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value.toUpperCase())}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required={useIban}
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => handleChange('account_number', e.target.value)}
                  placeholder="Account Number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required={!useIban}
                />
                <input
                  type="text"
                  value={formData.routing_number}
                  onChange={(e) => handleChange('routing_number', e.target.value)}
                  placeholder="Routing Number / Sort Code"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required={!useIban}
                />
              </div>
            )}
          </div>

          {/* SWIFT/BIC (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SWIFT/BIC Code (Optional)
            </label>
            <input
              type="text"
              value={formData.swift_bic}
              onChange={(e) => handleChange('swift_bic', e.target.value.toUpperCase())}
              placeholder="e.g., DEUTDEFF"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Currency and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value.toUpperCase())}
                placeholder="e.g., DE, FR, US"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Nickname (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nickname (Optional)
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="e.g., My Main Account, Business Account"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Set as Primary */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => handleChange('is_primary', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_primary" className="text-sm text-gray-700 dark:text-gray-300">
              Set as primary account for transfers
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankAccountModal;
