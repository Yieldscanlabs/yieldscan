import React, { useState, useRef, useEffect } from 'react';
import styles from './AssetSelector.module.css';
import AssetIcon from './AssetIcon';
import { API_BASE_URL } from '../utils/constants';

interface AssetData {
  token: string;
  icon?: string;
  chainId: number;
  label?: string;
  hasHoldings?: boolean;
}

interface AssetSelectorProps {
  selectedAsset: string | 'all';
  assets: AssetData[];
  onChange: (asset: string | 'all') => void;
  className?: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  assets,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (asset: string | 'all', disabled = false) => {
    if (disabled) return;
    onChange(asset);
    setIsOpen(false);
  };

  const displayValue = selectedAsset === 'all' ? 'All Assets' : selectedAsset;

  // Find the selected asset data for displaying its icon
  const selectedAssetData = selectedAsset !== 'all'
    ? assets.find(asset => asset.token === selectedAsset)
    : null;

    // console.log("Assetes list in AssetSelector: ", assets);
  return (
    <div className={`${styles.dropdown} ${className || ''}`} ref={dropdownRef}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedAssetData && (
          <span className={styles.assetIcon}>
            <AssetIcon
              assetIcon={selectedAssetData.icon ? API_BASE_URL + selectedAssetData.icon : ''}
              assetName={selectedAssetData.token}
              chainId={selectedAssetData.chainId}
              size="small"
            />
          </span>
        )}
        <span>{displayValue}</span>
        <span className={styles.arrow}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div
            className={`${styles.dropdownItem} ${selectedAsset === 'all' ? styles.selected : ''}`}
            onClick={() => handleSelect('all')}
          >
            All Assets
          </div>

          {assets.map((asset) => {
            const itemClasses = [
              styles.dropdownItem,
              selectedAsset === asset.token ? styles.selected : '',
              // Removed styles.unavailable so it looks clickable
            ].join(' ').trim();

            return (
              <div
                key={`${asset.token}-${asset.chainId}`} // Added chainId to key for uniqueness
                className={itemClasses}
                // FIX: Changed second arg to false so click is never disabled
                onClick={() => handleSelect(asset.token, false)}
              >
                <span className={styles.assetIcon}>
                  <AssetIcon
                    assetIcon={asset.icon ? API_BASE_URL + asset.icon : ''}
                    assetName={asset.token}
                    chainId={asset.chainId}
                    size="small"
                  />
                </span>
                <span>{asset.token}</span>
                {/* we can still show a visual indicator if they hold it, without blocking the click */}
                {/* {asset.hasHoldings && <span className={styles.holdingsIndicator}>•</span>} */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssetSelector;