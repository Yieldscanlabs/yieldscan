import React, { useCallback, useMemo } from 'react';
import type { Asset, YieldOption } from '../types';
import { formatNumber } from '../utils/helpers';
import AssetIcon from './AssetIcon';
import YieldOptionComponent from './YieldOption';
import styles from './AssetList.module.css';
import { type BestApyResult } from '../hooks/useBestApy';
import { useApyStore } from '../store/apyStore';
import { getBestYield } from '../utils/getBestYield';
import { API_BASE_URL } from '../utils/constants';

interface AssetComponentProps {
  asset: Asset;
  price?: number;
  yieldInfo?: any; // Made optional as we rely on store data mostly
  isSelected: boolean;
  onSelect: (asset: Asset, bestApyData?: BestApyResult) => void;
}

const AssetComponent: React.FC<AssetComponentProps> = ({
  asset,
  isSelected,
  price,
  onSelect
}) => {
  const { apyData, isLoading: apyLoading } = useApyStore();

  // 1. Calculate the Global Best Yield (to determine the "Best Rate" badge)
  const globalBestResult = useMemo(() => 
    getBestYield(apyData, asset.chainId, asset.address), 
  [apyData, asset.chainId, asset.address]);

  // 2. Determine the Specific Data to display for THIS card
  const { displayData, isHighestApy } = useMemo(() => {
    // If this asset card belongs to a specific protocol group (e.g., "Kinza Finance")
    if (asset.protocol) {
      const normalizedAddr = asset.address.toLowerCase();
      const tokenData = apyData[asset.chainId]?.[normalizedAddr];
      
      let specificApy = null;

      if (tokenData) {
        // ROBUST MATCHING LOGIC
        // We need to match "Kinza Finance" (Asset) to "kinza" (API Key)
        const targetName = asset.protocol.toLowerCase().replace(/[^a-z0-9]/g, ''); // e.g. "kinzafinance"
        
        const matchingKey = Object.keys(tokenData).find(apiKey => {
           const normalizedKey = apiKey.toLowerCase().replace(/[^a-z0-9]/g, ''); // e.g. "kinza"
           // Check if one contains the other
           return targetName.includes(normalizedKey) || normalizedKey.includes(targetName);
        });

        if (matchingKey) {
          specificApy = tokenData[matchingKey as keyof typeof tokenData] as number;
        }
      }

      // Check if this specific protocol is actually the global winner
      // We accept a small margin of error (0.01) for floating point comparisons
      const isWinner = specificApy !== null && 
                       globalBestResult.bestApy !== null && 
                       specificApy >= (globalBestResult.bestApy - 0.01);

      return {
        displayData: {
          bestApy: specificApy, // Can be null if not found
          bestProtocol: asset.protocol, // Force display name to match the group
          aaveApy: null,
          compoundApy: null,
          loading: false,
          error: null
        } as BestApyResult,
        isHighestApy: isWinner
      };
    }

    // Fallback: If no protocol assigned (generic wallet item), show global best
    return {
      displayData: globalBestResult,
      isHighestApy: true // It IS the best because it shows the best
    };
  }, [apyData, asset, globalBestResult]);
  
  const handleSelect = useCallback(() => {
    onSelect(asset, displayData);
  }, [onSelect, asset, displayData]);

  // Log for debugging
  // console.log(`Asset: ${asset.token} | Protocol: ${asset.protocol} | APY: ${displayData.bestApy}`);

  return (
    <div
      className={`${styles['asset-card']} ${isSelected ? styles.selected : ''} ${isHighestApy ? styles.highlightWinner : ''}`}
      onClick={handleSelect}
      style={isHighestApy ? { border: '1px solid #4CAF50', boxShadow: '0 0 8px rgba(76, 175, 80, 0.15)' } : {}}
    >
      {isHighestApy && (
         <div className={styles.bestRateBadge} style={{
             position: 'absolute', top: '-10px', right: '10px', 
             background: '#4CAF50', color: 'white', padding: '2px 8px', 
             borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold',
             zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
         }}>
             Best Rate
         </div>
      )}

      <div className={styles['asset-main']}>
        <div className={styles['asset-info']}>
          <AssetIcon
            assetIcon={asset.icon ? API_BASE_URL + asset.icon : ''}
            assetName={asset.token}
            chainId={asset.chainId}
            size="medium"
          />
          <div>
            <div className={styles['asset-name-row']}>
              <span className={styles['asset-name']}>{asset.token}</span>
              {/* Optional: Protocol Badge */}
              {asset.protocol && (
                <span 
                style={{ 
                    fontSize: '0.7rem', color: '#888', marginLeft: '6px', 
                    background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' 
                }}
                >
                  {asset.protocol}
                </span>
              )}
            </div>
            <div className={styles['asset-balance']} title={asset.balance}>
              <small>Balance: </small>{formatNumber(asset.balance || '0', asset.maxDecimalsShow || 2)} 
              <span className={styles['asset-balance-usd']}>
                (${formatNumber(
                  price && asset.balance
                    ? price * Number(asset.balance)
                    : asset.balanceUsd || 0
                )})
              </span>
            </div>
          </div>
        </div>

        <div className={styles['yield-info']}>
          <YieldOptionComponent
            loading={apyLoading}
            asset={asset}
            bestApyData={displayData}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetComponent;