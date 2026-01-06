import { useState, useEffect, useRef } from 'react';
import styles from './Wallet.module.css';
import WalletModal from '../../components/WalletModal';
import AssetList from '../../components/AssetList';
import AssetTable from '../../components/AssetTable';
import ViewToggle from '../../components/ViewToggle';
import { useUserPreferencesStore, type ViewType } from '../../store/userPreferencesStore';
import NetworkSelector from '../../components/NetworkSelector';
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
import { useNavigate } from 'react-router-dom';
import EmptyStateCard from '../../components/wallet-page/EmptyWalletStateCard';
import { WalletSkeletonLoader } from '../../components/loaders/WalletSkeletonLoader';

interface WalletState {
  selectedAsset: Asset | null;
  bestApyData: BestApyResult | null;
  showDepositForm: boolean;
  showDepositSuccess: boolean;
  selectedNetwork: number | 'all';
  searchQuery: string;
  depositData: {
    amount: string;
    dailyYield: string;
    yearlyYield: string;
  };
}

function Wallet() {
  const navigate = useNavigate();
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { assets, isLoading: assetsLoading } = useAssetStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  const { walletPageView: viewType, setWalletPageView: setViewType } = useUserPreferencesStore();

  const [state, setState] = useState<WalletState>({
    selectedAsset: null,
    bestApyData: null,
    showDepositForm: false,
    showDepositSuccess: false,
    selectedNetwork: 'all',
    searchQuery: '',
    depositData: { amount: '0', dailyYield: '0', yearlyYield: '0' }
  });

  const { yieldOptions } = useYieldOptions(state.selectedAsset);

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

  const handleSelectAsset = (asset: Asset, apyData?: BestApyResult) => {
    setState(prev => ({
      ...prev,
      selectedAsset: asset,
      bestApyData: apyData || null,
      showDepositForm: true,
      showDepositSuccess: false,
    }));
  };

  const handleBackToAssets = () => {
    setState(prev => ({
      ...prev,
      selectedAsset: null,
      bestApyData: null,
      showDepositForm: false,
      showDepositSuccess: false,
    }));
  };

  const handleDeposit = ({ amount, dailyYield, yearlyYield }: { amount: string; dailyYield: string; yearlyYield: string }) => {
    setState(prev => ({
      ...prev,
      depositData: { amount, dailyYield, yearlyYield },
      showDepositForm: false,
      showDepositSuccess: true,
    }));
  };

  const handleViewChange = (newViewType: ViewType) => {
    setViewType(newViewType);
  };

  const handleNetworkChange = (selectedNetwork: number | 'all') => {
    setState(prev => ({ ...prev, selectedNetwork }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleResetFilters = () => {
    setState(prev => ({ ...prev, selectedNetwork: 'all', searchQuery: '' }));
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

  const renderAssetView = () => {

    // Filter logic
    const filterAsset = (asset: Asset) => {
      const matchesNetwork = state.selectedNetwork === 'all' || asset.chainId === state.selectedNetwork;
      const matchesSearch = state.searchQuery === '' || asset.token.toLowerCase().includes(state.searchQuery.toLowerCase());
      const hasBalance = Number(asset.balance) > 0;
      return matchesNetwork && matchesSearch && hasBalance;
    };

    const hasAnyAssets = (walletAssets: Asset[]) => {
      return walletAssets.some(asset => Number(asset.balance) > 0);
    }

    const commonProps = {
      loading: assetsLoading,
      onSelectAsset: handleSelectAsset,
      selectedAsset: state.selectedAsset
    };

    // --- CONSOLIDATED VIEW ---
    if (isConsolidated) {
      const allAddresses = [...manualAddresses];
      if (isMetamaskConnected && metamaskAddress) {
        allAddresses.push(metamaskAddress);
      }

      const assetsByWallet = new Map<string, Asset[]>();
      assets.forEach(asset => {
        const walletAddr = asset.walletAddress?.toLowerCase() || '';
        if (!assetsByWallet.has(walletAddr)) {
          assetsByWallet.set(walletAddr, []);
        }
        assetsByWallet.get(walletAddr)!.push(asset);
      });

      return (
        <div className={styles.assetViewContainer}>
          <PageHeader
            title="Wallet"
            subtitle="Only showing assets that can earn yield with the best APY"
          />
          <div className={styles.controlsRow}>
            <NetworkSelector
              selectedNetwork={state.selectedNetwork}
              networks={AVAILABLE_NETWORKS}
              //@ts-ignore
              onChange={handleNetworkChange}
            />
            <div className={styles.searchAndViewGroup}>
              <ViewToggle currentView={viewType} onViewChange={handleViewChange} />
              <SearchBar
                ref={searchInputRef}
                placeholder="Search coins ..."
                value={state.searchQuery}
                onChange={handleSearchChange}
                showKeybind={true}
              />
            </div>
          </div>

          {allAddresses.map((address) => {
            const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];
            const filteredAssets = walletAssets.filter(filterAsset);
            const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();
            const walletName = shortenAddress(address);
            const walletHasAnyAssets = hasAnyAssets(walletAssets);

            return (
              <div key={address} className={styles.walletSection}>
                <div className={styles.walletSectionHeader}>
                  <h3>Wallet: {walletName}</h3>
                  {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                </div>

                {/* Consolidate View Skeleton */}

                {assetsLoading ? (
                  <WalletSkeletonLoader viewType={viewType} />
                ) : (
                  <>
                    {filteredAssets.length > 0 ? (
                      viewType === 'cards' ? (
                        <AssetList {...commonProps} assets={filteredAssets} />
                      ) : (
                        <AssetTable {...commonProps} assets={filteredAssets} />
                      )
                    ) : (
                      // Empty State Logic
                      walletHasAnyAssets ? (
                        <div className={styles.filteredEmptyState}>
                          <div className={styles.filteredEmptyContent}>
                            <div className={styles.filteredEmptyIcon}>🔍</div>
                            <div className={styles.filteredEmptyText}>
                              <h3>No matching assets found</h3>
                              <p>No assets match your current filters in this wallet.</p>
                            </div>
                            <button className={styles.resetFiltersButton} onClick={handleResetFilters}>
                              Reset Filters
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={viewType === 'cards' ? styles.assetGrid : ''}>
                          <EmptyStateCard onClick={() => navigate('/explore')} walletAddress={address} />
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
    const filteredAssets = assets.filter(filterAsset);
    const hasAnyTotal = hasAnyAssets(assets);

    return (
      <div className={styles.assetViewContainer}>
        <PageHeader
          title="Wallet"
          subtitle="Only showing assets that can earn yield with the best APY"
        />
        <div className={styles.controlsRow}>
          <NetworkSelector
            selectedNetwork={state.selectedNetwork}
            networks={AVAILABLE_NETWORKS}
            //@ts-ignore
            onChange={handleNetworkChange}
          />
          <div className={styles.searchAndViewGroup}>
            <ViewToggle currentView={viewType} onViewChange={handleViewChange} />
            <SearchBar
              ref={searchInputRef}
              placeholder="Search coins..."
              value={state.searchQuery}
              onChange={handleSearchChange}
              showKeybind={true}
            />
          </div>
        </div>

        {/* Single View Skeleton */}
        {assetsLoading ? (
          <WalletSkeletonLoader viewType={viewType} />
        ) : (
          <>
            {filteredAssets.length > 0 ? (
              viewType === 'cards' ? (
                <AssetList {...commonProps} assets={filteredAssets} />
              ) : (
                <AssetTable {...commonProps} assets={filteredAssets} />
              )
            ) : (
              // Empty State Logic
              hasAnyTotal ? (
                <div className={styles.filteredEmptyState}>
                  <div className={styles.filteredEmptyContent}>
                    <div className={styles.filteredEmptyIcon}>🔍</div>
                    <div className={styles.filteredEmptyText}>
                      <h3>No matching assets found</h3>
                      <p>No assets match your current filters.</p>
                    </div>
                    <button className={styles.resetFiltersButton} onClick={handleResetFilters}>
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className={viewType === 'cards' ? styles.assetGrid : ''}>
                  <EmptyStateCard onClick={() => navigate('/explore')} />
                </div>
              )
            )}
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!wallet.isConnected && manualAddresses.length === 0) {
      return <WalletWelcome onConnect={openConnectModal} />;
    }

    if (state.selectedAsset && state.showDepositSuccess) {
      const protocol = state.bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
      const usdPrice = parseFloat(state.selectedAsset.balanceUsd) / parseFloat(state.selectedAsset.balance);
      const amountUsd = (parseFloat(state.depositData.amount) * usdPrice).toFixed(2);
      return (
        <div className={styles.stepContainer}>
          <div className={styles.depositContainer}>
            <DepositSuccess
              asset={state.selectedAsset}
              amount={state.depositData.amount}
              amountUsd={amountUsd}
              dailyYieldUsd={state.depositData.dailyYield}
              yearlyYieldUsd={state.depositData.yearlyYield}
              protocol={protocol}
              onReturn={handleBackToAssets}
            />
          </div>
        </div>
      );
    }

    if (state.selectedAsset && state.showDepositForm) {
      return (
        <div className={styles.stepContainer}>
          <div className={styles.depositContainer}>
            <DepositForm
              asset={state.selectedAsset}
              yieldOption={getSelectedYieldOption()}
              onDeposit={handleDeposit}
              onBack={handleBackToAssets}
              usdPrice={parseFloat(state.selectedAsset.balanceUsd) / parseFloat(state.selectedAsset.balance)}
              bestApyData={state.bestApyData || undefined}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.stepContainer}>
        <div className={styles.assetsWithYieldContainer}>
          {renderAssetView()}
        </div>
      </div>
    );
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
        <WalletModal
          isOpen={isModalOpen}
          onClose={closeConnectModal}
        />
      </div>
    </div>
  );
}

export default Wallet;