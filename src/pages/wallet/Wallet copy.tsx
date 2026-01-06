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
import Loading from '../../components/Loading';
import { useAssetStore } from '../../store/assetStore';
import { AVAILABLE_NETWORKS } from '../../utils/markets';
import WalletWelcome from './WalletWelcome';
import PageHeader from '../../components/PageHeader';
import { useManualWalletStore } from '../../store/manualWalletStore';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../../utils/helpers';

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
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { assets, isLoading: assetsLoading, getAssetsForAddress } = useAssetStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  // Use userPreferencesStore for view toggle state
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

  const handleSelectAsset = (asset: Asset, apyData?: BestApyResult) => {
    console.log('Asset Details:');
    console.table(asset);
    console.log('Best APY Data:');
    console.table(apyData);
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
    setState(prev => ({
      ...prev,
      selectedNetwork
    }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query
    }));
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
    if (assetsLoading) {
      return (
        <Loading
          message="Loading your assets"
          subtitle="Scanning blockchain for your tokens..."
        />
      );
    }

    // Filter function for assets
    const filterAsset = (asset: Asset) => {
      // Filter by network
      const matchesNetwork = state.selectedNetwork === 'all' || asset.chainId === state.selectedNetwork;

      // Filter by search query
      const matchesSearch = state.searchQuery === '' ||
        asset.token.toLowerCase().includes(state.searchQuery.toLowerCase());

      // 👇 Keep asset if it has idle balance OR active protocol balance
      // const hasBalance = Number(asset.balance) > 0 || Number(asset.currentBalanceInProtocolUsd) > 0;
      const hasBalance = Number(asset.balance) > 0;

      return matchesNetwork && matchesSearch && hasBalance;
    };

    const commonProps = {
      loading: assetsLoading,
      onSelectAsset: handleSelectAsset,
      selectedAsset: state.selectedAsset
    };

    // Consolidated view: group by wallet address
    if (isConsolidated) {
      // Get all addresses
      const allAddresses = [...manualAddresses];
      if (isMetamaskConnected && metamaskAddress) {
        allAddresses.push(metamaskAddress);
      }

      // Group assets by walletAddress
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
              <ViewToggle
                currentView={viewType}
                onViewChange={handleViewChange}
              />
              <SearchBar
                ref={searchInputRef}
                placeholder="Search coins ..."
                value={state.searchQuery}
                onChange={handleSearchChange}
                showKeybind={true}
              />
            </div>
          </div>

          {/* Render sections for each wallet */}
          {allAddresses.map((address) => {
            const walletAssets = assetsByWallet.get(address.toLowerCase()) || [];
            console.log(`AssetsByWallet:`, assetsByWallet);
            console.log(`walletAssets for ${address}:`, walletAssets);
            const filteredAssets = walletAssets.filter(filterAsset);

            // The AssetList handles empty states internally, so let it render!
            // if (filteredAssets.length === 0) return null;

            const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

            return (
              <div key={address} className={styles.walletSection}>
                <div className={styles.walletSectionHeader}>
                  <h3>Wallet: {shortenAddress(address)}</h3>
                  {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                </div>
                {viewType === 'cards' ? (
                  <AssetList {...commonProps} assets={filteredAssets} />
                ) : (
                  <AssetTable {...commonProps} assets={filteredAssets} />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Single wallet view
    const filteredAssets = assets.filter(filterAsset);
    console.log('Filtered Assets:', filteredAssets);
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
            <ViewToggle
              currentView={viewType}
              onViewChange={handleViewChange}
            />
            <SearchBar
              ref={searchInputRef}
              placeholder="Search coins..."
              value={state.searchQuery}
              onChange={handleSearchChange}
              showKeybind={true}
            />
          </div>
        </div>
        {viewType === 'cards' ? (
          <AssetList {...commonProps} assets={filteredAssets} />
        ) : (
          <AssetTable {...commonProps} assets={filteredAssets} />
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