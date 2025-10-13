import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAddress, useConnectionStatus, useDisconnect } from "@thirdweb-dev/react";
import { type User, getUserByWalletAddress, createOrUpdateUser } from '../utils/supabase';
import { sendLoginCode, verifyLoginCode } from '../utils/thirdwebAPI';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  walletAddress: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, code: string) => Promise<void>;
  sendCode: (email: string) => Promise<void>;
  loginWithWallet: (walletAddress: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isTokenExpired: () => boolean;
  handleTokenExpiration: () => void;
  setAuthState: (state: AuthState) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Thirdweb hooks
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const disconnect = useDisconnect();
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    walletAddress: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        const storedToken = localStorage.getItem('thirdweb_token');
        const storedWalletAddress = localStorage.getItem('wallet_address');
        const authMethod = localStorage.getItem('auth_method');

        console.log('📦 Stored data:', { storedWalletAddress, authMethod, hasToken: !!storedToken });

        if (storedWalletAddress) {
          // Check for mock user first (demo mode)
          const mockUserData = localStorage.getItem('mock_user');
          if (mockUserData) {
            try {
              const mockUser = JSON.parse(mockUserData);
              console.log('📝 Demo mode: Using mock user');
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: mockUser,
                token: authMethod === 'email' ? storedToken : null,
                walletAddress: storedWalletAddress,
              });
              return;
            } catch (e) {
              console.warn('Failed to parse mock user');
            }
          }

          // Get user from Supabase
          const user = await getUserByWalletAddress(storedWalletAddress);
          console.log('👤 User from DB:', user);
          
          if (user) {
            console.log('✅ User found, setting authenticated state');
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user,
              token: authMethod === 'email' ? storedToken : null,
              walletAddress: storedWalletAddress,
            });
          } else {
            // User not found in DB but has wallet - keep them logged in for username setup
            console.log('⚠️ User not in DB, but wallet exists - keeping session for setup');
            setAuthState({
              isAuthenticated: true, // Keep authenticated so they can set username
              isLoading: false,
              user: null, // No user yet, will trigger username setup
              token: authMethod === 'email' ? storedToken : null,
              walletAddress: storedWalletAddress,
            });
          }
        } else {
          console.log('❌ No stored wallet, user not authenticated');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Sync thirdweb wallet connection with auth state
  useEffect(() => {
    const syncWalletConnection = async () => {
      if (address && connectionStatus === "connected") {
        // Wallet connected via thirdweb
        console.log('Wallet connected:', address);
        const existingUser = await getUserByWalletAddress(address);
        
        if (existingUser) {
          // User exists, update auth state
          console.log('Existing user found:', existingUser);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: existingUser,
            token: null,
            walletAddress: address,
          });
          localStorage.setItem('wallet_address', address);
          localStorage.setItem('auth_method', 'wallet');
        } else {
          // New wallet connection, create user in Supabase
          console.log('New wallet, creating user...');
          try {
            const newUser = await createOrUpdateUser('', address);
            console.log('User created:', newUser);
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: newUser,
              token: null,
              walletAddress: address,
            });
            localStorage.setItem('wallet_address', address);
            localStorage.setItem('auth_method', 'wallet');
          } catch (error) {
            console.error('Failed to create user:', error);
            setAuthState(prev => ({
              ...prev,
              walletAddress: address,
              isLoading: false,
            }));
          }
        }
      } else if (connectionStatus === "disconnected" && authState.walletAddress) {
        // Wallet disconnected
        if (localStorage.getItem('auth_method') === 'wallet') {
          // Clear auth state
          localStorage.removeItem('wallet_address');
          localStorage.removeItem('auth_method');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
            walletAddress: null,
          });
        }
      }
    };

    syncWalletConnection();
  }, [address, connectionStatus]);

  const sendCode = async (email: string) => {
    try {
      await sendLoginCode(email);
    } catch (error) {
      console.error('Failed to send login code:', error);
      throw error;
    }
  };

  const login = async (email: string, code: string) => {
    try {
      console.log('🔐 Starting login with email:', email);
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Verify code with thirdweb
      const authResult = await verifyLoginCode(email, code);
      const { token, walletAddress, isNewUser } = authResult;
      console.log('✅ Auth result:', { walletAddress, isNewUser });

      // Store token and wallet address with timestamp
      localStorage.setItem('thirdweb_token', token);
      localStorage.setItem('wallet_address', walletAddress);
      localStorage.setItem('auth_method', 'email');
      localStorage.setItem('token_timestamp', Date.now().toString());
      console.log('💾 Stored credentials in localStorage');

      // Create or get user from Supabase
      let user: User | null = null;
      try {
        if (isNewUser) {
          console.log('🆕 Creating new user...');
          user = await createOrUpdateUser(email, walletAddress);
          console.log('✅ New user created:', user);
        } else {
          const existingUser = await getUserByWalletAddress(walletAddress);
          if (existingUser) {
            console.log('✅ Found existing user:', existingUser);
            user = existingUser;
          } else {
            // User exists in thirdweb but not in our database
            console.log('⚠️ User in thirdweb but not Supabase, creating...');
            user = await createOrUpdateUser(email, walletAddress);
            console.log('✅ User created in Supabase:', user);
          }
        }
      } catch (dbError) {
        console.error('⚠️ Database error, but keeping session:', dbError);
        // Keep user logged in even if DB fails - they can set username later
      }

      console.log('✅ Setting auth state with user:', user);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
        walletAddress,
      });
      console.log('🎉 Login complete! isAuthenticated: true');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithWallet = async (walletAddress: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Check if user exists in Supabase
      let user = await getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create new user with wallet address
        user = await createOrUpdateUser('', walletAddress);
      }

      // Store wallet address and auth method
      localStorage.setItem('wallet_address', walletAddress);
      localStorage.setItem('auth_method', 'wallet');

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token: null, // No JWT token for wallet connections
        walletAddress,
      });
    } catch (error) {
      console.error('Wallet login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    // Disconnect thirdweb wallet if connected
    if (connectionStatus === "connected") {
      disconnect();
    }
    
    localStorage.removeItem('thirdweb_token');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('auth_method');
    localStorage.removeItem('token_timestamp');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      walletAddress: null,
    });
  };

  const isTokenExpired = (): boolean => {
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (!tokenTimestamp) return true;
    
    const tokenAge = Date.now() - parseInt(tokenTimestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return tokenAge > maxAge;
  };

  const handleTokenExpiration = () => {
    console.log('Token expired, logging out user');
    logout();
    // You could also show a modal asking user to re-authenticate
  };

  const updateUser = (updates: Partial<User>) => {
    console.log('📝 Updating user with:', updates);
    setAuthState(prev => {
      const updatedUser = prev.user ? { ...prev.user, ...updates } : (updates as User);
      console.log('✅ User updated to:', updatedUser);
      return {
        ...prev,
        user: updatedUser,
        isAuthenticated: true, // Ensure authenticated
      };
    });
  };

  const refreshUser = async () => {
    if (!authState.walletAddress) {
      console.log('⚠️ No wallet address, skipping refresh');
      return;
    }

    try {
      console.log('🔄 Refreshing user data for wallet:', authState.walletAddress);
      
      // Check mock user first (demo mode)
      const mockUserData = localStorage.getItem('mock_user');
      if (mockUserData) {
        try {
          const mockUser = JSON.parse(mockUserData);
          console.log('📝 Demo mode: Refreshing from mock user');
          setAuthState(prev => ({ 
            ...prev, 
            user: mockUser,
            isAuthenticated: true
          }));
          return;
        } catch (e) {
          console.warn('Failed to parse mock user');
        }
      }

      const user = await getUserByWalletAddress(authState.walletAddress);
      if (user) {
        console.log('✅ Refreshed user data from DB:', user);
        setAuthState(prev => ({ 
          ...prev, 
          user,
          isAuthenticated: true
        }));
      } else {
        console.log('⚠️ No user found in refresh');
      }
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    sendCode,
    loginWithWallet,
    logout,
    updateUser,
    refreshUser,
    isTokenExpired,
    handleTokenExpiration,
    setAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
