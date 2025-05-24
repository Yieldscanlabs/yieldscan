import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/LiveApy.module.css';
import tokens from '../../../utils/tokens';
import { PROTOCOL_NAMES } from '../../../utils/constants';
import { formatNumber } from '../../../utils/helpers';
import NetworkSelector from '../../../components/NetworkSelector';
import Protocol from '../../../components/Protocol';

interface ApyTableProps {
  apyData: any;
  isLoading: boolean;
  error: string | null;
}

const ApyTable: React.FC<ApyTableProps> = ({ apyData, isLoading, error }) => {
  const [selectedChain, setSelectedChain] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'token' | 'highestApy'>('highestApy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Group tokens by chain for filter dropdown
  const chainOptions = React.useMemo(() => {
    const uniqueChains = new Set(tokens.map(t => t.chainId));
    return Array.from(uniqueChains).sort((a, b) => a - b);
  }, []);

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
      // Ensure apy is a number and greater than current best
      if (typeof apy === 'number' && apy > bestApy) {
        bestApy = apy;
        bestProtocol = protocol;
      }
    });
    
    return { 
      apy: bestApy || null, 
      protocol: bestProtocol ? PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] || bestProtocol : null
    };
  };

  // Refs for the table sections
  const leftTableRef = useRef<HTMLDivElement>(null);
  const middleTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);
  
  // Synchronize vertical scrolling
  useEffect(() => {
    const leftTable = leftTableRef.current;
    const middleTable = middleTableRef.current;
    const rightTable = rightTableRef.current;
    
    if (!leftTable || !middleTable || !rightTable) return;
    
    const syncScroll = (e: Event) => {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      
      if (e.target === middleTable) {
        if (leftTable.scrollTop !== scrollTop) leftTable.scrollTop = scrollTop;
        if (rightTable.scrollTop !== scrollTop) rightTable.scrollTop = scrollTop;
      } else if (e.target === leftTable) {
        if (middleTable.scrollTop !== scrollTop) middleTable.scrollTop = scrollTop;
        if (rightTable.scrollTop !== scrollTop) rightTable.scrollTop = scrollTop;
      } else if (e.target === rightTable) {
        if (leftTable.scrollTop !== scrollTop) leftTable.scrollTop = scrollTop;
        if (middleTable.scrollTop !== scrollTop) middleTable.scrollTop = scrollTop;
      }
    };
    
    // Add scroll event listeners
    leftTable.addEventListener('scroll', syncScroll);
    middleTable.addEventListener('scroll', syncScroll);
    rightTable.addEventListener('scroll', syncScroll);
    
    return () => {
      // Clean up event listeners
      leftTable.removeEventListener('scroll', syncScroll);
      middleTable.removeEventListener('scroll', syncScroll);
      rightTable.removeEventListener('scroll', syncScroll);
    };
  }, []);

  return (
    <>
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
            //@ts-ignore
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
        <div className={styles.tableLayout}>
          {/* Fixed left columns */}
          <div className={styles.fixedLeft} ref={leftTableRef}>
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
                </tr>
              </thead>
              <tbody>
                {isLoading && sortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.loadingRow}>
                      <div className={styles.loadingSpinner}></div>
                      <div>Loading...</div>
                    </td>
                  </tr>
                ) : sortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.emptyRow}>
                      <div className={styles.emptyStateIcon}>🔍</div>
                      <div className={styles.emptyStateText}>No assets</div>
                    </td>
                  </tr>
                ) : (
                  sortedTokens.map(token => (
                    <tr key={`token-${token.chainId}-${token.address}`}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Scrollable middle (protocols) */}
          <div className={styles.scrollableMiddle} ref={middleTableRef}>
            <table className={styles.apyTable}>
              <thead>
                <tr>
                  {protocols.map(protocol => (
                    <th key={protocol} className={styles.protocolHeader}>
                      <Protocol name={protocol} showLogo={true}/>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && sortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={protocols.length} className={styles.loadingRow}>
                      <div className={styles.loadingSpinner}></div>
                      <div>Fetching...</div>
                    </td>
                  </tr>
                ) : sortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={protocols.length} className={styles.emptyRow}>
                      <div className={styles.emptyStateIcon}>🔍</div>
                      <div className={styles.emptyStateText}>No data</div>
                    </td>
                  </tr>
                ) : (
                  sortedTokens.map(token => {
                    const tokenData = apyData[token.chainId]?.[token.address.toLowerCase()];
                    const { protocol: bestProtocol } = getBestApyForToken(token);
                    
                    return (
                      <tr key={`token-${token.chainId}-${token.address}`}>
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Fixed right column (best yield) */}
          <div className={styles.fixedRight} ref={rightTableRef}>
            <table className={styles.apyTable}>
              <thead>
                <tr>
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
                    <td className={styles.loadingRow}>
                      <div className={styles.loadingSpinner}></div>
                      <div>Loading...</div>
                    </td>
                  </tr>
                ) : sortedTokens.length === 0 ? (
                  <tr>
                    <td className={styles.emptyRow}>
                      <div className={styles.emptyStateIcon}>🔍</div>
                      <div className={styles.emptyStateText}>No data</div>
                    </td>
                  </tr>
                ) : (
                  sortedTokens.map(token => {
                    const { apy: bestApy, protocol: bestProtocol } = getBestApyForToken(token);
                    
                    return (
                      <tr key={`token-${token.chainId}-${token.address}`}>
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
      </div>

    </>
  );
};

export default ApyTable; 