import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PaymentModeProvider } from './context/PaymentModeContext';
import LoginForm from './components/auth/LoginForm';
import UsernameSetup from './components/auth/UsernameSetup';
import Layout from './components/ui/Layout';
import EnhancedBalanceDisplay from './components/payments/EnhancedBalanceDisplay';
import UserSearch from './components/users/UserSearch';
import UnifiedSendReceive from './components/payments/UnifiedSendReceive';
import { type PaymentData } from './components/payments/SendPayment';
import PaymentConfirm from './components/payments/PaymentConfirm';
import TransactionHistory from './components/transactions/TransactionHistory';
import UnifiedQRCodeDisplay from './components/ui/UnifiedQRCodeDisplay';
import BankAccountList from './components/profile/BankAccountList';

type PaymentFlow = 'main' | 'confirm';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'send' | 'activity' | 'search' | 'profile'>('home');
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>('main');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  if (isLoading) {
    return (
      <Layout currentTab="home" onTabChange={() => {}}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.username) {
    return <UsernameSetup />;
  }

  const handlePaymentConfirm = (data: PaymentData) => {
    setPaymentData(data);
    setPaymentFlow('confirm');
  };

  const handlePaymentSuccess = () => {
    setCurrentTab('home');
    setPaymentFlow('main');
    setPaymentData(null);
  };

  const handleBackToMain = () => {
    setPaymentFlow('main');
    setPaymentData(null);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="p-4 space-y-6 animate-fade-in">
            <EnhancedBalanceDisplay />
            <TransactionHistory />
          </div>
        );
      
      case 'send':
        if (paymentFlow === 'confirm' && paymentData) {
          return (
            <PaymentConfirm
              paymentData={paymentData}
              onBack={handleBackToMain}
              onSuccess={handlePaymentSuccess}
            />
          );
        }
        return (
          <UnifiedSendReceive
            onPaymentConfirm={handlePaymentConfirm}
          />
        );
      
      case 'activity':
        return (
          <div className="p-4 space-y-6">
            <TransactionHistory />
          </div>
        );
      
      case 'search':
        return (
          <div className="p-4 space-y-6">
            <div className="venmo-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Users</h2>
              <UserSearch 
                onUserSelect={() => {
                  // Navigate to send tab and trigger payment flow
                  setCurrentTab('send');
                }}
              />
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="p-4 space-y-6 animate-fade-in">
            <div className="venmo-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.display_name || user.username}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wallet Address</h4>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {user.wallet_address}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bank Accounts Section */}
            <div className="venmo-card">
              <BankAccountList userId={user.id} />
            </div>
            
            {/* QR Code Section */}
            <div className="venmo-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receive Payments</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share your QR code to receive payments
              </p>
              <UnifiedQRCodeDisplay showCloseButton={false} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleTabChange = (tab: 'home' | 'send' | 'activity' | 'search' | 'profile') => {
    setCurrentTab(tab);
    // Reset payment flow when changing tabs
    if (tab !== 'send') {
      setPaymentFlow('main');
      setPaymentData(null);
    } else {
      // Reset to main view when entering send tab
      setPaymentFlow('main');
      setPaymentData(null);
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <PaymentModeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PaymentModeProvider>
    </ThemeProvider>
  );
}

export default App;
