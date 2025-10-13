import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Check, Trash2, Edit2 } from 'lucide-react';
import { BankAccountService } from '../../services/bankAccountService';
import type { BankAccount } from '../../types/database';
import AddBankAccountModal from './AddBankAccountModal';

interface BankAccountListProps {
  userId: string;
}

const BankAccountList: React.FC<BankAccountListProps> = ({ userId }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBankAccounts();
  }, [userId]);

  const loadBankAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await BankAccountService.getUserBankAccounts(userId);
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
      setError('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      await BankAccountService.setPrimaryBankAccount(accountId, userId);
      await loadBankAccounts();
    } catch (err) {
      console.error('Failed to set primary account:', err);
      setError('Failed to set primary account');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      await BankAccountService.deleteBankAccount(accountId, userId);
      await loadBankAccounts();
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account');
    }
  };

  const handleAccountAdded = () => {
    setShowAddModal(false);
    loadBankAccounts();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      ACTIVE: 'Active',
      PENDING_VERIFICATION: 'Pending',
      SUSPENDED: 'Suspended',
      CLOSED: 'Closed'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.PENDING_VERIFICATION}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bank Accounts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your connected bank accounts for transfers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Bank Accounts List */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Bank Accounts
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add a bank account to enable bank transfers
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Account</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {BankAccountService.getAccountDisplayName(account)}
                      </h4>
                      {account.is_primary && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Primary
                        </span>
                      )}
                      {getStatusBadge(account.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.account_holder_name}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {account.iban ? `IBAN: ${BankAccountService.getMaskedAccountNumber(account)}` : 
                       account.account_number ? `Account: ${BankAccountService.getMaskedAccountNumber(account)}` : 
                       'No account number'}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>{account.currency}</span>
                      <span>•</span>
                      <span>{account.account_type}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {!account.is_primary && account.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleSetPrimary(account.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <AddBankAccountModal
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAccountAdded}
        />
      )}
    </div>
  );
};

export default BankAccountList;
