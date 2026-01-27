import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import { useApyStore } from '../store/apyStore';
import { useEarnStore } from '../store/earnStore';
import { useDepositsAndWithdrawalsStore } from '../store/depositsAndWithdrawalsStore';
import useWalletConnection from '../hooks/useWalletConnection';
import type { Asset } from '../types';
import { useManualWalletStore } from '../store/manualWalletStore';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../utils/helpers';
import { MIN_ALLOWED_BALANCE, PROTOCOL_NAMES } from '../utils/constants';
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
import { HARD_MIN_USD, useLowValueFilter } from '../hooks/useLowValueFilter';
import LowValueFilterCheckbox from '../components/common/LowValueFilterCheckbox';
import FilteredEmptyState from '../components/wallet-page/FilteredEmptyState';

const MyYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletConnection();
  const { assets, error, isLoading: loading, fetchProtocols, protocols } = useAssetStore();
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();

  // NEW: Persistent Filter Integration
  const { hideLowValues, setHideLowValues, shouldShowAsset, isAboveHardDust, isAboveHardYieldDust } = useLowValueFilter();

  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Totals state
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [liveTotalEarned, setLiveTotalEarned] = useState<number>(0);
  const [currentDeposit, setCurrentDeposit] = useState<number>(0);
  const [currentEarned, setCurrentEarned] = useState<number>(0);
  const [totalEarnedValue, setTotalEarnedValue] = useState<number>(0);

  const { yieldsPageView: viewType, setYieldsPageView: setViewType } = useUserPreferencesStore();
  const { getBestApy, apyData } = useApyStore();
  const { getUserActivity } = useDepositsAndWithdrawalsStore();

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

  const baseFilterMatch = (asset: Asset) => {
    if (selectedNetwork !== 'all' && asset.chainId !== selectedNetwork) return false;
    if (selectedProtocol !== 'all' && asset.protocol?.toLowerCase() !== selectedProtocol.toLowerCase()) return false;
    if (selectedAsset !== 'all' && asset.token.toLowerCase() !== selectedAsset.toLowerCase()) return false;
    if (searchQuery) {
      const matchesToken = asset.token.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProtocol = asset.protocol?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesToken && !matchesProtocol) return false;
    }
    return shouldShowAsset(asset);
  };

  const filteredYieldAssets = useMemo(() => {
    return allYieldAssets
      .filter(asset => {
        // Essential: Filter by UI inputs and persistent Low Value Logic
        if (!baseFilterMatch(asset)) return false;
        
        // Critical: Only include assets that have a positive protocol balance 
        // to prevent empty gaps in the grid/table
        return Number(asset.currentBalanceInProtocolUsd || HARD_MIN_USD) > 0;
      })
      .map(asset => {
        let totalDepositedVal = 0;
        let totalDepositedUsdVal = "";
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
                totalDepositedVal = depositsFormatted - withdrawalsFormatted;
                totalDepositedUsdVal = (totalDepositedVal * asset.usd).toString();
              }
            }
          }
        }
        return { ...asset, totalDeposited: totalDepositedVal, totalDepositedUsd: totalDepositedUsdVal };
      });
  }, [allYieldAssets, selectedNetwork, selectedProtocol, selectedAsset, searchQuery, wallet.address, getUserActivity, hideLowValues]);

  const uniqueChainIds = useMemo(() =>
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

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
        additionalYearlyUsd: formatNumber(additionalYearlyUsd, 2),
        apyImprovement: parseFloat(apyImprovement.toFixed(0))
      };
    }
    return undefined;
  };

  const calculateWeightedApy = (): number => {
    let totalWeightedApy = 0;
    let totalValue = 0;
    const supportedAssets = filteredYieldAssets.filter(asset => {
      return asset?.protocol?.toLowerCase() === 'aave' || asset?.protocol?.toLowerCase() === 'radiant' || asset?.protocol?.toLowerCase() === 'compound' || asset?.protocol?.toLowerCase() === 'yearn v3';
    });
    supportedAssets.forEach(asset => {
      const balanceValue = parseFloat(asset.totalDepositedUsd || '0');
      if (isNaN(balanceValue) || balanceValue === HARD_MIN_USD) return;
      let assetApy = 0;
      if (asset.protocol && apyData[asset.chainId]?.[asset.address.toLowerCase()]) {
        const apys = apyData[asset.chainId][asset.address.toLowerCase()] as any;
        assetApy = apys[asset.protocol.toLowerCase()] || 0;
      }
      totalWeightedApy += assetApy * balanceValue;
      totalValue += balanceValue;
    });
    return totalValue > 0 ? (totalWeightedApy / totalValue) : 3.5;
  };

  useEffect(() => {
    if (!wallet.address) {
      setTotalDeposited(0);
      setTotalWithdrawn(0);
      setTotalEarned(0);
      setLiveTotalEarned(0);
      return;
    }
    const addresses: string[] = [];
    if (isConsolidated) {
      addresses.push(...manualAddresses);
      if (isMetamaskConnected && metamaskAddress) addresses.push(metamaskAddress);
      if (addresses.length === 0 && wallet.address) addresses.push(wallet.address);
    } else {
      addresses.push(wallet.address);
    }
    const userCalculatedData: Record<string, any> = {}
    addresses.forEach(addr => {
      const userData = getUserActivity(addr);
      if (!userData) return;
      userCalculatedData[addr] = {
        currentDeposit: userData.currentDeposit,
        totalDeposit: userData.totalDeposits,
        currentEarnings: userData.currentEarnings,
        totalEarnings: userData.totalEarnings,
        totalWithdrawn: userData.totalWithdrawals
      }
    });
    let cDeposit = 0, tDeposit = 0, cEarned = 0, tEarned = 0, tWithdrawals = 0;
    Object.values(userCalculatedData).forEach((data: any) => {
      cDeposit += data.currentDeposit;
      tDeposit += data.totalDeposit;
      cEarned += data.currentEarnings;
      tEarned += data.totalEarnings;
      tWithdrawals += data.totalWithdrawn;
    })
    setLiveTotalEarned(tEarned);
    setTotalDeposited(tDeposit);
    setTotalWithdrawn(tWithdrawals);
    setCurrentDeposit(cDeposit);
    setCurrentEarned(cEarned);
    setTotalEarnedValue(tEarned);
  }, [wallet.address, isConsolidated, manualAddresses, isMetamaskConnected, metamaskAddress, getUserActivity, allYieldAssets, selectedNetwork]);

  useEffect(() => {
    if (!wallet.address || totalEarnedValue <= 0 || currentEarned <= 0) return;
    setLiveTotalEarned(totalEarnedValue);
    const weightedApy = calculateWeightedApy();
    const ticksPerYear = (365 * 24 * 60 * 60 * 1000) / 100;
    const timer = setInterval(() => {
      setLiveTotalEarned(prevValue => {
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);
        return prevValue * growthRate;
      });
      setCurrentEarned(prevCurrent => {
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);
        return prevCurrent * growthRate;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [totalEarnedValue, wallet.address, allYieldAssets, apyData, selectedNetwork]);

  const formatLiveValue = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0.000000000000000000';
    try {
      return value >= 1000 ? value.toLocaleString('en-US', { minimumFractionDigits: 18, maximumFractionDigits: 18 }) : value.toFixed(18);
    } catch (error) { return '0.000000000000000000'; }
  };

  const globalState = useMemo(() => {
    const hasActiveYields = assets.some(a => Number(a.currentBalanceInProtocolUsd) > MIN_ALLOWED_BALANCE);
    const hasDormantFunds = assets.some(a => Number(a.balanceUsd) > MIN_ALLOWED_BALANCE);
    return { hasActiveYields, hasDormantFunds };
  }, [assets]);

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
            <div className={styles.summaryAmount}>${formatNumber(currentDeposit, 10)}</div>
            <div className={styles.summarySubtext}>Total Deposit ${formatNumber(totalDeposited, 10)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Earned</div>
            <div className={styles.summaryAmount}>${formatLiveValue(currentEarned)}</div>
            <div className={styles.summarySubtext}>Total Earning ${formatLiveValue(liveTotalEarned)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Total Withdrawn</div>
            <div className={styles.summaryAmount}>${formatNumber(totalWithdrawn, 4)}</div>
            <div className={styles.summarySubtext}></div>
          </div>
        </div>
      )}

      {isConsolidated ? (
        (() => {
          const allAddresses = [...manualAddresses];
          if (isMetamaskConnected && metamaskAddress) allAddresses.push(metamaskAddress);

          const assetsByWallet = new Map<string, typeof filteredYieldAssets>();
          filteredYieldAssets.forEach(asset => {
            const walletAddr = asset.walletAddress?.toLowerCase() || '';
            if (!assetsByWallet.has(walletAddr)) assetsByWallet.set(walletAddr, []);
            assetsByWallet.get(walletAddr)!.push(asset);
          });

          return allAddresses.map((address) => {
            const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];
            const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

            const hasWalletBalance = assets
              .filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase())
              .some(a => isAboveHardDust(a));
            
            const walletHasYieldingPositions = allYieldAssets
              .filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase())
              .some(a => isAboveHardYieldDust(a));

            return (
              <div key={address} className={styles.section}>
                <div className={styles.walletSectionHeader}>
                    <h3>Wallet: {shortenAddress(address)}</h3>
                    {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                </div>

                {loading ? <MyYieldSkeletonLoader viewType={viewType} /> : (
                  <>
                    {walletAssets.length > 0 ? (
                      viewType === 'cards' ? (
                        <div className={styles.yieldGrid}>
                          {walletAssets.map((asset) => (
                            <YieldCard 
                              key={`${asset.token}-${asset.chainId}-${asset.protocol}-${address}`} 
                              asset={asset} 
                              optimizationData={getOptimizationDataForAsset(asset)} 
                              onOptimize={() => { }} 
                            />
                          ))}
                        </div>
                      ) : <YieldsTable assets={walletAssets} loading={loading} getOptimizationDataForAsset={getOptimizationDataForAsset} />
                    ) : walletHasYieldingPositions ? <FilteredEmptyState onReset={handleResetFilters} /> : (
                      <NoYieldEmptyState
                        subtext={
                          hasWalletBalance
                            ? "You have idle assets ready to earn yield."
                            : "You don’t have any assets yet. Explore yield opportunities to get started."
                        }
                        btnText={hasWalletBalance ? "View Wallet Options" : "Explore Yield Options"}
                        onRedirect={() =>
                          handleRedirect(hasWalletBalance ? "/" : "/explore")
                        }
                      />
                    )}
                  </>
                )}
              </div>
            );
          })
        })()
      ) : (
       <div className={styles.section}>
          {loading ? (
            <MyYieldSkeletonLoader viewType={viewType} />
          ) : (
            <>
              {filteredYieldAssets.length > 0 ? (
                viewType === 'cards' ? (
                  <div className={styles.yieldGrid}>
                    {filteredYieldAssets.map((asset) => (
                      <YieldCard 
                        key={`${asset.token}-${asset.chainId}-${asset.protocol}`} 
                        asset={asset} 
                        optimizationData={getOptimizationDataForAsset(asset)} 
                        onOptimize={() => { }} 
                      />
                    ))}
                  </div>
                ) : (
                  <YieldsTable 
                    assets={filteredYieldAssets} 
                    loading={loading} 
                    getOptimizationDataForAsset={getOptimizationDataForAsset} 
                  />
                )
              ) : (
                /* LOGIC FIX: Apply the same multi-state check as consolidated view.
                   We use 'globalState' which checks the current connected wallet or all assets.
                */
                (() => {
                  // Check if there are yielding assets that might be hidden by search/network/low-value filters
                  const hasYieldingPositions = allYieldAssets.some(a => isAboveHardYieldDust(a));

                  if (hasYieldingPositions) {
                    return <FilteredEmptyState onReset={handleResetFilters} />;
                  } else {
                    return (
                      <NoYieldEmptyState 
                        onRedirect={() => handleRedirect(globalState.hasDormantFunds ? "/" : "/explore")} 
                        subtext={
                          globalState.hasDormantFunds 
                            ? "You have idle assets ready to earn yield." 
                            : "You don’t have any assets yet. Explore yield opportunities to get started."
                        }
                        btnText={globalState.hasDormantFunds ? "View Wallet Options" : "Explore Yield Options"}
                      />
                    );
                  }
                })()
              )}
            </>
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