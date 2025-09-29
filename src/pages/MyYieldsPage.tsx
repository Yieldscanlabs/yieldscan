import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import { useApyStore } from '../store/apyStore';
import { useEarnStore } from '../store/earnStore';
import { useDepositsAndWithdrawalsStore } from '../store/depositsAndWithdrawalsStore';
import useWalletConnection from '../hooks/useWalletConnection';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import YieldCard from '../components/YieldCard/YieldCard';
import type { OptimizationData } from '../components/YieldCard/types';
import { useAssetStore } from '../store/assetStore';
import NetworkSelector from '../components/NetworkSelector';
import ProtocolSelector from '../components/ProtocolSelector';
import ViewToggle from '../components/ViewToggle';
import SearchBar from '../components/SearchBar';
import { useUserPreferencesStore } from '../store/userPreferencesStore';
import YieldsTable from '../components/YieldsTable';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';

const MyYieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWalletConnection();
  const { assets, error, isLoading: loading } = useAssetStore();
  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
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
  const { getBestApy, lastUpdated, apyData } = useApyStore();

  // Get the earnings data from the earnStore
  const {
    isLoading: earningsLoading,
    getTotalEarnings
  } = useEarnStore();

  // Get deposits and withdrawals data
  const {
    getUserActivity,
    getTotalDepositsForUser,
    getTotalWithdrawalsForUser,
    isLoading: activityLoading
  } = useDepositsAndWithdrawalsStore();

  // No need to fetch manually here since it's now handled in Layout

  // Get total earnings for display

  // Get unique protocols from tokens
  const uniqueProtocols = useMemo(() =>
    Array.from(new Set(tokens
      .filter(token => token.protocol && token.yieldBearingToken)
      .map(token => token.protocol)
    )),
    []
  );

  // Get all yield-bearing assets without filtering by protocol
  const allYieldAssets = useMemo(() =>
    assets.filter(asset => asset.yieldBearingToken),
    [assets]
  );
  const handleNavigate = () => {
    navigate("/explore")
  }
  // Force cards view on mobile screens (900px and below)
  useEffect(() => {
    console.log("ASSETS", assets);

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

  // Add keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K or just "/" key
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Only focus if not typing in an input already
        const activeElement = document.activeElement;
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
        if (searchQuery) {
          const matchesToken = asset.token.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesProtocol = asset.protocol?.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchesToken && !matchesProtocol) return false;
        }
        return true;
      })
      .map(asset => {
        let totalDeposited = 0;
        let totalDepositedUsd = "";
        const userData = getUserActivity(wallet.address || "");
        if (userData) {
          const chainData = (userData as Record<string, any>)[asset.chainId];
          if (chainData) {
            const protocolKey = asset.protocol || "";
            const protocolData = (chainData as Record<string, any>)[protocolKey];
            if (protocolData) {
              const tokenKey = asset.token;
              const tokenData =
                protocolData[tokenKey] || protocolData[tokenKey.replace(/^a/i, "")];
              if (tokenData) {
                const decimals = asset.decimals || 18;
                const divisor = BigInt("1" + "0".repeat(decimals));

                const depositsBigInt = BigInt(tokenData.totalDeposit || "0");
                const withdrawalsBigInt = BigInt(tokenData.totalWithdraw || "0");

                const depositsFormatted =
                  Number(depositsBigInt / divisor) +
                  Number(depositsBigInt % divisor) / Number(divisor);

                const withdrawalsFormatted =
                  Number(withdrawalsBigInt / divisor) +
                  Number(withdrawalsBigInt % divisor) / Number(divisor);


                totalDeposited = depositsFormatted - withdrawalsFormatted;
                totalDepositedUsd = (totalDeposited * asset.usd).toString();

                console.log(`Total deposited for ${asset.token} on ${asset.chain} (${protocolKey}):`, { totalDeposited, totalDepositedUsd });

              }
            }
          }
        }
        return {
          ...asset,
          totalDeposited,
          totalDepositedUsd
        };
      });
  }, [allYieldAssets, selectedNetwork, selectedProtocol, searchQuery, wallet.address, getUserActivity]);
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
    const currentProtocol = token.protocol;
    if (!currentProtocol) return undefined;

    // Find the underlying asset for this yield token
    const underlyingTokenSymbol = token.token.substring(1); // e.g., aUSDC -> USDC
    const underlyingToken = tokens.find(
      t => t.token === underlyingTokenSymbol && t.chainId === token.chainId && !t.yieldBearingToken
    );

    if (!underlyingToken) return undefined;

    // Get best APY from the store
    const { bestApy, bestProtocol } = getBestApy(
      underlyingToken.chainId,
      underlyingToken.address.toLowerCase()
    );

    // If no best APY found, skip this asset
    if (bestApy === null || !bestProtocol) return undefined;

    //@ts-ignore
    const currentApyEstimate = currentProtocol && apyData[token.chainId]?.[underlyingToken.address.toLowerCase()]?.[currentProtocol.toLowerCase()] || 0;

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

    // Get real deposits and withdrawals data from the store
    const userData = getUserActivity(wallet.address);

    if (!userData) {
      setTotalDeposited(0);
      setTotalWithdrawn(0);
      setTotalEarned(0);
      setLiveTotalEarned(0);
      return;
    }

    let totalDepositsUsd = 0;
    let totalWithdrawalsUsd = 0;

    // Helper function to find token decimals
    const findTokenDecimals = (chainId: number, protocolName: string, tokenSymbol: string): number => {
      // Find the token in the tokens array that matches the chain, protocol, and symbol
      const token = tokens.find(t =>
        t.chainId === chainId &&
        t.protocol?.toLowerCase() === protocolName.toLowerCase() &&
        (t.token.toUpperCase().includes(tokenSymbol.toUpperCase()) || t.token === tokenSymbol)
      );

      if (token) {
        return token.decimals;
      }

      // Fallback: try to find the underlying asset (non-yield-bearing version)
      const underlyingToken = tokens.find(t =>
        t.chainId === chainId &&
        !t.yieldBearingToken &&
        t.token.toUpperCase() === tokenSymbol.toUpperCase()
      );

      if (underlyingToken) {
        return underlyingToken.decimals;
      }

      // Default fallback based on common token decimals
      if (tokenSymbol.toUpperCase() === 'USDC' || tokenSymbol.toUpperCase() === 'USDT') {
        return 6; // Most USDC/USDT have 6 decimals
      }

      return 18; // Default to 18 decimals for other tokens
    };

    // Calculate Aave and Radiant earnings using: current_balance - deposits + withdrawals
    const calculateSupportedEarnings = (): number => {
      // let currentDepositAmount = 0
      let totalEarnings = 0, currentTotalBalance = 0;

      // Get Aave and Radiant assets from current balances
      const supportedAssets = filteredYieldAssets.filter(asset => {
        // const token = tokens.find(
        //   t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
        // );
        return asset?.protocol?.toLowerCase() === 'aave' || asset?.protocol?.toLowerCase() === 'radiant' || asset?.protocol?.toLowerCase() === 'compound' || asset?.protocol?.toLowerCase() === 'yearn v3';
      });
      supportedAssets.forEach(asset => {
        // Current balance in USD
        const currentBalanceUsd = parseFloat(asset.currentBalanceInProtocolUsd || '0');

        // Find corresponding deposits and withdrawals for this token
        let depositsUsd = 0;
        let withdrawalsUsd = 0;
        let protocolName = "";
        Object.entries(userData).forEach(([chainIdStr, chainData]) => {
          const chainId = parseInt(chainIdStr, 10);

          if (chainId !== asset.chainId) return;

          // Get the protocol data (Aave or Radiant)
          // const token = tokens.find(
          // t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
          // );
          protocolName = asset.protocol || "";

          if (!protocolName) return;

          const protocolData = (chainData as Record<string, any>)[protocolName];
          if (!protocolData) return;
          // Map token symbols to underlying asset symbols for deposits/withdrawals lookup
          let tokenSymbol = asset.token;

          const tokenData = protocolData[tokenSymbol];
          if (!tokenData) {
            console.log(`No deposit/withdrawal data found for ${protocolName} token ${asset.token} (mapped to ${tokenSymbol}) on chain ${chainId}`);
            return;
          }
          // debugger
          const decimals = findTokenDecimals(chainId, protocolName, tokenSymbol);

          // Convert BigInt values to regular numbers with proper decimals
          const depositsRawString = tokenData.totalDeposit || '0';
          const withdrawalsRawString = tokenData.totalWithdraw || '0';

          const depositsBigInt = BigInt(depositsRawString);
          const withdrawalsBigInt = BigInt(withdrawalsRawString);
          const divisor = BigInt('1' + '0'.repeat(decimals));

          const depositsWhole = depositsBigInt / divisor;
          const depositsRemainder = depositsBigInt % divisor;
          const depositsFormatted = Number(depositsWhole) + Number(depositsRemainder) / Number(divisor);
          if (selectedNetwork == 'all' || chainId === asset.chainId) {
            currentTotalBalance += currentBalanceUsd;
          }

          const withdrawalsWhole = withdrawalsBigInt / divisor;
          const withdrawalsRemainder = withdrawalsBigInt % divisor;
          const withdrawalsFormatted = Number(withdrawalsWhole) + Number(withdrawalsRemainder) / Number(divisor);

          // Find token price for USD conversion - use the underlying asset price
          // const tokenInfo = tokens.find(t =>
          //   t.chainId === chainId &&
          //   !t.yieldBearingToken &&
          //   (t.token.toUpperCase() === tokenSymbol.toUpperCase())
          // );

          const tokenPrice = asset.usd;
          depositsUsd += depositsFormatted * tokenPrice;
          withdrawalsUsd += withdrawalsFormatted * tokenPrice;
        });

        // Calculate earnings for this token: current_balance - deposits + withdrawals
        const tokenEarnings = currentBalanceUsd - (depositsUsd - withdrawalsUsd);
        // const tokenEarnings = depositsUsd - withdrawalsUsd;
        totalEarnings += tokenEarnings;

        // console.log(`Earnings for ${asset.token} on ${asset.chain} (${protocolName}):`, { currentBalanceUsd, depositsUsd, withdrawalsUsd, tokenEarnings });

      });
      setCurrentBalance(currentTotalBalance)
      // setCurrentDeposit(currentDepositAmount)
      return totalEarnings;
    };

    // Process deposits and withdrawals for each chain and protocol (Aave and Radiant)
    Object.entries(userData).forEach(([chainIdStr, chainData]) => {
      const chainId = parseInt(chainIdStr, 10);

      Object.entries(chainData as Record<string, any>).forEach(([protocolName, protocolData]) => {
        // Only process Aave and Radiant protocol data to be consistent with earnings calculation
        if (protocolName.toLowerCase() !== 'aave' && protocolName.toLowerCase() !== 'radiant' && protocolName.toLowerCase() !== 'compound' && protocolName.toLowerCase() !== 'yearn v3') return;

        Object.entries(protocolData as Record<string, any>).forEach(([tokenSymbol, tokenData]) => {
          const decimals = findTokenDecimals(chainId, protocolName, tokenSymbol);

          // Convert BigInt values to regular numbers with proper decimals
          const depositsRawString = (tokenData as any).totalDeposit || '0';
          const withdrawalsRawString = (tokenData as any).totalWithdraw || '0';

          // Handle as BigInt and use BigInt arithmetic for division
          const depositsBigInt = BigInt(depositsRawString);
          const withdrawalsBigInt = BigInt(withdrawalsRawString);

          // Create divisor as BigInt more carefully
          const divisor = BigInt('1' + '0'.repeat(decimals)); // Creates 10^decimals as BigInt

          // Do BigInt division to get the main units, then handle remainder for precision
          const depositsWhole = depositsBigInt / divisor;
          const depositsRemainder = depositsBigInt % divisor;
          const depositsFormatted = Number(depositsWhole) + Number(depositsRemainder) / Number(divisor);

          const withdrawalsWhole = withdrawalsBigInt / divisor;
          const withdrawalsRemainder = withdrawalsBigInt % divisor;
          const withdrawalsFormatted = Number(withdrawalsWhole) + Number(withdrawalsRemainder) / Number(divisor);

          // Find token price for USD conversion - use underlying asset price
          const tokenInfo = allYieldAssets.find(t =>
            t.chainId === chainId &&
            // !t.yieldBearingToken &&
            (t.token.toUpperCase() === tokenSymbol.toUpperCase())
          );

          const tokenPrice = tokenInfo?.usd || 1; // Default to $1 if no price found
          // const totalDep = depositsFormatted * tokenPrice
          // const totalWith = withdrawalsFormatted * tokenPrice
          if (selectedNetwork !== 'all' && selectedNetwork !== chainId) return;
          totalDepositsUsd += depositsFormatted * tokenPrice;
          totalWithdrawalsUsd += withdrawalsFormatted * tokenPrice;
        });
      });
    });

    // Calculate earnings: Use supported protocols calculation (Aave and Radiant)
    const supportedEarnings = calculateSupportedEarnings();

    // For non-Aave protocols, we could still use the existing APY-based calculation
    // const otherProtocolEarnings = getTotalEarnings().lifetime; // You can uncomment this if needed

    const totalEarnedUsd = supportedEarnings; // Only Aave and Radiant earnings for now, as requested

    // Update state with real data
    // console.log({ totalDepositsUsd, totalWithdrawalsUsd, totalEarnedUsd });
    setTotalDeposited(totalDepositsUsd)
    // setTotalDeposited(totalDepositsUsd - totalWithdrawalsUsd);
    setCurrentDeposit(totalDepositsUsd - totalWithdrawalsUsd)

    setCurrentEarned(currentBalance - (totalDepositsUsd - totalWithdrawalsUsd))
    setTotalWithdrawn(totalWithdrawalsUsd);
    setTotalEarned(totalEarnedUsd);
    setLiveTotalEarned(totalEarnedUsd);
  }, [wallet.address, getUserActivity, getTotalEarnings, allYieldAssets, selectedNetwork, currentBalance]);
  // Live ticker effect - update earnings every 100ms based on Aave APY
  useEffect(() => {
    if (!wallet.address || totalEarned <= 0) return;

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

  // Loading state
  if (loading || earningsLoading || activityLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your yields...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading yield data: {error}</p>
      </div>
    );
  }

  // Empty state - no yield-bearing assets at all
  if (allYieldAssets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          {/* <h1>My Yields</h1> */}
        </div>
        <div className={styles.emptyState}>
          <h3>No yield-bearing assets found</h3>
          <p>You don't have any assets currently earning yield.</p>
          <button onClick={handleNavigate} className={styles.exploreButton}>Explore Yield Opportunities</button>
        </div>
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

        {/* Protocol, Search and View Toggle Group */}
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
            protocols={uniqueProtocols}
            onChange={setSelectedProtocol}
            className={styles.protocolSelector}
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
          <div className={styles.summaryTitle}>Total Withdrawn</div>
          <div className={styles.summaryAmount}>
            ${formatNumber(totalWithdrawn, 4)}
          </div>
          <div className={styles.summarySubtext}>
            Total withdrawn from protocols
          </div>
        </div>
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
            {/* ${formatNumber(currentBalance - currentDeposit, 20)} */}
            ${formatNumber(currentEarned, 20)}
          </div>
          <div className={styles.summarySubtext}>
            Current Earning from protocols
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
      <div className={styles.section}>
        {filteredYieldAssets.length > 0 ? (
          viewType === 'cards' ? (
            <div className={styles.yieldGrid}>
              {filteredYieldAssets.map((asset) => {
                const optimizationData = getOptimizationDataForAsset(asset);

                // Handle optimization for this specific asset
                const handleOptimize = () => {
                  console.log('Starting optimization for:', asset.token);
                  if (optimizationData) {
                    console.log(`Optimizing ${asset.token} from ${optimizationData.currentProtocol} to ${optimizationData.betterProtocol}`);
                  }
                };

                return (
                  <YieldCard
                    key={`${asset.token}-${asset.chainId}-${asset.protocol}`}
                    asset={asset}
                    optimizationData={optimizationData}
                    onOptimize={handleOptimize}
                  />
                );
              })}
            </div>
          ) : (
            <YieldsTable
              assets={filteredYieldAssets}
              loading={loading}
              getOptimizationDataForAsset={getOptimizationDataForAsset}
            />
          )
        ) : (
          <div className={styles.filteredEmptyState}>
            <div className={styles.filteredEmptyContent}>
              <div className={styles.filteredEmptyIcon}>🔍</div>
              <div className={styles.filteredEmptyText}>
                <h3>No matching assets found</h3>
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
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyYieldsPage;
