import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import { useApyStore } from '../store/apyStore';
import { useDepositsAndWithdrawalsStore } from '../store/depositsAndWithdrawalsStore';
import useWalletConnection from '../hooks/useWalletConnection';
import type { Asset } from '../types';
import { useManualWalletStore } from '../store/manualWalletStore';
import { useAccount } from 'wagmi';
import { PROTOCOL_NAMES } from '../utils/constants';
import YieldCard from '../components/YieldCard/YieldCard';
import type { OptimizationData } from '../components/YieldCard/types';
import { useAssetStore } from '../store/assetStore';
import NetworkSelector from '../components/NetworkSelector';
import ProtocolSelector from '../components/ProtocolSelector';
import AssetSelector from '../components/AssetSelector';
import ViewToggle from '../components/ViewToggle';
import SearchBar from '../components/SearchBar';
import { useUserPreferencesStore } from '../store/userPreferencesStore';
import YieldsTable from '../components/YieldsTable';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { MyYieldSkeletonLoader, MyYieldSummaryCardsSkeleton } from '../components/loaders/MyYieldSkeletonLoader';
import { HARD_MIN_USD, useLowValueFilter } from '../hooks/useLowValueFilter';
import LowValueFilterCheckbox from '../components/common/LowValueFilterCheckbox';
import FilteredEmptyState from '../components/wallet-page/FilteredEmptyState';
import WalletLabel from '../components/common/WalletLabel';

const MyYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletConnection();
  const { assets, error, isLoading: loading, fetchProtocols, protocols } = useAssetStore();
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();

  const { hideLowValues, setHideLowValues, shouldShowYieldAsset, isAboveHardDust, isAboveHardYieldDust } = useLowValueFilter();

  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { yieldsPageView: viewType, setYieldsPageView: setViewType } = useUserPreferencesStore();
  const { getBestApy, apyData } = useApyStore();

  const activityData = useDepositsAndWithdrawalsStore(state => state.activityData);
  const getUserActivity = useDepositsAndWithdrawalsStore(state => state.getUserActivity);

  // 1. INSTANT TOTALS CALCULATION
  const summaryTotals = useMemo(() => {
    if (!wallet.address) {
      return { 
        currentDeposit: 0, 
        totalDeposited: 0, 
        totalWithdrawn: 0, 
        totalEarned: 0, 
        currentEarned: 0 
      };
    }

    const addresses = isConsolidated 
      ? [...manualAddresses, ...(isMetamaskConnected && metamaskAddress ? [metamaskAddress] : [])]
      : [wallet.address];

    let currentD = 0, totalD = 0, totalW = 0, totalE = 0, currentE = 0;

    addresses.forEach(addr => {
      const userData = activityData[addr.toLowerCase()];
      if (userData) {
        currentD += userData.currentDeposit;
        totalD += userData.totalDeposits;
        totalE += userData.totalEarnings;
        totalW += userData.totalWithdrawals;
        currentE += userData.currentEarnings;
      }
    });

    return { 
      currentDeposit: currentD, 
      totalDeposited: totalD, 
      totalWithdrawn: totalW, 
      totalEarned: totalE,
      currentEarned: currentE
    };
  }, [wallet.address, isConsolidated, manualAddresses, isMetamaskConnected, metamaskAddress, activityData]);

  const allYieldAssets = useMemo(() =>
    assets.filter(asset => asset.yieldBearingToken),
    [assets]
  );

  const uniqueAssets = useMemo(() => {
    type UniqueAsset = { token: string; icon?: string; chainId: number; hasHoldings: boolean };
    const assetMap = new Map<string, UniqueAsset>();

    allYieldAssets.forEach(asset => {
      if (!isAboveHardDust(asset)) return;
      const holdingValue = Number(asset.currentBalanceInProtocolUsd || 0);
      const hasHoldings = !Number.isNaN(holdingValue) && holdingValue > 0;
      const existing = assetMap.get(asset.token);

      if (existing) {
        if (hasHoldings && !existing.hasHoldings) {
          assetMap.set(asset.token, { ...existing, hasHoldings: true });
        }
      } else {
        assetMap.set(asset.token, {
          token: asset.token,
          icon: asset.icon,
          chainId: asset.chainId,
          hasHoldings
        });
      }
    });

    return Array.from(assetMap.values());
  }, [allYieldAssets, isAboveHardDust]);

  useEffect(() => {
    fetchProtocols()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900 && viewType !== 'cards') {
        setViewType('cards');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewType, setViewType]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const activeElement = document.activeElement as HTMLElement | null;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const baseFilterMatch = useCallback((asset: Asset) => {
    if (selectedNetwork !== 'all' && asset.chainId !== selectedNetwork) return false;
    if (selectedProtocol !== 'all' && asset.protocol?.toLowerCase() !== selectedProtocol.toLowerCase()) return false;
    if (selectedAsset !== 'all' && asset.token.toLowerCase() !== selectedAsset.toLowerCase()) return false;
    if (searchQuery) {
      const matchesToken = asset.token.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProtocol = asset.protocol?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesToken && !matchesProtocol) return false;
    }
    return shouldShowYieldAsset(asset);
  }, [selectedNetwork, selectedProtocol, selectedAsset, searchQuery, shouldShowYieldAsset]);

  const filteredYieldAssets = useMemo(() => {
    return allYieldAssets
      .filter(baseFilterMatch)
      .map(asset => {
        let totalDeposited = 0;
        let totalDepositedUsd = "";
        const activityAddress = (asset.walletAddress || wallet.address || "");
        const userData = getUserActivity(activityAddress);
        if (userData) {
          const chainData = (userData as Record<string, any>)[asset.chainId];
          if (chainData) {
            const protocolKey = asset.protocol || "";
            const protocolData = (chainData as Record<string, any>)[protocolKey];
            if (protocolData) {
              const tokenKey = asset.token;
              const tokenData = protocolData[tokenKey] || protocolData[tokenKey.replace(/^a/i, "")];
              if (tokenData) {
                const decimals = asset.decimals || 18;
                const divisor = BigInt("1" + "0".repeat(decimals));
                const depositsBigInt = BigInt(tokenData.totalDeposit || "0");
                const withdrawalsBigInt = BigInt(tokenData.totalWithdraw || "0");
                const depositsFormatted = Number(depositsBigInt / divisor) + Number(depositsBigInt % divisor) / Number(divisor);
                const withdrawalsFormatted = Number(withdrawalsBigInt / divisor) + Number(withdrawalsBigInt % divisor) / Number(divisor);
                totalDeposited = depositsFormatted - withdrawalsFormatted;
                totalDepositedUsd = (totalDeposited * asset.usd).toString();
              }
            }
          }
        }
        return { ...asset, totalDeposited, totalDepositedUsd };
      });
  }, [allYieldAssets, baseFilterMatch, wallet.address, getUserActivity]);

  const uniqueChainIds = useMemo(() =>
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

  const getApyForAsset = useCallback((asset: Asset) => {
    if (asset.protocol && apyData[asset.chainId]?.[asset.address.toLowerCase()]) {
      const apys = apyData[asset.chainId][asset.address.toLowerCase()] as any;
      return apys[asset.protocol.toLowerCase()] || 0;
    }
    return 0;
  }, [apyData]);

  const handleResetFilters = () => {
    setSelectedNetwork('all');
    setSelectedProtocol('all');
    setSelectedAsset('all');
    setSearchQuery('');
    setHideLowValues(false);
  };

  const getOptimizationDataForAsset = (asset: Asset): OptimizationData | undefined => {
    const token = tokens.find(t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId);
    if (!token || !asset.protocol) return undefined;
    const { bestApy, bestProtocol } = getBestApy(token.chainId, token.address.toLowerCase());
    const currentApy = getApyForAsset(asset);
    
    if (bestApy !== null && bestProtocol && bestProtocol !== asset.protocol && bestApy > currentApy) {
      const balanceNum = parseFloat(asset.balance);
      const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
      const additionalYearlyUsd = (balanceNum * ((bestApy - currentApy) / 100)) * usdPrice;
      return {
        currentProtocol: asset.protocol,
        currentApy,
        betterProtocol: PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] || bestProtocol,
        betterApy: bestApy,
        additionalYearlyUsd: formatNumber(additionalYearlyUsd, 2),
        apyImprovement: parseFloat(((bestApy - currentApy) / currentApy * 100).toFixed(0))
      };
    }
    return undefined;
  };

  const formatLiveValue = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0.000000000000000000';
    return value >= 1000 ? value.toLocaleString('en-US', { minimumFractionDigits: 18, maximumFractionDigits: 18 }) : value.toFixed(18);
  };

  // 3. STABLE RENDER GROUPS
  const walletGroups = useMemo(() => {
    const addresses = isConsolidated 
      ? [...manualAddresses, ...(isMetamaskConnected && metamaskAddress ? [metamaskAddress] : [])]
      : [wallet.address || '0x'];

    const assetsByWallet = new Map<string, Asset[]>();
    filteredYieldAssets.forEach(asset => {
      const walletAddr = asset.walletAddress?.toLowerCase() || '';
      if (!assetsByWallet.has(walletAddr)) assetsByWallet.set(walletAddr, []);
      assetsByWallet.get(walletAddr)!.push(asset);
    });

    return addresses.map(address => {
      const allWalletAssets = assetsByWallet.get(address.toLowerCase()) || [];
      const activeYieldingAssets = allWalletAssets
        .filter(asset => Number(asset.currentBalanceInProtocolUsd || 0) >= HARD_MIN_USD)
        .sort((a, b) => getApyForAsset(b) - getApyForAsset(a));

      const maxApy = activeYieldingAssets.length > 0
        ? Math.max(...activeYieldingAssets.map(a => getApyForAsset(a)))
        : 0;

      return { address, activeYieldingAssets, maxApy };
    });
  }, [filteredYieldAssets, isConsolidated, manualAddresses, isMetamaskConnected, metamaskAddress, wallet.address, getApyForAsset]);

  if (error) return <div className={styles.error}><p>Error loading yield data: {error}</p></div>;

  return (
    <div className={styles.container}>
      <PageHeader title="My Yields" subtitle="Track and optimize your yield-bearing positions" />

      <div className={styles.filtersContainer}>
        <div className={styles.filterItem}>
          <NetworkSelector selectedNetwork={selectedNetwork} networks={uniqueChainIds} 
            /* @ts-ignore */
            onChange={setSelectedNetwork} className={styles.networkSelector} />
        </div>
        <div className={styles.protocolSearchViewGroup}>
          <ViewToggle currentView={viewType} onViewChange={setViewType} />
          <SearchBar ref={searchInputRef} placeholder="Search yields..." value={searchQuery} onChange={setSearchQuery} showKeybind={true} />
          <ProtocolSelector selectedProtocol={selectedProtocol} protocols={protocols} onChange={setSelectedProtocol} className={styles.protocolSelector} />
          <AssetSelector selectedAsset={selectedAsset} assets={uniqueAssets} onChange={setSelectedAsset} className={styles.assetSelector} />
        </div>
        <div className={styles.lowAmountFilterContainer}>
          <LowValueFilterCheckbox checked={hideLowValues} onChange={setHideLowValues} style={{ marginRight: '16px' }} />
        </div>
      </div>

      {loading ? <MyYieldSummaryCardsSkeleton /> : (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Deposit</div>
            <div className={styles.summaryAmount}>${formatNumber(summaryTotals.currentDeposit, 10)}</div>
            <div className={styles.summarySubtext}>Total Deposit ${formatNumber(summaryTotals.totalDeposited, 10)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Earned</div>
            <div className={styles.summaryAmount}>${formatLiveValue(summaryTotals.currentEarned)}</div>
            <div className={styles.summarySubtext}>Total Earning ${formatLiveValue(summaryTotals.totalEarned)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Total Withdrawn</div>
            <div className={styles.summaryAmount}>${formatNumber(summaryTotals.totalWithdrawn, 4)}</div>
          </div>
        </div>
      )}

      {walletGroups.map(({ address, activeYieldingAssets, maxApy }) => {
        const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();
        const hasAnyBalance = assets.filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase()).some(a => isAboveHardDust(a) || isAboveHardYieldDust(a));

        return (
          <div key={address} className={styles.section}>
            {isConsolidated && (
              <div className={styles.walletSectionHeader}>
                <div className={styles.headerLeft}>
                  {/* 2. Integrate the Wallet Label Component */}
                  <WalletLabel address={address} />
                  
                  {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                </div>
              </div>
            )}

            {loading ? <MyYieldSkeletonLoader viewType={viewType} /> : (
              <>
                {activeYieldingAssets.length > 0 ? (
                  viewType === 'cards' ? (
                    <div className={styles.yieldGrid}>
                      {activeYieldingAssets.map((asset) => (
                        <YieldCard
                          key={`${asset.token}-${asset.chainId}-${asset.protocol}-${address}`}
                          asset={asset}
                          isHighestYield={maxApy > 0 && getApyForAsset(asset) === maxApy}
                          optimizationData={getOptimizationDataForAsset(asset)}
                          onOptimize={() => {}}
                        />
                      ))}
                    </div>
                  ) : <YieldsTable assets={activeYieldingAssets} loading={loading} getOptimizationDataForAsset={getOptimizationDataForAsset} />
                ) : (
                  <NoYieldEmptyState
                    subtext={hasAnyBalance ? "You have idle assets ready to earn yield." : "You don’t have any assets yet."}
                    btnText={hasAnyBalance ? "View Wallet Options" : "Explore Yield Options"}
                    onRedirect={() => navigate(hasAnyBalance ? "/" : "/explore")}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyYieldsPage;

interface NoYieldEmptyStateProps {
  onRedirect: () => void;
  subtext?: string;
  btnText?: string;
}

const NoYieldEmptyState: React.FC<NoYieldEmptyStateProps> = ({ onRedirect, subtext, btnText }) => (
  <div className={styles.emptyState}>
    <h3>You have not yet started yielding</h3>
    <div className={styles.emptyTextWrapper}>{subtext || "Go ahead and explore yield opportunities to get started."}</div>
    <button className={styles.exploreButton} onClick={onRedirect}>{btnText ?? "View Options"}</button>
  </div>
);