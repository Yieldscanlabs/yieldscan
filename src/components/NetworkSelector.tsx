import React from 'react';
import styles from './NetworkSelector.module.css';
import { getNetworkIcon, getNetworkName, getNetworkIconDataUrl } from '../utils/networkIcons';
import type { SupportedChain } from '../types';

export interface NetworkOption {
  id: number;
  name: string;
  icon?: string;
}

interface NetworkSelectorProps {
  selectedNetwork: number | 'all';
  networks: number[] | SupportedChain[];
  onChange: (chainId: number | SupportedChain | 'all') => void;
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  networks,
  onChange,
  className = ''
}) => {
  // Get network icon for a chain ID
  const renderNetworkIcon = (chainId: number | SupportedChain) => {
    try {
      const iconSrc = getNetworkIcon(chainId);
      return (
        <img 
          src={iconSrc} 
          alt={getNetworkName(chainId)} 
          className={styles.networkIconImage}
          onError={(e) => {
            // Fallback to data URL if image fails to load
            (e.target as HTMLImageElement).src = getNetworkIconDataUrl(chainId);
          }}
        />
      );
    } catch (error) {
      // Fallback to showing just the first letter
      return (
        <span className={styles.chainSymbol}>
          {getNetworkName(chainId).charAt(0)}
        </span>
      );
    }
  };

  // Get network icon class for a chain ID
  const getNetworkIconClass = (chainId: number | SupportedChain): string => {
    switch (chainId) {
      case 1:
        return styles.ethereum;
      case 42161:
        return styles.arbitrum;
      case 137:
        return styles.polygon;
      case 56:
        return styles.bsc;
      case 10:
        return styles.optimism;
      default:
        return styles.generic;
    }
  };

  return (
    <div className={`${styles.networkSelector} ${className}`}>
      <div 
        className={`${styles.networkOption} ${selectedNetwork === 'all' ? styles.selected : ''}`} 
        onClick={() => onChange('all')}
      >
        <div className={`${styles.networkIcon} ${styles.all}`}>
          <span className={styles.allIcon}>✦</span>
        </div>
        <span className={styles.networkName}>All Networks</span>
      </div>
      
      {networks.map(chainId => (
        <div 
          key={chainId}
          className={`${styles.networkOption} ${selectedNetwork === chainId ? styles.selected : ''}`}
          onClick={() => onChange(chainId)}
        >
          <div className={`${styles.networkIcon} ${getNetworkIconClass(chainId)}`}>
            {renderNetworkIcon(chainId)}
          </div>
          <span className={styles.networkName}>{getNetworkName(chainId)}</span>
        </div>
      ))}
    </div>
  );
};

export default NetworkSelector;