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
  const { assets, isLoading: assetsLoading } = useAssetStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Filter assets by selected network and search query
    const filteredAssets = assets.filter(asset => {
      // Filter out yield bearing tokens
      // if (asset.yieldBearingToken) return true;

      // Filter by network
      const matchesNetwork = state.selectedNetwork === 'all' || asset.chainId === state.selectedNetwork;

      // Filter by search query
      const matchesSearch = state.searchQuery === '' ||
        asset.token.toLowerCase().includes(state.searchQuery.toLowerCase());

      return matchesNetwork && matchesSearch;
    });
    console.log({ filteredAssets })
    const commonProps = {
      assets: filteredAssets,
      loading: assetsLoading,
      onSelectAsset: handleSelectAsset,
      selectedAsset: state.selectedAsset
    };

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
          <AssetList {...commonProps} />
        ) : (
          <AssetTable {...commonProps} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!wallet.isConnected) {
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