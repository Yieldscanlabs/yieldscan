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

const MyYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletConnection();
  const { assets, error, isLoading: loading, fetchProtocols, protocols } = useAssetStore();
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for total deposited, total withdrawn, and total earning
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [liveTotalEarned, setLiveTotalEarned] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currentDeposit, setCurrentDeposit] = useState<number>(0);
  const [currentEarned, setCurrentEarned] = useState<number>(0);

  // Use userPreferencesStore for view toggle state
  const { yieldsPageView: viewType, setYieldsPageView: setViewType } = useUserPreferencesStore();

  // Get the getBestApy method from the store
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
  }, [allYieldAssets]);


  useEffect(() => {
    fetchProtocols()
  }, [])

  // Force cards view on mobile screens (900px and below)
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

  // Memoize filtered yield-bearing tokens for display only
  const filteredYieldAssets = useMemo(() => {
    return allYieldAssets
      .filter(asset => {
        if (selectedNetwork !== 'all' && asset.chainId !== selectedNetwork) return false;
        if (selectedProtocol !== 'all' && asset.protocol?.toLowerCase() !== selectedProtocol.toLowerCase()) return false;
        if (selectedAsset !== 'all' && asset.token.toLowerCase() !== selectedAsset.toLowerCase()) return false;
        if (searchQuery) {
          const matchesToken = asset.token.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesProtocol = asset.protocol?.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchesToken && !matchesProtocol) return false;
        }
        const hasBalance = Number(asset.currentBalanceInProtocolUsd) > 0.001;
        return hasBalance;
      })
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
  }, [allYieldAssets, selectedNetwork, selectedProtocol, selectedAsset, searchQuery, wallet.address, getUserActivity]);

  // Get unique chain IDs from assets for the network selector
  const uniqueChainIds = useMemo(() =>
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

  // Function to calculate optimization data for a single asset
  const getOptimizationDataForAsset = (asset: Asset): OptimizationData | undefined => {
    const token = tokens.find(
      t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
    );

    if (!token) return undefined;
    const currentProtocol = asset.protocol;
    if (!currentProtocol) return undefined;

    const { bestApy, bestProtocol } = getBestApy(
      token.chainId,
      token.address.toLowerCase()
    );

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

  // Calculate weighted average APY for Aave and Radiant tokens
  const calculateWeightedApy = (): number => {
    let totalWeightedApy = 0;
    let totalValue = 0;

    const supportedAssets = filteredYieldAssets.filter(asset => {
      return asset?.protocol?.toLowerCase() === 'aave' || asset?.protocol?.toLowerCase() === 'radiant' || asset?.protocol?.toLowerCase() === 'compound' || asset?.protocol?.toLowerCase() === 'yearn v3';
    });

    supportedAssets.forEach(asset => {
      const balanceValue = parseFloat(asset.totalDepositedUsd || '0');
      if (isNaN(balanceValue) || balanceValue === 0) return;

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

  // Calculate totals using real data from stores
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

    const userCalculatedData: Record<string, {
      currentDeposit: number,
      totalDeposit: number,
      currentEarnings: number,
      totalEarnings: number,
      totalWithdrawn: number
    }> = {}

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
   
    let currentDeposits = 0
    let totalDeposits = 0
    let currentEarned = 0
    let totalEarned = 0
    let totalWithdrawls = 0

    Object.values(userCalculatedData).forEach((data) => {
      currentDeposits += data.currentDeposit
      totalDeposits += data.totalDeposit
      currentEarned += data.currentEarnings
      totalEarned += data.totalEarnings
      totalWithdrawls += data.totalWithdrawn
    })
    
    setLiveTotalEarned(totalEarned);
    setTotalDeposited(totalDeposits);
    setTotalWithdrawn(totalWithdrawls);
    setCurrentDeposit(currentDeposits);
    setCurrentEarned(currentEarned);
    setTotalEarned(totalEarned);
  }, [
    wallet.address,
    isConsolidated,
    manualAddresses,
    isMetamaskConnected,
    metamaskAddress,
    getUserActivity,
    allYieldAssets,
    selectedNetwork,
    currentBalance
  ]);

  // Live ticker effect
  useEffect(() => {
    if (!wallet.address || totalEarned <= 0) return;

    if (currentEarned <= 0) {
      return
    }
    setLiveTotalEarned(totalEarned);

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
  }, [totalEarned, wallet.address, allYieldAssets, apyData, selectedNetwork]);

  const formatLiveValue = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.000000000000000000';
    }
    try {
      if (value >= 1000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 18, maximumFractionDigits: 18 });
      } else {
        return value.toFixed(18);
      }
    } catch (error) {
      return '0.000000000000000000';
    }
  };

  const globalState = useMemo(() => {
    const hasActiveYields = assets.some(a => Number(a.currentBalanceInProtocolUsd) > 0.01);
    const hasDormantFunds = assets.some(a => Number(a.balanceUsd) > 0.01);
    return { hasActiveYields, hasDormantFunds };
  }, [assets]);

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading yield data: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="My Yields"
        subtitle="Track and optimize your yield-bearing positions"
      />

      <div className={styles.filtersContainer}>
        <div className={styles.filterItem}>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            networks={uniqueChainIds}
            //@ts-ignore
            onChange={setSelectedNetwork}
            className={styles.networkSelector}
          />
        </div>

        <div className={styles.protocolSearchViewGroup}>
          <ViewToggle
            currentView={viewType}
            onViewChange={setViewType}
          />
          <SearchBar
            ref={searchInputRef}
            placeholder="Search yields..."
            value={searchQuery}
            onChange={setSearchQuery}
            showKeybind={true}
          />
          <ProtocolSelector
            selectedProtocol={selectedProtocol}
            //@ts-ignore
            protocols={protocols}
            onChange={setSelectedProtocol}
            className={styles.protocolSelector}
          />
          <AssetSelector
            selectedAsset={selectedAsset}
            assets={uniqueAssets}
            onChange={setSelectedAsset}
            className={styles.assetSelector}
          />
        </div>
      </div>

      {loading ? (
        <MyYieldSummaryCardsSkeleton />
      ) : (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Deposit</div>
            <div className={styles.summaryAmount}>
              ${formatNumber(currentDeposit, 10)}
            </div>
            <div className={styles.summarySubtext}>
              Total Deposit  ${formatNumber(totalDeposited, 10)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Current Earned</div>
            <div className={styles.summaryAmount}>
              ${formatLiveValue(currentEarned)}
            </div>
            <div className={styles.summarySubtext}>
              Total Earning ${formatLiveValue(liveTotalEarned)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Total Withdrawn</div>
            <div className={styles.summaryAmount}>
              ${formatNumber(totalWithdrawn, 4)}
            </div>
            <div className={styles.summarySubtext}></div>
          </div>
        </div>
      )}

      {/* Current Yields Section */}
      {isConsolidated ? (
        // Consolidated view: group by wallet address
        (() => {
          const allAddresses = [...manualAddresses];
          if (isMetamaskConnected && metamaskAddress) {
            allAddresses.push(metamaskAddress);
          }

          // Group assets by walletAddress
          const assetsByWallet = new Map<string, typeof filteredYieldAssets>();
          filteredYieldAssets.forEach(asset => {
            const walletAddr = asset.walletAddress?.toLowerCase() || '';
            if (!assetsByWallet.has(walletAddr)) {
              assetsByWallet.set(walletAddr, []);
            }
            assetsByWallet.get(walletAddr)!.push(asset);
          });
         
          return (
            <>
              {allAddresses.map((address) => {
                const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];
                const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

                // ✅ FIX: Calculate dormant funds SPECIFICALLY for this wallet
                // We must look at the RAW assets array, filter by this address, and check balanceUsd
                const thisWalletHasDormantFunds = assets
                    .filter(a => a.walletAddress?.toLowerCase() === address.toLowerCase())
                    .some(a => Number(a.balanceUsd) > 0.01);

                return (
                  <div key={address} className={styles.section}>
                    <div className={styles.walletSectionHeader}>
                      <h3>Wallet: {shortenAddress(address)}</h3>
                      {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                    </div>

                    {loading ? (
                      <MyYieldSkeletonLoader viewType={viewType} />
                    ) : (
                      <>
                        {walletAssets.length === 0 ? (
                          <div className={styles.emptyState}>
                            <h3>You have not yet started yielding</h3>
                            {/* Use local boolean instead of globalState */}
                            {thisWalletHasDormantFunds ? (
                              <>
                                <p>You have dormant assets in your wallet that could be earning yield.</p>
                                <button onClick={() => navigate("/")} className={styles.exploreButton}>
                                  View Wallet Options
                                </button>
                              </>
                            ) : (
                              <>
                                <p>You don't have any assets currently earning yield.</p>
                                <button onClick={() => navigate("/explore")} className={styles.exploreButton}>
                                  Explore Yield Opportunities
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          viewType === 'cards' ? (
                            <div className={styles.yieldGrid}>
                              {walletAssets.map((asset) => {
                                const optimizationData = getOptimizationDataForAsset(asset);
                                return (
                                  <YieldCard
                                    key={`${asset.token}-${asset.chainId}-${asset.protocol}-${address}`}
                                    asset={asset}
                                    optimizationData={optimizationData}
                                    onOptimize={() => { }}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <YieldsTable
                              assets={walletAssets}
                              loading={loading}
                              getOptimizationDataForAsset={getOptimizationDataForAsset}
                            />
                          )
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          );
        })()
      ) : (
        // Single wallet view
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
                  <YieldsTable assets={filteredYieldAssets} loading={loading} getOptimizationDataForAsset={getOptimizationDataForAsset} />
                )
              ) : (
                <div className={styles.emptyState}>
                  <h3>You have not yet started yielding</h3>
                  {globalState.hasDormantFunds ? (
                    <>
                      <p>You have dormant assets in your wallet that could be earning yield.</p>
                      <button onClick={() => navigate("/")} className={styles.exploreButton}>
                        View Wallet Options
                      </button>
                    </>
                  ) : (
                    <>
                      <p>You don't have any assets currently earning yield.</p>
                      <button onClick={() => navigate("/explore")} className={styles.exploreButton}>
                        Explore Yield Opportunities
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default MyYieldsPage;