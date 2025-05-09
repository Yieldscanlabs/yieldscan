import React from 'react';
import useWallet from '../hooks/useWallet';
import { shortenAddress } from '../utils/helpers';

const WalletConnect: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  
  return (
    <div className="wallet-connect">
      {!wallet.isConnected ? (
        <button 
          onClick={connectWallet}
          className="connect-button"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">{shortenAddress(wallet.address)}</span>
          <button 
            onClick={disconnectWallet}
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;