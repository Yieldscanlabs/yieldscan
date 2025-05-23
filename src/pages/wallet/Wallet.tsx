import { useState } from 'react';
import styles from './Wallet.module.css';
import WalletModal from '../../components/WalletModal';
import AssetList from '../../components/AssetList';
import AssetTable from '../../components/AssetTable';
import ViewToggle from '../../components/ViewToggle';
import type { ViewType } from '../../components/ViewToggle';
import NetworkSelector from '../../components/NetworkSelector';
import DepositForm from '../../components/DepositForm';
import DepositSuccess from '../../components/DepositSuccess';
import useWalletConnection from '../../hooks/useWalletConnection';
import useYieldOptions from '../../hooks/useYieldOptions';
import type { Asset, YieldOption } from '../../types';
import type { BestApyResult } from '../../hooks/useBestApy';
import Loading from '../../components/Loading';
import { useAssetStore } from '../../store/assetStore';
import { AVAILABLE_NETWORKS } from '../../utils/markets';
import WalletWelcome from './WalletWelcome';

interface WalletState {
  selectedAsset: Asset | null;
  bestApyData: BestApyResult | null;
  showDepositForm: boolean;
  showDepositSuccess: boolean;
  viewType: ViewType;
  selectedNetwork: number | 'all';
  depositData: {
    amount: string;
    dailyYield: string;
    yearlyYield: string;
  };
}

function Wallet() {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { assets, isLoading: assetsLoading } = useAssetStore();
  
  const [state, setState] = useState<WalletState>({
    selectedAsset: null,
    bestApyData: null,
    showDepositForm: false,
    showDepositSuccess: false,
    viewType: 'cards',
    selectedNetwork: 'all',
    depositData: { amount: '0', dailyYield: '0', yearlyYield: '0' }
  });

  const { yieldOptions } = useYieldOptions(state.selectedAsset);

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

  const handleViewChange = (viewType: ViewType) => {
    setState(prev => ({
      ...prev,
      viewType
    }));
  };

  const handleNetworkChange = (selectedNetwork: number | 'all') => {
    setState(prev => ({
      ...prev,
      selectedNetwork
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

    // Filter assets by selected network
    const filteredAssets = assets.filter(asset => 
      !asset.yieldBearingToken && 
      (state.selectedNetwork === 'all' || asset.chainId === state.selectedNetwork)
    );

    const commonProps = {
      assets: filteredAssets,
      loading: assetsLoading,
      onSelectAsset: handleSelectAsset,
      selectedAsset: state.selectedAsset
    };

    return (
      <div className={styles.assetViewContainer}>
        <div className={styles.controlsRow}>
          <NetworkSelector
            selectedNetwork={state.selectedNetwork}
            networks={AVAILABLE_NETWORKS}
            //@ts-ignore
            onChange={handleNetworkChange}
          />
          <ViewToggle 
            currentView={state.viewType}
            onViewChange={handleViewChange}
          />
        </div>
        {state.viewType === 'cards' ? (
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
          <div className={styles.backButtonContainer}>
            <button onClick={handleBackToAssets} className={styles.backButton}>
              &larr; Back to Assets
            </button>
          </div>
          <div className={styles.depositContainer}>
            <DepositForm 
              asset={state.selectedAsset}
              yieldOption={getSelectedYieldOption()}
              onDeposit={handleDeposit}
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