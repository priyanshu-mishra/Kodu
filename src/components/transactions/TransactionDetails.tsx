import React from 'react';
import { ExternalLink, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { getBlockExplorerUrl, getBlockExplorerName } from '../../utils/thirdwebAPI';
import { CHAINS, formatTokenAmount } from '../../utils/contracts';

interface TransactionDetailsProps {
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  chainId: number;
  timestamp?: string;
  message?: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionHash,
  status,
  fromAddress,
  toAddress,
  amount,
  tokenSymbol,
  tokenDecimals,
  chainId,
  timestamp,
  message
}) => {
  const chainName = CHAINS.find(c => c.id === chainId)?.name || `Chain ${chainId}`;
  const formattedAmount = formatTokenAmount(amount, tokenDecimals);
  
  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <div className="venmo-card space-y-4">
      {/* Status Badge */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {/* Amount */}
      <div className="text-center py-4">
        <div className="text-3xl font-bold text-gray-900">
          {formattedAmount} {tokenSymbol}
        </div>
        <p className="text-sm text-gray-500 mt-1">{chainName}</p>
      </div>
      
      {/* Transaction Flow */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">From</p>
            <p className="text-sm font-mono text-gray-900">{shortenAddress(fromAddress)}</p>
          </div>
          
          <ArrowRight className="h-5 w-5 text-gray-400 mx-3" />
          
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-500 mb-1">To</p>
            <p className="text-sm font-mono text-gray-900">{shortenAddress(toAddress)}</p>
          </div>
        </div>
      </div>
      
      {/* Transaction Details */}
      <div className="space-y-3">
        {message && (
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600">Message</span>
            <p className="text-sm text-gray-900 text-right max-w-48">"{message}"</p>
          </div>
        )}
        
        {timestamp && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time</span>
            <p className="text-sm text-gray-900">
              {new Date(timestamp).toLocaleString()}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Network</span>
          <p className="text-sm text-gray-900">{chainName}</p>
        </div>
        
        {transactionHash && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Transaction Hash</span>
              <div className="text-right">
                <p className="text-xs font-mono text-gray-700 break-all max-w-48">
                  {transactionHash}
                </p>
                <a
                  href={getBlockExplorerUrl(chainId, transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 text-xs mt-1 hover:underline"
                >
                  View on {getBlockExplorerName(chainId)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
