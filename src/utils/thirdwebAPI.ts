const THIRDWEB_API_BASE = 'https://api.thirdweb.com/v1';
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

// Debug logging
if (!CLIENT_ID || CLIENT_ID === 'your_thirdweb_client_id_here') {
  console.error('⚠️ thirdweb Client ID is not set! Please add VITE_THIRDWEB_CLIENT_ID to your .env file');
  console.log('Current CLIENT_ID:', CLIENT_ID);
}

export interface AuthResponse {
  token: string;
  walletAddress: string;
  isNewUser: boolean;
}

export interface BalanceResponse {
  result: {
    value: string;
    decimals: number;
    symbol: string;
    name: string;
  };
}

export interface CreatePaymentResponse {
  result: {
    id: string;
    link: string;
  };
}

export interface CompletePaymentResponse {
  result: {
    transactionId: string;
    status: string;
  };
}

export interface InsufficientFundsResponse {
  result: {
    link: string;
    rawQuote: unknown;
  };
}

// Payment status response from GET /payments/{id}
export interface PaymentStatusResponse {
  data: Array<{
    id: string;
    blockNumber: string;
    transactionId: string;
    clientId: string;
    sender: string;
    receiver: string;
    developerFeeRecipient: string;
    developerFeeBps: number;
    transactions: Array<{
      chainId: number;
      transactionHash: string;
    }>;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    type: string;
    originAmount: string;
    destinationAmount: string;
    paymentLinkId: string;
    purchaseData: unknown;
    originToken: {
      chainId: number;
      address: string;
      symbol: string;
      name: string;
      decimals: number;
      iconUri: string;
    };
    destinationToken: {
      chainId: number;
      address: string;
      symbol: string;
      name: string;
      decimals: number;
      iconUri: string;
    };
    createdAt: string;
  }>;
  meta: {
    totalCount: number;
  };
}

// Type guard function to check if response is insufficient funds
export const isInsufficientFundsResponse = (response: TransactionResponse | InsufficientFundsResponse): response is InsufficientFundsResponse => {
  return 'result' in response && 'link' in response.result && !('transactionId' in response.result);
}

export interface TransactionResponse {
  result: {
    transactionId: string;
    status: string;
  };
}

interface SendTokensBody {
  chainId: number;
  from: string;
  recipients: Array<{
    address: string;
    quantity: string;
  }>;
  tokenAddress?: string;
}

interface TransactionStatusResponse {
  result: {
    status: string;
    transactionHash?: string;
    blockNumber?: number;
  };
}

