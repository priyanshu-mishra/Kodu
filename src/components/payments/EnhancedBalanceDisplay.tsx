/**
 * Enhanced Balance Display
 * Shows EUR balance as primary with optional crypto toggle
 * Integrates with new accounts/ledger system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { PaymentOrchestrator } from '../../services/paymentOrchestrator';
import type { Account, UserBalance } from '../../types/database';
import BuyCrypto from './BuyCrypto';

interface BalanceDisplayProps {
  onAddFunds?: () => void;
}

const EnhancedBalanceDisplay: React.FC<BalanceDisplayProps> = ({ onAddFunds }) => {
  const { user } = useAuth();
  const [eurBalance, setEurBalance] = useState<{ balance: string; available: string } | null>(null);
  const [cryptoBalances, setCryptoBalances] = useState<UserBalance[]>([]);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBuyCrypto, setShowBuyCrypto] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'eur' | 'crypto' | null>('eur');

  // Fetch EUR balance
  const fetchEurBalance = useCallback(async () => {
    if (!user?.id) return;

    try {
      const balance = await PaymentOrchestrator.getUserEurBalance(user.id);
      setEurBalance(balance);
    } catch (error) {
      console.error('Failed to fetch EUR balance:', error);
      setEurBalance({ balance: '0', available: '0' });
    }
  }, [user?.id]);

  // Fetch crypto balances (if user has any)
  const fetchCryptoBalances = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_type', 'USER_CRYPTO');

      if (error) throw error;

      setCryptoBalances(data as UserBalance[] || []);
    } catch (error) {
      console.error('Failed to fetch crypto balances:', error);
      setCryptoBalances([]);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    const loadBalances = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEurBalance(),
        fetchCryptoBalances()
      ]);
      setIsLoading(false);
    };

    loadBalances();
  }, [fetchEurBalance, fetchCryptoBalances]);

  // Subscribe to real-time balance updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh balances when accounts table changes
          fetchEurBalance();
          fetchCryptoBalances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchEurBalance, fetchCryptoBalances]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchEurBalance(),
      fetchCryptoBalances()
    ]);
    setIsRefreshing(false);
  };

  // Format currency
  const formatEur = (amount: string) => {
    if (!showAmounts) return '••••';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatCrypto = (amount: string, symbol: string) => {
    if (!showAmounts) return '••••';
    const num = parseFloat(amount);
    return `${num.toFixed(6)} ${symbol}`;
  };

  if (isLoading) {
    return (
      <div className="venmo-card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="venmo-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Your Balance</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {onAddFunds && (
              <button
                onClick={onAddFunds}
                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Add Funds"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title={showAmounts ? 'Hide amounts' : 'Show amounts'}
            >
              {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* EUR Balance (Primary) */}
        <div className="mb-4">
          <button
            onClick={() => setExpandedSection(expandedSection === 'eur' ? null : 'eur')}
            className="w-full"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">💶</span>
                    <span className="text-sm font-medium text-gray-600">Euro Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatEur(eurBalance?.balance || '0')}
                  </div>
                  {eurBalance && parseFloat(eurBalance.available) !== parseFloat(eurBalance.balance) && (
                    <div className="text-sm text-gray-500 mt-1">
                      Available: {formatEur(eurBalance.available)}
                    </div>
                  )}
                </div>
                {expandedSection === 'eur' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </button>

          {/* EUR Details (Expanded) */}
          {expandedSection === 'eur' && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Balance</span>
                <span className="font-medium text-gray-900">
                  {formatEur(eurBalance?.balance || '0')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">
                  {formatEur(eurBalance?.available || '0')}
                </span>
              </div>
              {eurBalance && parseFloat(eurBalance.balance) > parseFloat(eurBalance.available) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-orange-600">
                    {formatEur((parseFloat(eurBalance.balance) - parseFloat(eurBalance.available)).toString())}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Your EUR balance is instantly available for payments. Settled transactions appear immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Crypto Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowCrypto(!showCrypto)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {showCrypto ? 'Hide' : 'Show'} Crypto Balances
              </span>
              {cryptoBalances.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {cryptoBalances.length}
                </span>
              )}
            </div>
            {showCrypto ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Crypto Balances (Optional) */}
        {showCrypto && (
          <div className="space-y-3">
            {cryptoBalances.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-3">No crypto balances yet</p>
                <button
                  onClick={() => setShowBuyCrypto(true)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Buy Crypto
                </button>
              </div>
            ) : (
              cryptoBalances.map((balance) => (
                <div
                  key={balance.id}
                  className="p-4 bg-purple-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">💎</span>
                        <span className="text-sm font-medium text-gray-700">
                          {balance.currency}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCrypto(balance.balance, balance.currency)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ≈ {formatEur(balance.balance)} {/* Assuming 1:1 for MVP */}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 All payments are in EUR by default. Toggle "Use Crypto" when sending to use blockchain settlement.
          </p>
        </div>
      </div>

      {/* Buy Crypto Modal */}
      {showBuyCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <BuyCrypto onClose={() => setShowBuyCrypto(false)} />
        </div>
      )}
    </>
  );
};

export default EnhancedBalanceDisplay;
