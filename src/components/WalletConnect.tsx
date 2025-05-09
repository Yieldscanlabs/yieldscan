import React from 'react';
import useWallet from '../hooks/useWallet';
import { shortenAddress } from '../utils/helpers';
import styles from './WalletConnect.module.css';

interface WalletConnectProps {
  large?: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ large = false }) => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  
  if (large && !wallet.isConnected) {
    return (
      <button 
        onClick={connectWallet}
        className={styles['large-connect-button']}
      >
        Connect Wallet
      </button>
    );
  }
  
  return (
    <div className={styles['wallet-connect']}>
      {!wallet.isConnected ? (
        <button 
          onClick={connectWallet}
          className={styles['connect-button']}
        >
          Connect Wallet
        </button>
      ) : (
        <div className={styles['wallet-info']}>
          <span className={styles['wallet-address']}>{shortenAddress(wallet.address)}</span>
          <button 
            onClick={disconnectWallet}
            className={styles['disconnect-button']}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;