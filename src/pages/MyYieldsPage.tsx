import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './MyYieldsPage.module.css';
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

// NEW: Import persistent filter logic
import { checkIsYieldAssetVisible, HARD_MIN_USD, useLowValueFilter } from '../hooks/useLowValueFilter';
import LowValueFilterCheckbox from '../components/common/LowValueFilterCheckbox';
import FilteredEmptyState from '../components/wallet-page/FilteredEmptyState';
import WalletLabel from '../components/common/WalletLabel';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const MyYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletConnection();
  const { assets, error, isLoading: loading, fetchProtocols, protocols } = useAssetStore();
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  const formatValue = useCurrencyFormatter();

  // Persistent Filter Integration
  const { hideLowValues, setHideLowValues, shouldShowYieldAsset, isAboveHardDust, isAboveHardYieldDust } = useLowValueFilter();

  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [liveTotalEarned, setLiveTotalEarned] = useState<number>(0);
  const [currentEarned, setCurrentEarned] = useState<number>(0);

  const { yieldsPageView: viewType, setYieldsPageView: setViewType } = useUserPreferencesStore();
  const { getBestApy, apyData } = useApyStore();
  const { getUserActivity, activityData } = useDepositsAndWithdrawalsStore();

  const allYieldAssets = useMemo(() =>
    assets.filter(asset => asset.yieldBearingToken),
    [assets]
  );

  const uniqueAssets = useMemo(() => {
    type UniqueAsset = { token: string; icon?: string; chainId: number; hasHoldings: boolean };
    const assetMap = new Map<string, UniqueAsset>();

    allYieldAssets.forEach(asset => {
      // This checks if MAX(WalletBal, YieldBal) >= HARD_MIN_USD.
      // Passing 'false' ensures we don't hide items just because the "Low Value" checkbox is ticked,
      // allowing the user to find them in the dropdown if they exist.
      if (!checkIsYieldAssetVisible(asset, false)) return;

      // Keep existing logic for the green dot / holdings indicator
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
  }, [allYieldAssets]); // Dependencies

  // Helper to check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedNetwork !== 'all' ||
      selectedProtocol !== 'all' ||
      selectedAsset !== 'all' ||
      searchQuery !== '' ||
      hideLowValues === true
    );
  }, [selectedNetwork, selectedProtocol, selectedAsset, searchQuery, hideLowValues]);
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

  // NEW: Updated Base Filter Match Helper
  const baseFilterMatch = (asset: Asset) => {
    if (selectedNetwork !== 'all' && asset.chainId !== selectedNetwork) return false;
    if (selectedProtocol !== 'all' && asset.protocol?.toLowerCase() !== selectedProtocol.toLowerCase()) return false;
    if (selectedAsset !== 'all' && asset.token.toLowerCase() !== selectedAsset.toLowerCase()) return false;
    if (searchQuery) {
      const matchesToken = asset.token.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProtocol = asset.protocol?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesToken && !matchesProtocol) return false;
    }

    // Apply Global Persistent Logic Filter
    return shouldShowYieldAsset(asset);
  };

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
  }, [allYieldAssets, selectedNetwork, selectedProtocol, selectedAsset, searchQuery, wallet.address, getUserActivity, hideLowValues]);

  const uniqueChainIds = useMemo(() =>
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

  const getApyForAsset = (asset: Asset) => {
    if (asset.protocol && apyData[asset.chainId]?.[asset.address.toLowerCase()]) {
      const apys = apyData[asset.chainId][asset.address.toLowerCase()] as any;
      return apys[asset.protocol.toLowerCase()] || 0;
    }
    return 0;
  };
  const handleResetFilters = () => {
    setSelectedNetwork('all');
    setSelectedProtocol('all');
    setSelectedAsset('all');
    setSearchQuery('');
    setHideLowValues(false);
  };

  const handleRedirect = (path: string) => {
    const navigationState = selectedNetwork !== 'all' ? { filterNetwork: selectedNetwork } : undefined;
    navigate(path, { state: navigationState });
  };

  const getOptimizationDataForAsset = (asset: Asset): OptimizationData | undefined => {
    const token = tokens.find(
      t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
    );
    if (!token) return undefined;
    const currentProtocol = asset.protocol;
    if (!currentProtocol) return undefined;
    const { bestApy, bestProtocol } = getBestApy(token.chainId, token.address.toLowerCase());
    if (bestApy === null || !bestProtocol) return undefined;
    //@ts-ignore
    const currentApyEstimate = currentProtocol && apyData[token.chainId]?.[token.address.toLowerCase()]?.[currentProtocol.toLowerCase()] || 0;
    if (bestProtocol !== currentProtocol && bestApy > currentApyEstimate) {
      const balanceNum = parseFloat(asset.balance);
      const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
      const currentYearlyUsd = (balanceNum * (currentApyEstimate / 100)) * usdPrice;
      const betterYearlyUsd = (balanceNum * (bestApy / 100)) * usdPrice;
      const additionalYearlyUsd = betterYearlyUsd - currentYearlyUsd;
      const apyImprovement = ((bestApy - currentApyEstimate) / currentApyEstimate * 100);
      const betterProtocolName = bestProtocol && bestProtocol.toUpperCase() in PROTOCOL_NAMES
        ? PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES]
        : bestProtocol;
      return {
        currentProtocol,
        currentApy: currentApyEstimate,
        betterProtocol: betterProtocolName,
        betterApy: bestApy,
        additionalYearlyUsd: formatValue(additionalYearlyUsd),
        apyImprovement: parseFloat(apyImprovement.toFixed(0))
      };
    }
    return undefined;
  };


  // 1. Calculate static totals via useMemo (Replaces the "culprit" useEffect)
  const summaryTotals = useMemo(() => {
    if (!wallet.address) {
      return { currentDeposit: 0, totalDeposited: 0, totalWithdrawn: 0, totalEarned: 0, currentEarned: 0, dailyYield: 0, yearlyYield: 0 };
    }

    const addresses = isConsolidated
      ? [...manualAddresses, ...(isMetamaskConnected && metamaskAddress ? [metamaskAddress] : [])]
      : [wallet.address];

    let currentD = 0, totalD = 0, totalW = 0, totalE = 0, currentE = 0;
    let dailyY = 0, yearlyY = 0;
    addresses.forEach(addr => {
      const userData = activityData[addr.toLowerCase()];
      if (userData) {
        currentD += userData.currentDeposit;
        totalD += userData.totalDeposits;
        totalW += userData.totalWithdrawals;
        totalE += userData.totalEarnings;
        currentE += userData.currentEarnings;
      }
      if (userData?.accumulatedYield) {
        dailyY += userData.accumulatedYield.daily || 0;
        yearlyY += userData.accumulatedYield.yearly || 0;
      }
    });

    return {
      currentDeposit: currentD,
      totalDeposited: totalD,
      totalWithdrawn: totalW,
      totalEarned: totalE,
      currentEarned: currentE,
      dailyYield: dailyY,
      yearlyYield: yearlyY
    };
  }, [wallet.address, isConsolidated, manualAddresses, isMetamaskConnected, metamaskAddress, activityData]);
  // Sync "Live" ticking values when the base data updates
  useEffect(() => {

    // Only update the live counters. 
    // The other values (deposits/withdrawals) are read directly from summaryTotals.
    setCurrentEarned(summaryTotals.currentEarned);
    setLiveTotalEarned(summaryTotals.totalEarned);
  }, [summaryTotals.currentEarned, summaryTotals.totalEarned]);

  const hasAnyYieldAssets = (walletAssets: Asset[]) => {
    return walletAssets.some(asset => isAboveHardYieldDust(asset));
  }

  const globalState = useMemo(() => {
    const hasActiveYields = assets.some(a => Number(a.currentBalanceInProtocolUsd) > HARD_MIN_USD);
    const hasDormantFunds = assets.some(a => Number(a.balanceUsd) > HARD_MIN_USD);
    return { hasActiveYields, hasDormantFunds };
  }, [assets]);

  if (error) return <div className={styles.error}><p>Error loading yield data: {error}</p></div>;

  return (
    <div className={styles.container}>
      <PageHeader title="My Yields" subtitle="Track and optimize your yield-bearing positions" />

      <div className={styles.filtersContainer}>
        {/*  row1  */}

        <div className={styles.filterItem}>
          <NetworkSelector selectedNetwork={selectedNetwork} networks={uniqueChainIds}
            /* @ts-ignore */
            onChange={setSelectedNetwork} className={styles.networkSelector} />
        </div>

        <div className={styles.protocolSearchViewGroup}>
          {/* NEW: Global Filter Checkbox in Controls Row */}

          <ViewToggle currentView={viewType} onViewChange={setViewType} />
          <SearchBar ref={searchInputRef} placeholder="Search yields..." value={searchQuery} onChange={setSearchQuery} showKeybind={true} />
          <ProtocolSelector selectedProtocol={selectedProtocol} protocols={protocols} onChange={setSelectedProtocol} className={styles.protocolSelector} />
          <AssetSelector selectedAsset={selectedAsset} assets={uniqueAssets} onChange={setSelectedAsset} className={styles.assetSelector} />
        </div>
        {/*  row2  */}
        <div className={styles.lowAmountFilterContainer}>
          <LowValueFilterCheckbox checked={hideLowValues} onChange={setHideLowValues} style={{ marginRight: '16px' }} />
        </div>
      </div>

      {loading ? <MyYieldSummaryCardsSkeleton /> : (

        <div className={styles.summaryCards}>
          {/* Card 1: Current Deposit (Neutral) */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Deposit</div>
            <div className={styles.summaryAmount}>
              ${formatValue(summaryTotals.currentDeposit)}
            </div>
            <div className={styles.summarySubtext}>
              Total Deposit ${formatValue(summaryTotals.totalDeposited)}
            </div>
          </div>

          {/* Card 2: Current Earned (Color only if != 0) */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Earned</div>
            <div
              className={styles.summaryAmount}
              style={{
                color: currentEarned > 0 ? '#2EBD85' : currentEarned < 0 ? '#ef4444' : 'inherit'
              }}
            >
              ${formatValue(currentEarned)}
            </div>
            <div
              className={styles.summarySubtext}
              style={{
                color: liveTotalEarned > 0 ? '#2EBD85' : liveTotalEarned < 0 ? '#ef4444' : 'inherit'
              }}
            >
              Total Earning ${formatValue(liveTotalEarned)}
            </div>
          </div>

          {/* Card 3: Daily Yield (Color only if > 0) */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Daily Yield</div>
            <div
              className={styles.summaryAmount}
              style={{
                color: summaryTotals.dailyYield > 0 ? '#2EBD85' : 'inherit'
              }}
            >
              ${formatValue(summaryTotals.dailyYield)}
            </div>
            <div
              className={styles.summarySubtext}
              style={{
                color: summaryTotals.yearlyYield > 0 ? '#2EBD85' : 'inherit'
              }}
            >
              Yearly Yield ${formatValue(summaryTotals.yearlyYield)}
            </div>
          </div>
        </div>
      )}
      {isConsolidated ? (
        (() => {
          const allAddresses = [...manualAddresses];
          if (isMetamaskConnected && metamaskAddress) allAddresses.push(metamaskAddress);

          // Grouping assets by wallet
          const assetsByWallet = new Map<string, typeof filteredYieldAssets>();
          filteredYieldAssets.forEach(asset => {
            const walletAddr = asset.walletAddress?.toLowerCase() || '';
            if (!assetsByWallet.has(walletAddr)) assetsByWallet.set(walletAddr, []);
            assetsByWallet.get(walletAddr)!.push(asset);
          });
          return allAddresses.map((address) => {
            const allWalletAssets = assetsByWallet.get(address.toLowerCase()) || [];

            // 1. FILTER specifically for assets actually earning yield and SORT (High to Low APY)

            const activeYieldingAssets = allWalletAssets
              .filter(asset => Number(asset.currentBalanceInProtocolUsd || 0) >= HARD_MIN_USD)
              .sort((a, b) => getApyForAsset(b) - getApyForAsset(a));

            // 2. FIND HIGHEST APY for this specific wallet
            const maxApy = activeYieldingAssets.length > 0
              ? Math.max(...activeYieldingAssets.map(a => getApyForAsset(a)))
              : 0;

            const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

            // 2. CHECK if the wallet has any money at all (dormant or active)
            const hasAnyBalance = assets
              .filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase())
              .some(a => isAboveHardDust(a) || isAboveHardYieldDust(a));


            // Check if this wallet *really* has yield assets regardless of UI filters.
            // We use `allYieldAssets` (raw list) instead of `filteredYieldAssets`.
            const rawWalletAssets = allYieldAssets.filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase());
            const walletTrulyHasYieldAssets = hasAnyYieldAssets(rawWalletAssets);

            return (
              <div key={address} className={styles.section}>
                <div className={styles.walletSectionHeader}>
                  <div className={styles.headerLeft}>
                    {/* 2. Integrate the Wallet Label Component */}
                    <WalletLabel address={address} />

                    {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                  </div>
                </div>

                {loading ? <MyYieldSkeletonLoader viewType={viewType} /> : (
                  <>
                    {/* Only render the grid if there are ACTIVE yields */}
                    {activeYieldingAssets.length > 0 ? (
                      viewType === 'cards' ? (
                        <div className={styles.yieldGrid}>
                          {activeYieldingAssets.map((asset) => (
                            <YieldCard
                              key={`${asset.token}-${asset.chainId}-${asset.protocol}-${address}`}
                              asset={asset}
                              optimizationData={getOptimizationDataForAsset(asset)}
                              onOptimize={() => { }}
                              isHighestYield={maxApy > 0 && getApyForAsset(asset) === maxApy}
                            />
                          ))}
                        </div>
                      ) : (
                        <YieldsTable assets={activeYieldingAssets} loading={loading} getOptimizationDataForAsset={getOptimizationDataForAsset}
                        />
                      )
                    ) : (
                      hasActiveFilters && walletTrulyHasYieldAssets ? (
                        <FilteredEmptyState onReset={handleResetFilters} />
                      ) :
                        /* Handle Empty States: If no active yields, check if they have dormant money */
                        <NoYieldEmptyState
                          subtext={
                            hasAnyBalance
                              ? "You have idle assets ready to earn yield."
                              : "You don’t have any assets yet. Explore yield opportunities to get started."
                          }
                          btnText={hasAnyBalance ? "View Wallet Options" : "Explore Yield Options"}
                          onRedirect={() => handleRedirect(hasAnyBalance ? "/" : "/explore")}
                        />
                    )}
                  </>
                )}
              </div>
            );
          })
        })()
      ) : (
        /* Apply the same logic for Single Wallet View */
        <div className={styles.section}>
          {loading ? <MyYieldSkeletonLoader viewType={viewType} /> : (
            (() => {
              // 1. FILTER and SORT
              const activeYields = filteredYieldAssets
                .filter(a => Number(a.currentBalanceInProtocolUsd || 0) >= HARD_MIN_USD)
                .sort((a, b) => getApyForAsset(b) - getApyForAsset(a));

              // 2. FIND HIGHEST APY
              const maxApy = activeYields.length > 0
                ? Math.max(...activeYields.map(a => getApyForAsset(a)))
                : 0;

              return (
                <>
                  {activeYields.length > 0 ? (
                    viewType === 'cards' ? (
                      <div className={styles.yieldGrid}>
                        {activeYields.map((asset) => (
                          <YieldCard
                            key={`${asset.token}-${asset.chainId}-${asset.protocol}`}
                            asset={asset}
                            isHighestYield={maxApy > 0 && getApyForAsset(asset) === maxApy} // 🟢 HIGHLIGHT
                            optimizationData={getOptimizationDataForAsset(asset)}
                            onOptimize={() => { }}
                          />
                        ))}
                      </div>
                    ) : (
                      <YieldsTable assets={activeYields} loading={loading} getOptimizationDataForAsset={getOptimizationDataForAsset} />
                    )
                  ) : (
                    <NoYieldEmptyState
                      onRedirect={() => handleRedirect(globalState.hasDormantFunds ? "/" : "/explore")}
                      subtext={globalState.hasDormantFunds ? 'You have idle assets ready to earn yield.' : 'You don’t have any assets yet.'}
                      btnText={globalState.hasDormantFunds ? "View Wallet Options" : "Explore Yield Options"}
                    />
                  )}
                </>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
export default MyYieldsPage;



interface NoYieldEmptyStateProps {
  onRedirect: () => void;
  subtext?: string;
  btnText?: string;
}

const NoYieldEmptyState: React.FC<NoYieldEmptyStateProps> = ({ onRedirect, subtext, btnText }) => {
  return (
    <div className={styles.emptyState}>
      <h3>You have not yet started yielding</h3>
      <div className={styles.emptyTextWrapper}>
        {subtext || "Go ahead and explore yield opportunities to get started."}
      </div>
      <button
        className={styles.exploreButton}
        onClick={onRedirect}
      >
        {btnText ?? "View Options"}
      </button>
    </div>
  );
};
