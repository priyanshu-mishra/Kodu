import React, { useState } from 'react';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PaymentModeProvider } from './context/PaymentModeContext';
import { THIRDWEB_CONFIG, SUPPORTED_CHAINS } from './config/thirdweb';
import LoginForm from './components/auth/LoginForm';
import UsernameSetup from './components/auth/UsernameSetup';
import Layout from './components/ui/Layout';
import EnhancedBalanceDisplay from './components/payments/EnhancedBalanceDisplay';
import UnifiedSendReceive from './components/payments/UnifiedSendReceive';
import { type PaymentData } from './components/payments/SendPayment';
import UnifiedPaymentConfirm from './components/payments/UnifiedPaymentConfirm';
import TransactionHistory from './components/transactions/TransactionHistory';
import UserProfile from './components/profile/UserProfile';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type PaymentFlow = 'main' | 'confirm';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'send' | 'activity' | 'profile'>('home');
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>('main');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  if (isLoading) {
    return (
      <Layout currentTab="home" onTabChange={() => {}}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-sm">💰</span>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Kodu...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, showing login');
    return <LoginForm />;
  }

  // If authenticated but no user (new user after email verification), show username setup
  if (!user) {
    console.log('⚠️ Authenticated but no user, showing username setup');
    return <UsernameSetup />;
  }

  // If user exists but no username, show username setup
  if (!user.username) {
    console.log('⚠️ User exists but no username, showing username setup');
    return <UsernameSetup />;
  }

  console.log('✅ User authenticated with username, showing main app');

  return (
    <Layout currentTab={currentTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </Layout>
  );

  function handleTabChange(tab: 'home' | 'send' | 'activity' | 'profile') {
    setCurrentTab(tab);
    // Reset payment flow when changing tabs
    if (tab !== 'send') {
      setPaymentFlow('main');
      setPaymentData(null);
    }
  }

  function renderTabContent() {
    switch (currentTab) {
      case 'home':
        return (
          <div className="p-6">
            <div className="max-w-md mx-auto">
              <EnhancedBalanceDisplay />
              <UnifiedSendReceive onPaymentConfirm={(data: any) => {
                setPaymentData(data);
                setPaymentFlow('confirm');
              }} />
            </div>
          </div>
        );
      case 'send':
        if (paymentFlow === 'confirm' && paymentData) {
          return (
            <UnifiedPaymentConfirm
              paymentData={paymentData}
              onBack={() => {
                setPaymentFlow('main');
                setPaymentData(null);
              }}
              onSuccess={() => {
                setPaymentFlow('main');
                setPaymentData(null);
                setCurrentTab('activity');
              }}
            />
          );
        }
        return (
          <div className="p-6">
            <UnifiedSendReceive onPaymentConfirm={(data: any) => {
              setPaymentData(data);
              setPaymentFlow('confirm');
            }} />
          </div>
        );
      case 'activity':
        return (
          <div className="p-6">
            <TransactionHistory />
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <UserProfile />
          </div>
        );
      default:
        return null;
    }
  }
};

function App() {
  return (
    <ThirdwebProvider
      clientId={THIRDWEB_CONFIG.clientId}
      activeChain={THIRDWEB_CONFIG.activeChain}
      supportedChains={SUPPORTED_CHAINS}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PaymentModeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </PaymentModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}

export default App;
