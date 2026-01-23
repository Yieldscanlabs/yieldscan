import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/LiveApy.module.css';
import tokens from '../../../utils/tokens';
import { PROTOCOL_NAMES } from '../../../utils/constants';
import { formatNumber } from '../../../utils/helpers';
import NetworkSelector from '../../../components/NetworkSelector';
import Protocol from '../../../components/Protocol';
import useWalletConnection from '../../../hooks/useWalletConnection';
import WalletModal from '../../../components/WalletModal';
import { getNetworkName } from '../../../utils/networkIcons';
import AssetSelector from '../../../components/AssetSelector';

interface ApyTableProps {
  apyData: any;
  isLoading: boolean;
  error: string | null;
  selectedAsset: string | 'all';
  onAssetChange: (asset: string | 'all') => void;
  selectedChain: number | 'all';
  onChainChange: (c: number | 'all') => void;
  filteredAssetList: any[];
}

const ApyTable: React.FC<ApyTableProps> = ({ apyData, isLoading, error, selectedAsset, onAssetChange, selectedChain, onChainChange, filteredAssetList }) => {
  const [sortBy, setSortBy] = useState<'token' | 'highestApy'>('highestApy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();

  // Custom CTA component for APY table
  const ApyTableCTA = () => (
    <div className={styles.apyTableCta}>
      <div className={styles.ctaContent}>
        <div className={styles.ctaHeader}>
          <div className={styles.ctaIcon}>
            <div className={styles.yieldCircle}>
              <span className={styles.percentSign}>%</span>
            </div>
          </div>
          <div className={styles.ctaText}>
            <h3>Connect to track your yields</h3>
            <p>See which protocols offer the best rates for your assets</p>
          </div>
          <button
            className={styles.ctaButton}
            onClick={openConnectModal}
          >
            <span className={styles.buttonText}>Connect Wallet</span>
            <div className={styles.buttonIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Group tokens by chain for filter dropdown
  const chainOptions = React.useMemo(() => {
    const uniqueChains = new Set(tokens.map(t => t.chainId));
    return Array.from(uniqueChains).sort((a, b) => a - b);
  }, []);

  // 1. Calculate allowed tokens (filtering out yield-bearing tokens like aWBNB)
  const allowedTokensForSelector = React.useMemo(() => {
    let result = tokens;

    if (selectedChain !== 'all') {
      result = result.filter(token => token.chainId === selectedChain);
    }

    result = result.filter(token => !token.yieldBearingToken);

    return result;
  }, [selectedChain]);

  // 2. Clean the asset list passed from parent (Case-Insensitive Match)
  const cleanAssetList = React.useMemo(() => {
    // Create a Set of Uppercase symbols
    const validSymbols = new Set(allowedTokensForSelector.map(t => t.token.toUpperCase()));
    
    // Check against Uppercase asset token
    return filteredAssetList.filter(asset => validSymbols.has(asset.token.toUpperCase()));
  }, [filteredAssetList, allowedTokensForSelector]);


  // 3. TABLE FILTER LOGIC (The Fix is Here)
  const filteredTokens = React.useMemo(() => {
    let result = tokens;

    // Filter by chain
    if (selectedChain !== 'all') {
      result = result.filter(token => token.chainId === selectedChain);
    }

    // Filter by Asset (CASE INSENSITIVE FIX)
    if (selectedAsset !== 'all') {
      result = result.filter(token => token.token.toLowerCase() === selectedAsset.toLowerCase());
    }

    // Only keep regular tokens (non-yield-bearing)
    result = result.filter(token => !token.yieldBearingToken);

    return result;
  }, [selectedChain, selectedAsset]);

  // Sort tokens
  const sortedTokens = React.useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortBy === 'token') {
        const comparison = a.token.localeCompare(b.token);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const aTokenData = apyData[a.chainId]?.[a.address.toLowerCase()];
        const bTokenData = apyData[b.chainId]?.[b.address.toLowerCase()];

        const aHighestApy = aTokenData ? Math.max(...Object.values(aTokenData).filter(v => v !== undefined) as number[]) : 0;
        const bHighestApy = bTokenData ? Math.max(...Object.values(bTokenData).filter(v => v !== undefined) as number[]) : 0;

        return sortDirection === 'asc' ? aHighestApy - bHighestApy : bHighestApy - aHighestApy;
      }
    });
  }, [filteredTokens, sortBy, sortDirection, apyData]);

  const toggleSort = (column: 'token' | 'highestApy') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const protocols = Object.values(PROTOCOL_NAMES);

  const getBestApyForToken = (token: typeof tokens[0]) => {
    const tokenData = apyData[token.chainId]?.[token.address.toLowerCase()];
    if (!tokenData) return { apy: null, protocol: null };

    let bestApy = 0;
    let bestProtocol = '';

    Object.entries(tokenData).forEach(([protocol, apy]) => {
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

  // Refs for scroll sync
  const leftTableRef = useRef<HTMLDivElement>(null);
  const middleTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);

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

    leftTable.addEventListener('scroll', syncScroll);
    middleTable.addEventListener('scroll', syncScroll);
    rightTable.addEventListener('scroll', syncScroll);

    return () => {
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
            onChange={onChainChange}
            className={styles.compactNetworkSelector}
          />
          <AssetSelector
            selectedAsset={selectedAsset}
            assets={cleanAssetList}
            onChange={onAssetChange}
            className={styles.compactAssetSelector}
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
                  <th onClick={() => toggleSort('highestApy')} className={styles.sortableHeader}>
                    Best APY
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
                        <img src={token.icon} alt={token.token} className={styles.tokenIcon} />
                        <span className={styles.tokenName}>{token.token}</span>
                      </td>
                      <td className={styles.networkCell}>
                        <div className={`${styles.networkBadge} ${styles[`network-${token.chainId}`]}`}>
                          {getNetworkName(token.chainId)}
                        </div>
                      </td>
                      <td className={styles.apySummaryCell}>
                        {(() => {
                          const { apy } = getBestApyForToken(token);
                          return apy ? `${formatNumber(apy, 2)}%` : '—';
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.scrollableMiddle} ref={middleTableRef}>
            <table className={styles.apyTable}>
              <thead>
                <tr>
                  {protocols.map(protocol => (
                    <th key={protocol} className={styles.protocolHeader}>
                      <Protocol name={protocol} showLogo={true} />
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
                  sortedTokens.map((token, index) => {
                    const tokenData = apyData[token.chainId]?.[token.address.toLowerCase()];
                    const { protocol: bestProtocol } = getBestApyForToken(token);
                    return (
                      <tr key={`${index}-token-${token.chainId}-${token.address}`}>
                        {protocols.map(protocol => {
                          const protocolKey = Object.entries(PROTOCOL_NAMES)
                            .find(([_, value]) => value === protocol)?.[0]?.toLowerCase();

                          const apy = protocolKey && tokenData ? tokenData[protocolKey as keyof typeof tokenData] : undefined;
                          const isBest = bestProtocol?.toUpperCase() === protocol?.toUpperCase();
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
        </div>
      </div>

      {!wallet.isConnected && (
        <ApyTableCTA />
      )}

      <WalletModal
        isOpen={isModalOpen}
        onClose={closeConnectModal}
      />
    </>
  );
};

export default ApyTable;