// Status mapping from thirdweb API to our internal statuses
export const mapThirdwebStatusToInternal = (thirdwebStatus: string | null): 'pending' | 'confirmed' | 'failed' => {
  if (!thirdwebStatus) return 'pending';
  
  switch (thirdwebStatus.toUpperCase()) {
    case 'QUEUED':
    case 'SUBMITTED':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
};

// Authentication Functions
export const sendLoginCode = async (email: string) => {
  const response = await fetch(`${THIRDWEB_API_BASE}/auth/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID
    },
    body: JSON.stringify({
      method: 'email',
      email: email
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send code error response:', errorText);
    throw new Error(`Failed to send login code: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const verifyLoginCode = async (email: string, code: string): Promise<AuthResponse> => {
  const response = await fetch(`${THIRDWEB_API_BASE}/auth/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID
    },
    body: JSON.stringify({
      method: 'email',
      email: email,
      code: code
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Verify code error response:', errorText);
    throw new Error(`Failed to verify login code: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // According to the API docs, response includes: token, walletAddress, isNewUser
  return {
    token: data.token,
    walletAddress: data.walletAddress,
    isNewUser: data.isNewUser
  };
};

// Balance Functions
// Thirdweb Balance API returns an array of results even for a single chainId
// Define types to reflect the API response accurately
export interface BalanceItem {
  chainId?: number;
  decimals: number;
  displayValue?: string;
  name: string;
  symbol: string;
  tokenAddress?: string;
  value: string;
}

export interface WalletBalanceAPIResponse {
  result: BalanceItem[];
}

export const getWalletBalance = async (address: string, chainId: number, tokenAddress?: string): Promise<WalletBalanceAPIResponse> => {
  const url = new URL(`${THIRDWEB_API_BASE}/wallets/${address}/balance`);
  url.searchParams.append('chainId', chainId.toString());
  
  // If tokenAddress is provided, add it as a query parameter
  // For native token balance, omit the tokenAddress parameter entirely
  if (tokenAddress && tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    url.searchParams.append('tokenAddress', tokenAddress);
  }
  
  console.log('Fetching balance for:', { address, chainId, tokenAddress, url: url.toString() });
  
  if (!CLIENT_ID) {
    throw new Error('thirdweb Client ID is not configured (VITE_THIRDWEB_CLIENT_ID).');
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Balance error response:', errorText);
    throw new Error(`Failed to get wallet balance: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Balance response:', data);
  
  // The API returns { result: [...] } format
  // Ensure we always return an array in the result field
  if (data.result && Array.isArray(data.result)) {
    return data as WalletBalanceAPIResponse;
  }
  
  // If result is a single object, wrap it in an array
  if (data.result && typeof data.result === 'object') {
    return { result: [data.result] } as WalletBalanceAPIResponse;
  }
  
  // Fallback: return empty array
  return { result: [] } as WalletBalanceAPIResponse;
};

// Get native token balance (ETH, MATIC, etc.)
export const getNativeTokenBalance = async (address: string, chainId: number): Promise<WalletBalanceAPIResponse> => {
  const url = new URL(`${THIRDWEB_API_BASE}/wallets/${address}/balance`);
  url.searchParams.append('chainId', chainId.toString());
  // Don't add tokenAddress for native token balance
  
  console.log('Fetching native token balance for:', { address, chainId, url: url.toString() });
  
  if (!CLIENT_ID) {
    throw new Error('thirdweb Client ID is not configured (VITE_THIRDWEB_CLIENT_ID).');
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Native balance error response:', errorText);
    throw new Error(`Failed to get native token balance: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Native balance response:', data);
  
  if (Array.isArray(data.result)) {
    return data as WalletBalanceAPIResponse;
  }
  return { result: [data.result] } as WalletBalanceAPIResponse;
};

// Get balances across multiple chains (native tokens)
// Supports up to 50 chains as per thirdweb API limits
export const getMultiChainBalance = async (address: string, chainIds: number[]): Promise<WalletBalanceAPIResponse> => {
  if (chainIds.length === 0) {
    throw new Error('At least one chain ID is required');
  }
  
  if (chainIds.length > 50) {
    throw new Error('Maximum 50 chain IDs allowed');
  }
  
  const url = new URL(`${THIRDWEB_API_BASE}/wallets/${address}/balance`);
  
  // Add multiple chainId parameters
  chainIds.forEach(chainId => {
    url.searchParams.append('chainId', chainId.toString());
  });
  
  console.log('Fetching multi-chain balance for:', { address, chainIds, url: url.toString() });
  
  if (!CLIENT_ID) {
    throw new Error('thirdweb Client ID is not configured (VITE_THIRDWEB_CLIENT_ID).');
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Multi-chain balance error response:', errorText);
    throw new Error(`Failed to get multi-chain balance: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Multi-chain balance response:', data);
  
  // API returns array of balances for multiple chains
  if (data.result && Array.isArray(data.result)) {
    return data as WalletBalanceAPIResponse;
  }
  
  return { result: [] } as WalletBalanceAPIResponse;
};

// Payment Functions - Using thirdweb's direct wallet transfer API
// Note: thirdweb's Payment API is for merchant/checkout flows
// For P2P transfers, we use the wallet send API directly
export const createPayment = async (
  name: string,
  description: string,
  recipient: string,
  tokenAddress: string,
  amount: string,
  chainId: number,
  userToken: string
): Promise<{id: string; link: string}> => {
  console.log('Creating payment for:', {
    name,
    description,
    recipient,
    tokenAddress,
    amount,
    chainId,
    userToken: userToken ? `${userToken.substring(0, 20)}...` : 'NO_TOKEN'
  });

  // Validate inputs
  if (!CLIENT_ID) {
    throw new Error('thirdweb Client ID is not configured');
  }
  
  if (!userToken) {
    throw new Error('User authentication token is required');
  }

  // For P2P payments, we'll create a payment intent that can be completed
  // This is a placeholder ID that we'll use to track the payment
  const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Store payment details in memory for completion
  // In production, you'd store this in a database
  const paymentData = {
    id: paymentId,
    name,
    description,
    recipient,
    tokenAddress,
    amount,
    chainId,
    status: 'pending'
  };
  
  // Store in sessionStorage for now
  sessionStorage.setItem(`payment_${paymentId}`, JSON.stringify(paymentData));
  
  console.log('Payment intent created:', paymentData);
  
  return {
    id: paymentId,
    link: `#payment/${paymentId}` // Internal link for insufficient funds flow
  };
};

export const completePayment = async (
  paymentId: string,
  fromAddress: string,
  userToken: string
): Promise<TransactionResponse | InsufficientFundsResponse> => {
  console.log('Completing payment for:', {
    paymentId,
    fromAddress
  });
  
  // Retrieve payment data from sessionStorage
  const paymentDataStr = sessionStorage.getItem(`payment_${paymentId}`);
  if (!paymentDataStr) {
    throw new Error('Payment not found. Please try again.');
  }
  
  const paymentData = JSON.parse(paymentDataStr);
  
  // Use thirdweb's wallet send API to execute the transfer
  try {
    const result = await sendTokens(
      fromAddress,
      paymentData.recipient,
      paymentData.amount,
      paymentData.chainId,
      userToken,
      paymentData.tokenAddress
    );
    
    console.log('Payment completed successfully:', result);
    
    // Clean up payment data
    sessionStorage.removeItem(`payment_${paymentId}`);
    
    return result;
  } catch (error: any) {
    console.error('Payment completion error:', error);
    
    // Check if this is an insufficient funds error
    if (error.message && error.message.includes('insufficient')) {
      // Return insufficient funds response
      return {
        result: {
          link: `https://thirdweb.com/wallet?chainId=${paymentData.chainId}`,
          rawQuote: {}
        }
      } as InsufficientFundsResponse;
    }
    
    throw error;
  }
};

// Get payment status without completing it
export const getPaymentStatus = async (
  paymentId: string,
  userToken: string
): Promise<PaymentStatusResponse> => {
  console.log('Getting payment status for:', paymentId);
  
  const response = await fetch(`${THIRDWEB_API_BASE}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'Authorization': `Bearer ${userToken}`
    }
  });

  console.log('Get payment status response:', response);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get payment status error response:', errorText);
    throw new Error(`Failed to get payment status: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Direct token transfer using thirdweb's wallet API
export const sendTokens = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  chainId: number,
  userToken: string,
  tokenAddress?: string
): Promise<TransactionResponse> => {
  console.log('Sending tokens:', {
    from: fromAddress,
    to: toAddress,
    amount,
    chainId,
    tokenAddress
  });

  const recipients = [{
    address: toAddress,
    quantity: amount
  }];

  const body: SendTokensBody = {
    chainId,
    from: fromAddress,
    recipients
  };

  // Add token address for ERC20 transfers
  // Omit for native token transfers (ETH, MATIC, etc.)
  if (tokenAddress && tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    body.tokenAddress = tokenAddress;
  }

  console.log('Send tokens request body:', JSON.stringify(body, null, 2));

  const response = await fetch(`${THIRDWEB_API_BASE}/wallets/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(body)
  });
  
  console.log('Send tokens response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send tokens error response:', errorText);
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log out and log back in.');
    } else if (response.status === 400) {
      // Parse error to check for insufficient funds
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.includes('insufficient')) {
          throw new Error('Insufficient funds to complete this transaction.');
        }
      } catch (e) {
        // If parsing fails, use generic error
      }
      throw new Error(`Invalid request: ${errorText}`);
    } else if (response.status === 403) {
      throw new Error('Access forbidden. Check your wallet permissions.');
    } else {
      throw new Error(`Failed to send tokens: ${response.status} ${response.statusText}`);
    }
  }
  
  const data = await response.json();
  console.log('Send tokens response data:', data);
  
  return data;
};

export const getTransactionStatus = async (transactionId: string): Promise<TransactionStatusResponse> => {
  const response = await fetch(`${THIRDWEB_API_BASE}/transactions/${transactionId}`, {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transaction status error response:', errorText);
    throw new Error(`Failed to get transaction status: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Refresh transaction statuses for pending transactions only
// Note: confirmed and failed are final statuses that don't need refreshing
export const refreshPendingTransactionStatuses = async (
  pendingTransactions: Array<{ id: string; thirdweb_transaction_id?: string }>,
  updateCallback: (transactionId: string, status: 'pending' | 'confirmed' | 'failed', transactionHash?: string) => Promise<void>
): Promise<void> => {
  const refreshPromises = pendingTransactions
    .filter(tx => tx.thirdweb_transaction_id) // Only refresh transactions with thirdweb IDs
    .map(async (tx) => {
      try {
        const statusResult = await getTransactionStatus(tx.thirdweb_transaction_id!);
        const internalStatus = mapThirdwebStatusToInternal(statusResult.result?.status);
        const transactionHash = statusResult.result?.transactionHash;
        
        // Only update if status has changed from pending to a final status
        if (internalStatus !== 'pending') {
          await updateCallback(tx.id, internalStatus, transactionHash);
        }
      } catch (error) {
        console.error(`Failed to refresh status for transaction ${tx.id}:`, error);
        // Continue with other transactions even if one fails
      }
    });

  await Promise.allSettled(refreshPromises);
};

export const getWalletTransactions = async (address: string, chainId: number, limit = 20) => {
  const url = new URL(`${THIRDWEB_API_BASE}/wallets/${address}/transactions`);
  url.searchParams.append('chainId', chainId.toString());
  url.searchParams.append('limit', limit.toString());
  
  const response = await fetch(url.toString(), {
    headers: {
      'x-client-id': CLIENT_ID
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Wallet transactions error response:', errorText);
    throw new Error(`Failed to get wallet transactions: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Blockchain Explorer Utilities
export const getBlockExplorerUrl = (chainId: number, txHash: string): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    8453: 'https://basescan.org/tx/',
  };
  
  const baseUrl = explorers[chainId];
  if (!baseUrl) {
    console.warn(`No explorer URL configured for chain ID ${chainId}`);
    return '';
  }
  
  return `${baseUrl}${txHash}`;
};

export const getBlockExplorerAddressUrl = (chainId: number, address: string): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io/address/',
    137: 'https://polygonscan.com/address/',
    8453: 'https://basescan.org/address/',
  };
  
  const baseUrl = explorers[chainId];
  if (!baseUrl) {
    console.warn(`No explorer URL configured for chain ID ${chainId}`);
    return '';
  }
  
  return `${baseUrl}${address}`;
};

export const getBlockExplorerName = (chainId: number): string => {
  const names: Record<number, string> = {
    1: 'Etherscan',
    137: 'Polygonscan',
    8453: 'Basescan',
  };
  
  return names[chainId] || 'Block Explorer';
};

// Buy Crypto Utilities - Using thirdweb's on-ramp
export interface BuyCryptoOptions {
  walletAddress: string;
  chainId: number;
  tokenAddress?: string;
  amount?: string;
}

export const generateBuyCryptoUrl = (options: BuyCryptoOptions): string => {
  const { walletAddress, chainId, tokenAddress, amount } = options;
  
  // thirdweb's buy crypto URL format
  const baseUrl = 'https://thirdweb.com/wallet';
  const url = new URL(baseUrl);
  
  // Add parameters
  url.searchParams.append('buyModal', 'true');
  url.searchParams.append('receiverAddress', walletAddress);
  url.searchParams.append('chainId', chainId.toString());
  
  if (tokenAddress) {
    url.searchParams.append('tokenAddress', tokenAddress);
  }
  
  if (amount) {
    url.searchParams.append('amount', amount);
  }
  
  // Add client ID for tracking
  if (CLIENT_ID) {
    url.searchParams.append('clientId', CLIENT_ID);
  }
  
  return url.toString();
};

// Open buy crypto modal
export const openBuyCryptoModal = (options: BuyCryptoOptions): void => {
  const url = generateBuyCryptoUrl(options);
  window.open(url, '_blank', 'width=500,height=700,noopener,noreferrer');
};
