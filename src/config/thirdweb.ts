/**
 * Thirdweb Configuration
 * Centralized configuration for thirdweb SDK
 */

import { Base, Ethereum, Polygon } from "@thirdweb-dev/chains";

// Validate client ID
if (!import.meta.env.VITE_THIRDWEB_CLIENT_ID) {
  console.error('⚠️ VITE_THIRDWEB_CLIENT_ID is not set in .env file');
}

// Supported blockchain networks
export const SUPPORTED_CHAINS = [Ethereum, Polygon];

// Default active chain
export const DEFAULT_CHAIN = Ethereum;

// Thirdweb client configuration
export const THIRDWEB_CONFIG = {
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  activeChain: DEFAULT_CHAIN,
  supportedChains: SUPPORTED_CHAINS,
};

// Token contract addresses by chain
export const TOKEN_CONTRACTS: Record<number, Record<string, string>> = {
  // Ethereum (Chain ID: 1)
  [Ethereum.chainId]: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token
  },
  // Polygon (Chain ID: 137)
  [Polygon.chainId]: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    MATIC: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token
  },
};

// Helper to get token address by chain and symbol
export const getTokenAddress = (chainId: number, symbol: string): string | undefined => {
  return TOKEN_CONTRACTS[chainId]?.[symbol];
};

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  [Ethereum.chainId]: "Ethereum",
  [Polygon.chainId]: "Polygon",
};

// Get chain name by ID
export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};

// Supported tokens list for UI
export const SUPPORTED_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chains: [Ethereum.chainId, Polygon.chainId],
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chains: [Ethereum.chainId, Polygon.chainId],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    chains: [Ethereum.chainId],
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    chains: [Polygon.chainId],
  },
];

// Get supported tokens for a specific chain
export const getTokensForChain = (chainId: number) => {
  return SUPPORTED_TOKENS.filter(token => token.chains.includes(chainId as any));
};
