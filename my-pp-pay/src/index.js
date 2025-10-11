import React from 'react';
import ReactDOM from 'react-dom';
import { AuthProvider } from './contexts/AuthContext';
import SocialLoginAndWallet from './components/SocialLoginAndWallet';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <SocialLoginAndWallet />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
