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

  // Get the earnings data from the earnStore
  const { isLoading: earningsLoading } = useEarnStore();

  // Get deposits and withdrawals data
  const {
    getUserActivity,
    isLoading: activityLoading
  } = useDepositsAndWithdrawalsStore();

  // No need to fetch manually here since it's now handled in Layout

  // Get total earnings for display

  // Get unique protocols from tokens
  // const uniqueProtocols = useMemo(() =>
  //   Array.from(new Set(tokens
  //     .filter(token => token.protocol && token.yieldBearingToken)
  //     .map(token => token.protocol)
  //   )),
  //   []
  // );

  // Get all yield-bearing assets without filtering by protocol
  const allYieldAssets = useMemo(() =>
    assets.filter(asset => asset.yieldBearingToken),
    [assets]
  );

  // Get unique assets from yield-bearing assets with their data for selectors/filters
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

    // Check on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [viewType, setViewType]);

  // Keep "/" to focus search; leave Ctrl/Cmd+K to global manual wallet modal
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

  useEffect(() => {
    console.log("ASSETS is Loading: ", loading)
    console.log("ASSETS is error: ", error)
    console.log("ASSETS:All assets for filtering:", assets);
    console.log("Updated filteredYieldAssets:", filteredYieldAssets);
  }, [filteredYieldAssets, assets]);

  // ---------------------------------------------------------
  // 🔍 DEBUGGING CONSOLE: ASSET ANALYSIS
  // ---------------------------------------------------------
  useEffect(() => {
    if (loading) return;
    console.log("\n---------------(START of debug report)---------------\n");

    const totalAssets = assets.length;
    const supportedAssets = assets.filter(a => a.yieldBearingToken);

    // 1. Check for assets with ACTUAL value in the Wallet (Dormant)
    const assetsWithWalletBalance = assets.filter(a => Number(a.balanceUsd) > 0.01);

    // 2. Check for assets with ACTUAL value in Protocols (Working)
    const assetsWithProtocolBalance = assets.filter(a => Number(a.currentBalanceInProtocolUsd) > 0.01);

    // 3. Check what remains after your filters (Network/Protocol/Search)
    const visibleAfterFilters = filteredYieldAssets;

    console.group("🔍 YIELDSCAN DEBUG REPORT");
    console.log(`%c Wallet Address: ${wallet.address}`, "color: yellow; font-weight: bold;");

    console.log(`📊 TOTAL Assets from API: ${totalAssets}`);
    console.log(`✅ System Supported Assets (Yield Bearing): ${supportedAssets.length}`);

    console.log(`%c 💰 Assets with WALLET Balance (> $0.01): ${assetsWithWalletBalance.length}`, "color: #4ade80");
    if (assetsWithWalletBalance.length > 0) {
      console.table(assetsWithWalletBalance.map(a => ({
        Token: a.token,
        Chain: a.chainId,
        Balance: a.balance,
        Value: `$${a.balanceUsd}`
      })));
    } else {
      console.log("   (User holds no idle supported assets)");
    }

    console.log(`%c 🏦 Assets with PROTOCOL Balance (> $0.01): ${assetsWithProtocolBalance.length}`, "color: #60a5fa");
    if (assetsWithProtocolBalance.length > 0) {
      console.table(assetsWithProtocolBalance.map(a => ({
        Token: a.token,
        Protocol: a.protocol,
        Balance: a.currentBalanceInProtocol,
        Value: `$${a.currentBalanceInProtocolUsd}`
      })));
    } else {
      console.log("   (User has no active investments in supported protocols)");
    }

    console.log(`🎯 Final Visible Cards (After Filters): ${visibleAfterFilters.length}`);

    // The Verdict
    if (assetsWithWalletBalance.length === 0 && assetsWithProtocolBalance.length === 0) {
      console.error("🚨 VERDICT: The UI is empty because this wallet holds $0.00 in supported assets.");
    } else if (visibleAfterFilters.length === 0) {
      console.warn("⚠️ VERDICT: You HAVE assets, but your filters (Network/Protocol) are hiding them.");
    } else {
      console.log("✅ VERDICT: Assets found. If UI is blank, check YieldCard.tsx for internal return null.");
    }

    console.groupEnd();
    console.log("\n---------------(End of debug report)---------------\n");
  }, [assets, filteredYieldAssets, loading, wallet.address]);
  // ---------------------------------------------------------
  // Get unique chain IDs from assets for the network selector
  const uniqueChainIds = useMemo(() =>
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

  // Function to calculate optimization data for a single asset
  const getOptimizationDataForAsset = (asset: Asset): OptimizationData | undefined => {
    // Get APY info for the asset
    const token = tokens.find(
      t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
    );

    if (!token) return undefined;

    // Determine which protocol this yield-bearing token belongs to
    const currentProtocol = asset.protocol;
    if (!currentProtocol) return undefined;

    // Find the underlying asset for this yield token
    // const underlyingTokenSymbol = token.token.substring(1); // e.g., aUSDC -> USDC
    // const underlyingToken = tokens.find(
    //   t => t.token === underlyingTokenSymbol && t.chainId === token.chainId && !t.yieldBearingToken
    // );

    // if (!underlyingToken) return undefined;

    // Get best APY from the store
    const { bestApy, bestProtocol } = getBestApy(
      token.chainId,
      token.address.toLowerCase()
    );

    // If no best APY found, skip this asset
    if (bestApy === null || !bestProtocol) return undefined;

    //@ts-ignore
    const currentApyEstimate = currentProtocol && apyData[token.chainId]?.[token.address.toLowerCase()]?.[currentProtocol.toLowerCase()] || 0;

    // Check if there's a better APY available
    if (bestProtocol !== currentProtocol && bestApy > currentApyEstimate) {
      // Calculate additional yield if user switches to better protocol
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

    // Get Aave and Radiant assets from current balances
    const supportedAssets = filteredYieldAssets.filter(asset => {
      return asset?.protocol?.toLowerCase() === 'aave' || asset?.protocol?.toLowerCase() === 'radiant' || asset?.protocol?.toLowerCase() === 'compound' || asset?.protocol?.toLowerCase() === 'yearn v3';
    });

    supportedAssets.forEach(asset => {
      const balanceValue = parseFloat(asset.totalDepositedUsd || '0');
      if (isNaN(balanceValue) || balanceValue === 0) return;

      // Get APY for this asset from apyStore if available
      let assetApy = 0;
      if (asset.protocol && apyData[asset.chainId]?.[asset.address.toLowerCase()]) {
        const apys = apyData[asset.chainId][asset.address.toLowerCase()] as any;
        assetApy = apys[asset.protocol.toLowerCase()] || 0;
      }

      // If no APY found, use defaults: 3% for Aave, 4% for Radiant
      // if (assetApy === 0) {
      //   const token = tokens.find(
      //     t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
      //   );
      //   assetApy = token?.protocol?.toLowerCase() === 'radiant' ? 4 : 3;
      // }

      totalWeightedApy += assetApy * balanceValue;
      totalValue += balanceValue;
    });

    // Return weighted average APY (default to 3.5% if no supported assets)
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

    // Build list of addresses to include (supports consolidated mode)
    const addresses: string[] = [];
    if (isConsolidated) {
      addresses.push(...manualAddresses);
      if (isMetamaskConnected && metamaskAddress) addresses.push(metamaskAddress);
      // Fallback to active wallet if no addresses collected
      if (addresses.length === 0 && wallet.address) addresses.push(wallet.address);
    } else {
      addresses.push(wallet.address);
    }

    // Aggregate deposits/withdrawals across addresses
    // let totalDepositsUsd = 0;
    // let totalWithdrawalsUsd = 0;

    // // Helper function to find token decimals
    // const findTokenDecimals = (chainId: number, protocolName: string, tokenSymbol: string): number => {
    //   const token = tokens.find(t =>
    //     t.chainId === chainId &&
    //     t.protocol?.toLowerCase() === protocolName.toLowerCase() &&
    //     (t.token.toUpperCase().includes(tokenSymbol.toUpperCase()) || t.token === tokenSymbol)
    //   );
    //   if (token) return token.decimals;
    //   const underlyingToken = tokens.find(t =>
    //     t.chainId === chainId && !t.yieldBearingToken && t.token.toUpperCase() === tokenSymbol.toUpperCase()
    //   );
    //   if (underlyingToken) return underlyingToken.decimals;
    //   if (tokenSymbol.toUpperCase() === 'USDC' || tokenSymbol.toUpperCase() === 'USDT') return 6;
    //   return 18;
    // };

    const userCalculatedData: Record<string, {
      currentDeposit: number,
      totalDeposit: number,
      currentEarnings: number,
      totalEarnings: number,
      totalWithdrawn: number
    }> = {

    }

    // For calculating APY-based live earnings we rely on filteredYieldAssets/currentBalance computed elsewhere

    // Iterate each address' activity and aggregate
    addresses.forEach(addr => {
      const userData = getUserActivity(addr);
      console.log("User Data for address ", addr, userData);
      if (!userData) return;

      userCalculatedData[addr] = {
        currentDeposit: userData.currentDeposit,
        totalDeposit: userData.totalDeposits,
        currentEarnings: userData.currentEarnings,
        totalEarnings: userData.totalEarnings,
        totalWithdrawn: userData.totalWithdrawals
      }
    });
    // Calculate earnings: use supported protocols and current balances
    // const supportedEarnings = (() => {
    //   let totalEarnings = 0;
    //   const supportedAssets = filteredYieldAssets.filter(asset =>
    //     asset?.protocol?.toLowerCase() === 'aave' || asset?.protocol?.toLowerCase() === 'radiant' || asset?.protocol?.toLowerCase() === 'compound' || asset?.protocol?.toLowerCase() === 'yearn v3'
    //   );
    //   const currentTotalBalance = filteredYieldAssets.reduce((sum, asset) => {
    //     const balanceValue = Number(asset.currentBalanceInProtocolUsd || '0');
    //     return isNaN(balanceValue) ? sum : sum + balanceValue;
    //   }, 0);
    //   setCurrentBalance(currentTotalBalance);
    //   supportedAssets.forEach(asset => {
    //     const currentBalanceUsd = Number(asset.currentBalanceInProtocolUsd as any || '0');
    //     let depositsUsd = 0;
    //     let withdrawalsUsd = 0;

    //     // In consolidated mode, only use the wallet that owns this asset
    //     // Otherwise, use the active wallet
    //     const assetWalletAddress = asset.walletAddress || wallet.address || '';
    //     if (!assetWalletAddress) {
    //       totalEarnings += currentBalanceUsd; // If no wallet, just use balance
    //       return;
    //     }

    //     const userData = getUserActivity(assetWalletAddress);
    //     if (!userData) {
    //       totalEarnings += currentBalanceUsd; // If no activity data, just use balance
    //       return;
    //     }

    //     const chainData = (userData as Record<string, any>)[asset.chainId];
    //     if (!chainData) {
    //       totalEarnings += currentBalanceUsd;
    //       return;
    //     }

    //     const protocolName = asset.protocol || '';
    //     if (!protocolName) {
    //       totalEarnings += currentBalanceUsd;
    //       return;
    //     }

    //     const protocolData = (chainData as Record<string, any>)[protocolName];
    //     if (!protocolData) {
    //       totalEarnings += currentBalanceUsd;
    //       return;
    //     }

    //     const tokenData = protocolData[asset.token];
    //     if (!tokenData) {
    //       totalEarnings += currentBalanceUsd;
    //       return;
    //     }

    //     const decimals = findTokenDecimals(asset.chainId, protocolName, asset.token);
    //     const depositsBigInt = BigInt(tokenData.totalDeposit || '0');
    //     const withdrawalsBigInt = BigInt(tokenData.totalWithdraw || '0');
    //     const divisor = BigInt('1' + '0'.repeat(decimals));
    //     const depositsFormatted = Number(depositsBigInt / divisor) + Number(depositsBigInt % divisor) / Number(divisor);
    //     const withdrawalsFormatted = Number(withdrawalsBigInt / divisor) + Number(withdrawalsBigInt % divisor) / Number(divisor);
    //     const tokenPrice = asset.usd;
    //     depositsUsd = depositsFormatted * tokenPrice;
    //     withdrawalsUsd = withdrawalsFormatted * tokenPrice;

    //     const tokenEarnings = currentBalanceUsd - (depositsUsd - withdrawalsUsd);
    //     totalEarnings += tokenEarnings;
    //   });
    //   return totalEarnings;
    // })();
    // const currentDepositValue = Math.max(0, totalDepositsUsd - totalWithdrawalsUsd);
    // const claimableEarnings = Math.max(0, currentBalance - (totalDepositsUsd - totalWithdrawalsUsd) - (totalWithdrawalsUsd - totalDepositsUsd > 0 ? totalWithdrawalsUsd - totalDepositsUsd : 0));
    // // console.log({ userCalculatedData })
    let currentDeposits = 0
    let totalDeposits = 0
    let currentEarned = 0
    let totalEarned = 0
    let totalWithdrawls = 0
    console.warn("USER CALCULATED DATA");
    console.table(userCalculatedData);

    // if (isConsolidated) {
    Object.values(userCalculatedData).forEach((data) => {
      currentDeposits += data.currentDeposit
      totalDeposits += data.totalDeposit
      currentEarned += data.currentEarnings
      totalEarned += data.totalEarnings
      totalWithdrawls += data.totalWithdrawn
    })
    //   setTotalDeposited(totalDeposits);
    //   setTotalWithdrawn(totalWithdrawls);
    //   setCurrentDeposit(currentDeposits);
    //   setCurrentEarned(currentEarned);
    //   setTotalEarned(totalEarned);
    setLiveTotalEarned(totalEarned);
    // } else {
    // const TotalEarnings = currentBalance - (totalDepositsUsd - totalWithdrawalsUsd);
    // // const ClaimableEarnings = Math.max(
    // //   0,
    // //   currentBalance -
    // //   (totalDepositsUsd - totalWithdrawalsUsd) -
    // //   (totalWithdrawalsUsd - totalDepositsUsd > 0 ? totalWithdrawalsUsd - totalDepositsUsd : 0)
    // // );
    // // const currentDepositCalculated =  TotalDeposit- TotalWithdraw
    // const currentDepositCalculated = Math.max(totalDepositsUsd - totalWithdrawalsUsd, 0)

    setTotalDeposited(totalDeposits);
    setTotalWithdrawn(totalWithdrawls);
    setCurrentDeposit(currentDeposits);
    setCurrentEarned(currentEarned);
    // const nonNegativeEarnings = Math.max(0, supportedEarnings);
    setTotalEarned(totalEarned);
    // console.log({ totalEarned: TotalEarnings, currentEarned: ClaimableEarnings, currentDeposit: currentDepositCalculated })
    // console.log({ totalDepositsUsd, totalWithdrawalsUsd })
    // }
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

  // console.log('totalEarned, currentEarned ', totalEarned, currentEarned)
  // Live ticker effect - update earnings every 100ms based on Aave APY
  useEffect(() => {
    if (!wallet.address || totalEarned <= 0) return;

    if (currentEarned <= 0) {
      return
    }
    // Set initial live value
    setLiveTotalEarned(totalEarned);

    // Calculate the weighted APY for Aave tokens
    const weightedApy = calculateWeightedApy();
    console.log({ weightedApy });

    // Calculate the per-tick growth rate based on APY
    const ticksPerYear = (365 * 24 * 60 * 60 * 1000) / 100; // Number of 100ms ticks in a year

    const timer = setInterval(() => {
      setLiveTotalEarned(prevValue => {
        // Calculate growth for this tick
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);

        // Use high precision multiplication to ensure decimal changes are visible
        const newValue = prevValue * growthRate;
        return newValue;
      });
      setCurrentEarned(prevCurrent => {
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);
        const updatedValue = prevCurrent * growthRate;
        return updatedValue;
      });
      // Removed setCurrentEarned to keep it static
    }, 100);

    // Cleanup timer on unmount or when dependencies change
    return () => clearInterval(timer);

  }, [totalEarned, wallet.address, allYieldAssets, apyData, selectedNetwork]);

  // Format value with proper comma separators and more decimal places for precision
  const formatLiveValue = (value: number): string => {
    // Ensure the value is a valid number
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.000000000000000000';
    }

    try {
      // Use higher precision (18 decimal places) to match the header's live ticker
      if (value >= 1000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 18, maximumFractionDigits: 18 });
      } else {
        return value.toFixed(18);
      }
    } catch (error) {
      console.error('Error formatting value:', error);
      return '0.000000000000000000';
    }
  };



  const globalState = useMemo(() => {
    const hasActiveYields = assets.some(a => Number(a.currentBalanceInProtocolUsd) > 0.01);
    const hasDormantFunds = assets.some(a => Number(a.balanceUsd) > 0.01);
    return { hasActiveYields, hasDormantFunds };
  }, [assets]);

  // Empty state - no yield-bearing assets at all
  // if (allYieldAssets.length === 0) {
  //   return (
  //     <div className={styles.container}>
  //       <div className={styles.header}>
  //         {/* <h1>My Yields</h1> */}
  //       </div>
  //       <div className={styles.emptyState}>
  //         <h3>No yield-bearing assets found</h3>
  //         <p>You don't have any assets currently earning yield.</p>
  //         <button onClick={() => navigate("/explore")} className={styles.exploreButton}>Explore Yield Opportunities</button>
  //       </div>
  //     </div>
  //   );
  // }


  // Error state
  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading yield data: {error}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your yields...</div>
      </div>
    );
  }

  // Render the content
  return (
    <div className={styles.container}>
      <PageHeader
        title="My Yields"
        subtitle="Track and optimize your yield-bearing positions"
      />

      {/* Filters container with earnings summary */}
      <div className={styles.filtersContainer}>
        {/* Network selector for filtering yields */}
        <div className={styles.filterItem}>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            networks={uniqueChainIds}
            //@ts-ignore
            onChange={setSelectedNetwork}
            className={styles.networkSelector}
          />
        </div>

        {/* Protocol, Asset, Search and View Toggle Group */}
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

      {/* Summary section - real data from stores */}
      <div className={styles.summaryCards}>
        {/* <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Total Deposited</div>
          <div className={styles.summaryAmount}>
            ${formatNumber(totalDeposited, 4)}
          </div>
          <div className={styles.summarySubtext}>
            Total deposited to protocols
          </div>
        </div> */}
        {/* <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Total Earned</div>
          <div className={styles.summaryAmount}>
            ${formatLiveValue(liveTotalEarned)}
          </div>
          <div className={styles.summarySubtext}>
            balance - (deposits - withdrawals)
          </div>
        </div> */}
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
            {/* ${formatNumber(currentBalance - currentDeposit, 20)} */}
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
          <div className={styles.summarySubtext}>
            {/* Total withdrawn  */}
            {/* ${formatNumber(totalWithdrawn, 4)} */}
          </div>
        </div>
      </div>

      {/* <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Current Deposit</div>
          <div className={styles.summaryAmount}>
            ${formatNumber(currentDeposit, 4)}
          </div>
          <div className={styles.summarySubtext}>
            Current deposit to protocols
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Current Earned</div>
          <div className={styles.summaryAmount}>
            ${formatNumber(currentEarned, 20)}
          </div>
          <div className={styles.summarySubtext}>
            Current Earning from protocols
          </div>
        </div>
      </div> */}

      {/* Current Yields Section - Uses filteredYieldAssets for display */}
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
          console.log("Consolidated view - assets by wallet:", assetsByWallet);
          // return <>NA</>
          return (
            <>
              {allAddresses.map((address) => {
                const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];

                const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

                return (
                  <div key={address} className={styles.section}>
                    <div className={styles.walletSectionHeader}>
                      <h3>Wallet: {shortenAddress(address)}</h3>
                      {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                    </div>
                    {walletAssets.length === 0 ? (
                      // <div className={styles.noYieldsText}>No yields for this wallet.</div>
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
                    ) : (
                      (
                        viewType === 'cards' ? (
                          <div className={styles.yieldGrid}>
                            {walletAssets.map((asset) => {
                              const optimizationData = getOptimizationDataForAsset(asset);
                              const handleOptimize = () => {
                                console.log('Starting optimization for:', asset.token);
                                if (optimizationData) {
                                  console.log(`Optimizing ${asset.token} from ${optimizationData.currentProtocol} to ${optimizationData.betterProtocol}`);
                                }
                              };

                              return (
                                <YieldCard
                                  key={`${asset.token}-${asset.chainId}-${asset.protocol}-${address}`}
                                  asset={asset}
                                  optimizationData={optimizationData}
                                  onOptimize={handleOptimize}
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
                      )
                    )}
                  </div>
                );
              })}
              {/* {filteredYieldAssets.length === 0 && (
                <div className={styles.filteredEmptyState}>
                  <div className={styles.filteredEmptyContent}>
                    <div className={styles.filteredEmptyIcon}>🔍</div>
                    <div className={styles.filteredEmptyText}>
                      <h3>No matching assets found!</h3>
                      <p>
                        No yield-bearing assets match your current filters.
                        Try changing the network or protocol filter to see your assets.
                      </p>
                    </div>
                    <button
                      className={styles.resetFiltersButton}
                      onClick={() => {
                        setSelectedNetwork('all');
                        setSelectedProtocol('all');
                        setSelectedAsset('all');
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )} */}
            </>
          );
        })()
      ) : (
        // Single wallet view
        <div className={styles.section}>

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
            console.log("Rendering Single Event assets:", globalState, filteredYieldAssets),
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
            // <div className={styles.filteredEmptyState}>
            //   <div className={styles.filteredEmptyContent}>
            //     <div className={styles.filteredEmptyIcon}>🔍</div>
            //     <div className={styles.filteredEmptyText}>
            //       <h3>No matching assets found...</h3>
            //       <p>No yield-bearing assets match your current filters.</p>
            //     </div>
            //     <button className={styles.resetFiltersButton} onClick={() => {
            //       setSelectedNetwork('all'); setSelectedProtocol('all'); setSelectedAsset('all');
            //     }}>
            //       Reset Filters
            //     </button>
            //   </div>
            // </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyYieldsPage;
