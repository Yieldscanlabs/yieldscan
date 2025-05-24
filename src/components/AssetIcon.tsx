import React from 'react';
import { getNetworkIcon } from '../utils/networkIcons';
import styles from './AssetIcon.module.css';

interface AssetIconProps {
  assetIcon: string;
  assetName: string;
  chainId: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const AssetIcon: React.FC<AssetIconProps> = ({
  assetIcon,
  assetName,
  chainId,
  size = 'small',
  className = ''
}) => {
  const chainIcon = getNetworkIcon(chainId);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallbackSvg = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#6366f1"/><text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${assetName.charAt(0).toUpperCase()}</text></svg>`)}`;
    e.currentTarget.src = fallbackSvg;
  };
  
  return (
    <div className={`${styles.assetIconWrapper} ${styles[`size-${size}`]} ${className}`}>
      <img 
        src={assetIcon} 
        alt={assetName} 
        className={styles.assetIcon}
        onError={handleImageError}
      />
      <img 
        src={chainIcon} 
        alt="Chain" 
        className={styles.chainIconOverlay}
      />
    </div>
  );
};

export default AssetIcon; 