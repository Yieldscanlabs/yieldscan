import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { CHAIN_NAMES, TOKEN_NAMES } from '../utils/constants';
import { formatNumber, getBestYieldOptionForAsset, calculateDailyYield } from '../utils/helpers';
import styles from './AssetList.module.css';

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  onSelectAsset: (asset: Asset) => void;
  selectedAsset: Asset | null;
}

const AssetList: React.FC<AssetListProps> = ({ 
  assets, 
  loading, 
  onSelectAsset,
  selectedAsset 
}) => {
  // Track best yield options for each asset
  const [assetYields, setAssetYields] = useState<Record<string, {
    loading: boolean;
    option?: YieldOption;
    yearlyYieldUsd: string;
  }>>({});

  // Fetch best yield options when assets are loaded
  useEffect(() => {
    if (assets.length === 0) return;

    // Initialize loading state for all assets
    const initialYieldState: Record<string, {
      loading: boolean;
      option?: YieldOption;
      yearlyYieldUsd: string;
    }> = {};
    
    assets.forEach(asset => {
      const assetKey = `${asset.token}-${asset.chain}`;
      initialYieldState[assetKey] = {
        loading: true,
        yearlyYieldUsd: '0.00'
      };
    });
    
    setAssetYields(initialYieldState);
    
    // Fetch yield options
    const fetchYieldOptions = async () => {
      const updatedYields = { ...initialYieldState };
      
      for (const asset of assets) {
        const assetKey = `${asset.token}-${asset.chain}`;
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Get best yield option for this asset
        const bestOption = getBestYieldOptionForAsset(asset.token, asset.chain);
        
        if (bestOption) {
          // Calculate earnings
          const balanceNum = parseFloat(asset.balance);
          const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
          const dailyEarningsToken = calculateDailyYield(balanceNum, bestOption.apy);
          const dailyEarningsUsd = dailyEarningsToken * usdPrice;
          const yearlyEarningsUsd = dailyEarningsUsd * 365;
          
          updatedYields[assetKey] = {
            loading: false,
            option: bestOption,
            yearlyYieldUsd: formatNumber(yearlyEarningsUsd, 2)
          };
        } else {
          updatedYields[assetKey] = {
            loading: false,
            yearlyYieldUsd: '0.00'
          };
        }
        
        // Update state after each asset's data is fetched
        setAssetYields(prev => ({
          ...prev,
          [assetKey]: updatedYields[assetKey]
        }));
      }
    };
    
    fetchYieldOptions();
  }, [assets]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles['loading-spinner']}></div>
        <div className={styles['loading-text']}>Loading your assets...</div>
      </div>
    );
  }
  
  if (assets.length === 0) {
    return (
      <div className={styles['no-assets']}>
        <p>No assets found in your wallet</p>
        <p className={styles['no-assets-subtext']}>We're looking for USDC and USDT on Ethereum and Arbitrum</p>
      </div>
    );
  }
  
  return (
    <div className={styles['asset-list']}>
      <h2>Your Assets</h2>
      <div className={styles['asset-grid']}>
        {assets.map((asset) => {
          const assetKey = `${asset.token}-${asset.chain}`;
          const yieldInfo = assetYields[assetKey];
          
          return (
            <div 
              key={assetKey} 
              className={`${styles['asset-card']} ${selectedAsset === asset ? styles.selected : ''}`}
              onClick={() => onSelectAsset(asset)}
            >
              <div className={styles['asset-main']}>
                <div className={styles['asset-info']}>
                  <img src={asset.icon} alt={asset.token} className={styles['asset-icon']} />
                  <div>
                    <div className={styles['asset-name-row']}>
                      <span className={styles['asset-name']}>{asset.token}</span>
                      <span className={styles['asset-chain']}>{CHAIN_NAMES[asset.chain]}</span>
                    </div>
                    <div className={styles['asset-balance']}>
                      {formatNumber(asset.balance)} <span className={styles['asset-balance-usd']}>(${formatNumber(asset.balanceUsd)})</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles['yield-info']}>
                  {yieldInfo?.loading ? (
                    <div className={styles['yield-loading']}>
                      <div className={styles['yield-loading-spinner']}></div>
                    </div>
                  ) : yieldInfo?.option ? (
                    <>
                      <div className={styles['yield-apy']}>
                        {yieldInfo.option.apy}% APY
                        {yieldInfo.option.lockupDays > 0 && (
                          <span className={styles['lock-icon']} title={`${yieldInfo.option.lockupDays} days lockup`}>🔒</span>
                        )}
                      </div>
                      <div className={styles['yield-details']}>
                        <span className={styles['yield-protocol']}>{yieldInfo.option.protocol}</span>
                        <span className={styles['yield-earning']}>${yieldInfo.yearlyYieldUsd}/year</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles['no-yield']}>No yield options</div>
                  )}
                </div>
              </div>
          
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetList;