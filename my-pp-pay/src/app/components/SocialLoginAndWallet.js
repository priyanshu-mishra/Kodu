import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ethers } from 'ethers';

export default function SocialLoginAndWallet() {
  const { user, signInWithProvider, signOut, loading } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [message, setMessage] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleSocialSignIn = async (provider) => {
    try {
      setMessage('Starting social sign in...');
      await signInWithProvider(provider);
      setMessage('Complete the OAuth flow and return to the app.');
    } catch (err) {
      setMessage('Sign-in failed: ' + (err.message || err));
    }
  };

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      if (!window.ethereum) {
        setMessage('MetaMask not detected. Install it and try again.');
        setConnecting(false);
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = ethers.utils.getAddress(accounts[0]);
      setWalletAddress(address);
      setMessage('Wallet connected: ' + address);
      setConnecting(false);

      // Prepare payload (do not auto-save unless RLS allows)
      const payload = {
        id: user?.id ?? null,
        email: user?.email ?? null,
        display_name: user?.user_metadata?.full_name ?? null,
        wallet_address: address,
        wallet_provider: 'metamask',
        created_at: new Date().toISOString()
      };
      console.log('Prepared payload (ready for DB upsert):', payload);
    } catch (err) {
      setMessage('Wallet connection failed: ' + (err.message || err));
      setConnecting(false);
    }
  };

  const upsertUserWallet = async (payload) => {
    // Only run if your RLS allows anon key writes; otherwise call your backend
    try {
      await supabase.from('users').upsert(payload, { returning: 'minimal' });
      setMessage('Saved user+wallet to Supabase (client upsert).');
    } catch (err) {
      setMessage('Failed to save: ' + (err.message || err));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Sign in & Connect MetaMask</h2>
      {!user && (
        <>
          <button onClick={() => handleSocialSignIn('google')}>Sign in with Google</button>
          <p>{message}</p>
        </>
      )}
      {user && (
        <div>
          <p>Signed in as: <strong>{user.email}</strong></p>
          {!walletAddress ? (
            <button onClick={handleConnectWallet} disabled={connecting}>
              {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          ) : (
            <>
              <p>Connected wallet: <strong>{walletAddress}</strong></p>
              <button onClick={() => upsertUserWallet({
                id: user.id,
                email: user.email,
                display_name: user.user_metadata?.full_name ?? null,
                wallet_address: walletAddress,
                wallet_provider: 'metamask'
              })}>Save profile + wallet to Supabase</button>
            </>
          )}
          <div><button onClick={signOut}>Sign out</button></div>
        </div>
      )}
    </div>
  );
}
