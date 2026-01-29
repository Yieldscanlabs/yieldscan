import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './Wallet.module.css';
import WalletModal from '../../components/WalletModal';
import AssetList from '../../components/AssetList';
import AssetTable from '../../components/AssetTable';
import ViewToggle from '../../components/ViewToggle';
import { useUserPreferencesStore, type ViewType } from '../../store/userPreferencesStore';
import NetworkSelector from '../../components/NetworkSelector';
import AssetSelector from '../../components/AssetSelector';
import DepositForm from '../../components/DepositForm';
import DepositSuccess from '../../components/DepositSuccess';
import SearchBar from '../../components/SearchBar';
import useWalletConnection from '../../hooks/useWalletConnection';
import useYieldOptions from '../../hooks/useYieldOptions';
import type { Asset, YieldOption } from '../../types';
import type { BestApyResult } from '../../hooks/useBestApy';
import { useAssetStore } from '../../store/assetStore';
import { AVAILABLE_NETWORKS } from '../../utils/markets';
import WalletWelcome from './WalletWelcome';
import PageHeader from '../../components/PageHeader';
import { useManualWalletStore } from '../../store/manualWalletStore';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../../utils/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyStateCard from '../../components/wallet-page/EmptyWalletStateCard';
import { WalletSkeletonLoader } from '../../components/loaders/WalletSkeletonLoader';
import { HARD_MIN_USD, useLowValueFilter } from '../../hooks/useLowValueFilter';
import { useApyStore } from '../../store/apyStore';
import { getBestYield } from '../../utils/getBestYield';
import LowValueFilterCheckbox from '../../components/common/LowValueFilterCheckbox';
import FilteredEmptyState from '../../components/wallet-page/FilteredEmptyState';
import WalletLabel from '../../components/common/WalletLabel';

interface WalletState {
  selectedAsset: Asset | null;
  bestApyData: BestApyResult | null;
  showDepositForm: boolean;
  showDepositSuccess: boolean;
  selectedNetwork: number | 'all';
  selectedAssetFilter: string | 'all';
  searchQuery: string;
  depositData: {
    amount: string;
    dailyYield: string;
    yearlyYield: string;
  };
}

function Wallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { assets, isLoading: assetsLoading } = useAssetStore();
  const { apyData } = useApyStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  const { walletPageView: viewType, setWalletPageView: setViewType } = useUserPreferencesStore();

  //  Uses Global Store via Hook (Persisted & Shared)
  const { hideLowValues, setHideLowValues, shouldShowWalletAsset, isAboveHardDust } = useLowValueFilter();

  const [state, setState] = useState<WalletState>({
    selectedAsset: null,
    bestApyData: null,
    showDepositForm: false,
    showDepositSuccess: false,
    selectedNetwork: 'all',
    selectedAssetFilter: 'all',
    searchQuery: '',
    depositData: { amount: '0', dailyYield: '0', yearlyYield: '0' }
  });

  const { yieldOptions } = useYieldOptions(state.selectedAsset);

  useEffect(() => {
    const navigationState = location.state as { filterNetwork?: number | 'all' } | null;
    if (navigationState && navigationState.filterNetwork !== undefined) {
      setState(prev => ({ ...prev, selectedNetwork: navigationState.filterNetwork! }));
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900 && viewType !== 'cards') setViewType('cards');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewType, setViewType]);

  const handleRedirect = (path: string) => {
    const navigationState = state?.selectedNetwork !== 'all' ? { filterNetwork: state?.selectedNetwork } : undefined;
    navigate(path, { state: navigationState });
  };

  const handleSelectAsset = (asset: Asset, apyData?: BestApyResult) => {
    setState(prev => ({ ...prev, selectedAsset: asset, bestApyData: apyData || null, showDepositForm: true, showDepositSuccess: false }));
  };
  const handleBackToAssets = () => {
    setState(prev => ({ ...prev, selectedAsset: null, bestApyData: null, showDepositForm: false, showDepositSuccess: false }));
  };
  const handleDeposit = ({ amount, dailyYield, yearlyYield }: { amount: string; dailyYield: string; yearlyYield: string }) => {
    setState(prev => ({ ...prev, depositData: { amount, dailyYield, yearlyYield }, showDepositForm: false, showDepositSuccess: true }));
  };
  const handleViewChange = (newViewType: ViewType) => { setViewType(newViewType); };
  const handleNetworkChange = (selectedNetwork: number | 'all') => { setState(prev => ({ ...prev, selectedNetwork })); };
  const handleAssetFilterChange = (assetToken: string | 'all') => { setState(prev => ({ ...prev, selectedAssetFilter: assetToken })); };
  const handleSearchChange = (query: string) => { setState(prev => ({ ...prev, searchQuery: query })); };
  const handleResetFilters = () => {
    setState(prev => ({ ...prev, selectedNetwork: 'all', selectedAssetFilter: 'all', searchQuery: '' }));
    setHideLowValues(false);
  };

  const getSelectedYieldOption = (): YieldOption => {
    if (state.bestApyData?.bestApy && state.bestApyData.bestProtocol && state.selectedAsset) {
      return {
        id: '0',
        protocol: state.bestApyData.bestProtocol,
        token: state.selectedAsset.token,
        chain: state.selectedAsset.chain,
        apy: state.bestApyData.bestApy,
        tvl: '$0',
        risk: 'Low',
        lockupDays: 0
      };
    }
    return yieldOptions[0] || {
      id: '0',
      protocol: 'Loading...',
      token: state.selectedAsset?.token || '',
      chain: state.selectedAsset?.chain || 'ETH',
      apy: 0,
      tvl: '$0',
      risk: 'Low',
      lockupDays: 0
    };
  };

  const deduplicateAssets = (assetList: Asset[]): Asset[] => {
    const seenMap = new Map<string, boolean>();
    return assetList.filter(asset => {
      const key = `${asset.token.toUpperCase()}-${asset.chainId}`;
      if (seenMap.has(key)) return false;
      seenMap.set(key, true);
      return true;
    });
  };

  const uniqueAssetsForSelector = useMemo(() => {
    const assetMap = new Map();
    const minBalance = typeof HARD_MIN_USD !== 'undefined' ? HARD_MIN_USD : 0;

    assets.forEach(asset => {
      if (!asset.token || typeof asset.token !== 'string') return;
      if (!asset.address || typeof asset.address !== 'string') return;

      const balance = Number(asset.balance);
      if (isNaN(balance) || balance <= minBalance) return;

      if (state.selectedNetwork !== 'all') {
        if (Number(asset.chainId) !== Number(state.selectedNetwork)) return;
      }

      if (!isAboveHardDust(asset)) return;

      const mapKey = asset.token.trim().toUpperCase();
      if (!assetMap.has(mapKey)) {
        assetMap.set(mapKey, {
          token: asset.token,
          icon: asset.icon,
          chainId: asset.chainId,
          hasHoldings: true
        });
      }
    });

    return Array.from(assetMap.values());
  }, [assets, state.selectedNetwork, isAboveHardDust]);

  const enrichAssetsWithApy = (assetList: Asset[]) => {
    return assetList.map(asset => {
      const { bestApy, bestProtocol } = getBestYield(apyData, asset.chainId, asset.address);
      return {
        ...asset,
        apy: bestApy,
        protocol: bestProtocol || asset.protocol
      };
    });
  };

  const renderAssetView = () => {
    const baseFilterMatch = (asset: Asset) => {
      const matchesNetwork = state.selectedNetwork === 'all' || Number(asset.chainId) === Number(state.selectedNetwork);
      const matchesAssetFilter = state.selectedAssetFilter === 'all' ||
        (asset.token && asset.token.toLowerCase() === state.selectedAssetFilter.toLowerCase());
      const matchesSearch = state.searchQuery === '' ||
        (asset.token && asset.token.toLowerCase().includes(state.searchQuery.toLowerCase()));

      const { bestApy } = getBestYield(apyData, asset.chainId, asset.address);
      const hasYield = bestApy !== null;

      return matchesNetwork && matchesAssetFilter && matchesSearch && hasYield;
    };

    const hasAnyAssets = (walletAssets: Asset[]) => {
      return walletAssets.some(asset => isAboveHardDust(asset));
    }

    const commonProps = {
      loading: assetsLoading,
      onSelectAsset: handleSelectAsset,
      selectedAsset: state.selectedAsset
    };

    //  Shared Filter & Deduplication Logic using Global Checkbox
    // Applies to both consolidated and single views
    const processWalletAssets = (walletAssets: Asset[]) => {
      const filtered = walletAssets.filter(asset => baseFilterMatch(asset) && shouldShowWalletAsset(asset));
      const deduped = deduplicateAssets(filtered);
      return enrichAssetsWithApy(deduped); // Enrich for table view
    };

    if (isConsolidated) {
      const allAddresses = [...manualAddresses];
      if (isMetamaskConnected && metamaskAddress) allAddresses.push(metamaskAddress);

      const assetsByWallet = new Map<string, Asset[]>();
      assets.forEach(asset => {
        const walletAddr = asset.walletAddress?.toLowerCase() || '';
        if (!assetsByWallet.has(walletAddr)) assetsByWallet.set(walletAddr, []);
        assetsByWallet.get(walletAddr)!.push(asset);
      });

      return (
        <div className={styles.assetViewContainer}>
          <PageHeader title="Wallet" subtitle="Only showing assets that can earn yield with the best APY" />
          <div className={styles.controlsRow}>
            <div className={styles.filterControls}>
              <NetworkSelector
                selectedNetwork={state.selectedNetwork}
                networks={AVAILABLE_NETWORKS}
                /* @ts-ignore */
                onChange={handleNetworkChange}
              />
              <AssetSelector selectedAsset={state.selectedAssetFilter} assets={uniqueAssetsForSelector} onChange={handleAssetFilterChange} />
            </div>
            <div className={styles.searchAndViewGroup}>
              {/*  Global Checkbox in Controls Row */}

              <LowValueFilterCheckbox checked={hideLowValues} onChange={setHideLowValues} style={{ marginRight: '16px' }} />
              <ViewToggle currentView={viewType} onViewChange={handleViewChange} />
              <SearchBar ref={searchInputRef} placeholder="Search coins ..." value={state.searchQuery} onChange={handleSearchChange} showKeybind={true} />
            </div>
          </div>

          {allAddresses.map((address) => {
            const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];
            const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();
            const walletName = shortenAddress(address);

            //  Use shared processor with Global Checkbox state
            const finalAssets = processWalletAssets(walletAssets);
            const walletHasAnyAssets = hasAnyAssets(walletAssets);

            return (
              <div key={address} className={styles.walletSection}>
                <div className={styles.walletSectionHeader}>
                  <div className={styles.headerLeft}>
                    {/* 2. Integrate the Wallet Label Component */}
                    <WalletLabel address={address} />

                    {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                  </div>
                </div>

                {assetsLoading ? (
                  <WalletSkeletonLoader viewType={viewType} />
                ) : (
                  <>
                    {finalAssets.length > 0 ? (
                      viewType === 'cards' ? (
                        <AssetList {...commonProps} assets={finalAssets} />
                      ) : (
                        <AssetTable {...commonProps} assets={finalAssets} />
                      )
                    ) : (
                      walletHasAnyAssets ? (
                        <FilteredEmptyState onReset={handleResetFilters} />
                      ) : (
                        <div className={viewType === 'cards' ? styles.assetGrid : ''}>
                          <EmptyStateCard onClick={() => handleRedirect('/explore')} walletAddress={address} />
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // --- SINGLE VIEW ---
    const finalAssets = processWalletAssets(assets);
    const hasAnyTotal = hasAnyAssets(assets);

    return (
      <div className={styles.assetViewContainer}>
        <PageHeader title="Wallet" subtitle="Only showing assets that can earn yield with the best APY" />
        <div className={styles.controlsRow}>
          <div className={styles.filterControls}>
            <NetworkSelector
              selectedNetwork={state.selectedNetwork}
              networks={AVAILABLE_NETWORKS}
              /* @ts-ignore */
              onChange={handleNetworkChange}
            />
            <AssetSelector selectedAsset={state.selectedAssetFilter} assets={uniqueAssetsForSelector} onChange={handleAssetFilterChange} />
          </div>
          <div className={styles.searchAndViewGroup}>
            <LowValueFilterCheckbox checked={hideLowValues} onChange={setHideLowValues} style={{ marginRight: '16px' }} />
            <ViewToggle currentView={viewType} onViewChange={handleViewChange} />
            <SearchBar ref={searchInputRef} placeholder="Search coins..." value={state.searchQuery} onChange={handleSearchChange} showKeybind={true} />
          </div>
        </div>

        {assetsLoading ? (
          <WalletSkeletonLoader viewType={viewType} />
        ) : (
          <>
            {finalAssets.length > 0 ? (
              viewType === 'cards' ? (
                <AssetList {...commonProps} assets={finalAssets} />
              ) : (
                <AssetTable {...commonProps} assets={finalAssets} />
              )
            ) : (
              hasAnyTotal ? (
                <FilteredEmptyState onReset={handleResetFilters} />
              ) : (
                <div className={viewType === 'cards' ? styles.assetGrid : ''}>
                  <EmptyStateCard onClick={() => handleRedirect('/explore')} />
                </div>
              )
            )}
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!wallet.isConnected && manualAddresses.length === 0) return <WalletWelcome onConnect={openConnectModal} />;

    if (state.selectedAsset && state.showDepositSuccess) {
      const protocol = state.bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
      const usdPrice = parseFloat(state.selectedAsset.balanceUsd) / parseFloat(state.selectedAsset.balance);
      const amountUsd = (parseFloat(state.depositData.amount) * usdPrice).toFixed(2);
      return <div className={styles.stepContainer}><div className={styles.depositContainer}><DepositSuccess asset={state.selectedAsset} amount={state.depositData.amount} amountUsd={amountUsd} dailyYieldUsd={state.depositData.dailyYield} yearlyYieldUsd={state.depositData.yearlyYield} protocol={protocol} onReturn={handleBackToAssets} /></div></div>;
    }

    if (state.selectedAsset && state.showDepositForm) {
      return <div className={styles.stepContainer}><div className={styles.depositContainer}><DepositForm asset={state.selectedAsset} yieldOption={getSelectedYieldOption()} onDeposit={handleDeposit} onBack={handleBackToAssets} usdPrice={parseFloat(state.selectedAsset.balanceUsd) / parseFloat(state.selectedAsset.balance)} bestApyData={state.bestApyData || undefined} /></div></div>;
    }

    return <div className={styles.stepContainer}><div className={styles.assetsWithYieldContainer}>{renderAssetView()}</div></div>;
  };

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

  return (
    <div className={styles.appWrapper}>
      <div className={styles.appContainer}>
        {renderContent()}
        <WalletModal isOpen={isModalOpen} onClose={closeConnectModal} />
      </div>
    </div>
  );
}

export default Wallet;