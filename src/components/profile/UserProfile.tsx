import React from 'react';
import { Wallet, Mail, Calendar, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConnectWallet, useAddress, useBalance, useChainId, useSwitchChain } from '@thirdweb-dev/react';
import { CHAINS } from '../../utils/contracts';
import BankAccountList from './BankAccountList';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const address = useAddress();
  const chainId = useChainId();
  const switchChain = useSwitchChain();
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  // Get balance for current chain
  const currentBalance = useBalance();

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain(targetChainId);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  const getChainName = (id: number | undefined) => {
    if (!id) return 'Unknown';
    const chain = CHAINS.find(c => c.id === id);
    return chain?.name || `Chain ${id}`;
  };

  const formatBalance = (balance: any) => {
    if (!balance || !balance.data) return '0';
    return parseFloat(balance.data.displayValue).toFixed(4);
  };

  const getCurrentChainSymbol = () => {
    if (chainId === 1) return 'ETH';
    if (chainId === 137) return 'MATIC';
    return 'TOKEN';
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="venmo-card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.display_name || user?.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
          </div>
        </div>

        <div className="space-y-3">
          {user?.email && (
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
            </div>
          )}
          
          {user?.created_at && (
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Connection Card */}
      <div className="venmo-card">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Connection</h3>
        </div>

        {address ? (
          <div className="space-y-4">
            {/* Wallet Address */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Wallet Address
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                  {address}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  title="Copy address"
                >
                  {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Current Chain */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Current Network
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {getChainName(chainId)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Chain ID: {chainId}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Chain Balance */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Current Network Balance
              </label>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chainId === 1 ? '💎' : '🟣'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getChainName(chainId)}
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatBalance(currentBalance)} {getCurrentChainSymbol()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Chain ID: {chainId}
                </div>
              </div>
            </div>

            {/* Switch Network */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Switch Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSwitchChain(1)}
                  disabled={chainId === 1}
                  className={`p-3 rounded-lg border transition-colors ${
                    chainId === 1
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💎</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Ethereum</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitchChain(137)}
                  disabled={chainId === 137}
                  className={`p-3 rounded-lg border transition-colors ${
                    chainId === 137
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🟣</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Polygon</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Wallet Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ConnectWallet
                theme="light"
                btnTitle="Manage Wallet"
                modalTitle="Wallet Details"
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No wallet connected</p>
            <ConnectWallet
              theme="light"
              btnTitle="Connect Wallet"
              modalTitle="Choose Your Wallet"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
        )}
      </div>

      {/* Bank Accounts Section */}
      <div className="venmo-card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Accounts</h3>
        <BankAccountList userId={user!.id} />
      </div>

      {/* Sign Out Button */}
      <button
        onClick={logout}
        className="w-full py-3 px-4 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;
