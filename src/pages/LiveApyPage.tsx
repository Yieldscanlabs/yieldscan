import React, { useState, useEffect } from 'react';
import { useApyStore } from '../store/apyStore';
import tokens from '../utils/tokens';
import styles from './LiveApyPage.module.css';
import { PROTOCOL_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import NetworkSelector from '../components/NetworkSelector';

const LiveApyPage: React.FC = () => {
  const { apyData, isLoading, error, lastUpdated, fetchApys } = useApyStore();
  const [selectedChain, setSelectedChain] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'token' | 'highestApy'>('highestApy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Refresh data on mount
  useEffect(() => {
    fetchApys(true);
  }, [fetchApys]);

  // Group tokens by chain for filter dropdown
  const chainOptions = React.useMemo(() => {
    const uniqueChains = new Set(tokens.map(t => t.chainId));
    return Array.from(uniqueChains).sort((a, b) => a - b);
  }, []);

  // Format timestamp for last updated
  const formattedLastUpdate = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString() 
    : 'Never';

  // Filter tokens by selected chain
  const filteredTokens = React.useMemo(() => {
    let result = tokens;
    
    // Filter by chain if not 'all'
    if (selectedChain !== 'all') {
      result = result.filter(token => token.chainId === selectedChain);
    }
    
    // Filter out duplicate underlying assets
    // Only keep regular tokens (non-yield-bearing)
    result = result.filter(token => !token.yieldBearingToken);
    
    return result;
  }, [tokens, selectedChain]);

  // Sort tokens
  const sortedTokens = React.useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortBy === 'token') {
        // Sort by token name
        const comparison = a.token.localeCompare(b.token);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        // Sort by highest APY
        const aTokenData = apyData[a.chainId]?.[a.address.toLowerCase()];
        const bTokenData = apyData[b.chainId]?.[b.address.toLowerCase()];
        
        const aHighestApy = aTokenData ? Math.max(...Object.values(aTokenData).filter(v => v !== undefined) as number[]) : 0;
        const bHighestApy = bTokenData ? Math.max(...Object.values(bTokenData).filter(v => v !== undefined) as number[]) : 0;
        
        return sortDirection === 'asc' ? aHighestApy - bHighestApy : bHighestApy - aHighestApy;
      }
    });
  }, [filteredTokens, sortBy, sortDirection, apyData]);

  // Toggle sort direction when clicking a column header
  const toggleSort = (column: 'token' | 'highestApy') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Get known protocol names
  const protocols = Object.values(PROTOCOL_NAMES);

  // Helper to find best APY for a token
  const getBestApyForToken = (token: typeof tokens[0]) => {
    const tokenData = apyData[token.chainId]?.[token.address.toLowerCase()];
    if (!tokenData) return { apy: null, protocol: null };
    
    let bestApy = 0;
    let bestProtocol = '';
    
    Object.entries(tokenData).forEach(([protocol, apy]) => {
      if (apy !== undefined && apy > bestApy) {
        bestApy = apy;
        bestProtocol = protocol;
      }
    });
    
    return { 
      apy: bestApy || null, 
      protocol: bestProtocol ? PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] || bestProtocol : null
    };
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>Live APY Rates</h1>
          <p className={styles.subtitle}>Real-time yield opportunities across major DeFi protocols</p>
        </div>
        <div className={styles.lastUpdatedBadge}>
          <div className={isLoading ? styles.pulsingDot : styles.statusDot}></div>
          <span>Last updated: {formattedLastUpdate}</span>
        </div>
      </div> */}
      
      {error && (
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>!</div>
          <div className={styles.errorText}>
            <h4>Error Loading Data</h4>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className={styles.filterToolbar}>
        <div className={styles.filterControls}>
          <NetworkSelector 
            selectedNetwork={selectedChain}
            networks={chainOptions}
            onChange={setSelectedChain}
            className={styles.compactNetworkSelector}
          />
        </div>
        <div className={styles.filterStats}>
          <div className={styles.statBadge}>
            <span>{sortedTokens.length}</span> Assets
          </div>
          <div className={styles.statBadge}>
            <span>{protocols.length}</span> Protocols
          </div>
        </div>
      </div>
      
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.apyTable}>
            <thead>
              <tr>
                <th onClick={() => toggleSort('token')} className={styles.sortableHeader}>
                  Asset
                  {sortBy === 'token' && (
                    <span className={styles.sortIndicator}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Network</th>
                {protocols.map(protocol => (
                  <th key={protocol} className={styles.protocolHeader}>{protocol}</th>
                ))}
                <th onClick={() => toggleSort('highestApy')} className={`${styles.sortableHeader} ${styles.bestApyHeader}`}>
                  Best Yield
                  {sortBy === 'highestApy' && (
                    <span className={styles.sortIndicator}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && sortedTokens.length === 0 ? (
                <tr>
                  <td colSpan={protocols.length + 3} className={styles.loadingRow}>
                    <div className={styles.loadingSpinner}></div>
                    <div>Fetching latest APY data...</div>
                  </td>
                </tr>
              ) : sortedTokens.length === 0 ? (
                <tr>
                  <td colSpan={protocols.length + 3} className={styles.emptyRow}>
                    <div className={styles.emptyStateIcon}>🔍</div>
                    <div className={styles.emptyStateText}>No assets found for the selected network</div>
                  </td>
                </tr>
              ) : (
                sortedTokens.map(token => {
                  const tokenData = apyData[token.chainId]?.[token.address.toLowerCase()];
                  const { apy: bestApy, protocol: bestProtocol } = getBestApyForToken(token);
                  
                  return (
                    <tr key={`${token.chain}-${token.token}`}>
                      <td className={styles.tokenCell}>
                        <img 
                          src={token.icon} 
                          alt={token.token} 
                          className={styles.tokenIcon} 
                        />
                        <span className={styles.tokenName}>{token.token}</span>
                      </td>
                      <td className={styles.networkCell}>
                        <div className={`${styles.networkBadge} ${styles[`network-${token.chainId}`]}`}>
                          {token.chainId === 1 ? 'Ethereum' : token.chainId === 42161 ? 'Arbitrum' : token.chainId}
                        </div>
                      </td>
                      {protocols.map(protocol => {
                        const protocolKey = Object.entries(PROTOCOL_NAMES)
                          .find(([_, value]) => value === protocol)?.[0]?.toLowerCase();
                        
                        const apy = protocolKey && tokenData ? tokenData[protocolKey as keyof typeof tokenData] : undefined;
                        const isBest = bestProtocol === protocol;
                        
                        return (
                          <td 
                            key={protocol} 
                            className={isBest ? styles.bestApyCell : styles.apyCell}
                          >
                            {apy !== undefined ? (
                              <span className={styles.apyValue}>{formatNumber(apy, 2)}%</span>
                            ) : (
                              <span className={styles.notAvailable}>-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className={styles.bestApyColumn}>
                        {bestApy !== null ? (
                          <div className={styles.bestApyWrapper}>
                            <span className={styles.bestApyValue}>
                              {formatNumber(bestApy, 2)}%
                            </span>
                            <span className={styles.bestProtocol}>
                              {bestProtocol}
                            </span>
                          </div>
                        ) : (
                          <span className={styles.notAvailable}>Not available</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* <div className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <div className={styles.infoIcon}>ℹ️</div>
          <h3>Understanding APY Comparisons</h3>
        </div>
        <div className={styles.infoContent}>
          <p>
            This table displays real-time Annual Percentage Yield (APY) rates across major DeFi protocols for all supported assets. 
            Rates are sourced directly from protocol APIs and smart contracts to provide the most up-to-date information.
          </p>
          <p>
            <strong>Best Yield</strong> highlights the optimal opportunity for each asset, allowing you to identify the most 
            rewarding strategies at a glance. Rates are subject to market conditions and protocol parameters.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default LiveApyPage;