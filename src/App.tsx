import { useState } from 'react';
import styles from './App.module.css';
import WalletModal from './components/WalletModal';
import AssetList from './components/AssetList';
import DepositForm from './components/DepositForm';
import DepositSuccess from './components/DepositSuccess';
import useWalletConnection from './hooks/useWalletConnection';
import useYieldOptions from './hooks/useYieldOptions';
import type { Asset, YieldOption } from './types';
import type { BestApyResult } from './hooks/useBestApy';
import Loading from './components/Loading';
import { useAssetStore } from './store/assetStore';
import Logo from './components/Logo';
import { Link } from 'react-router-dom';

function App() {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal, disconnectWallet } = useWalletConnection();
  const { assets, isLoading: assetsLoading } = useAssetStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [bestApyData, setBestApyData] = useState<BestApyResult | null>(null);
  const { yieldOptions } = useYieldOptions(selectedAsset);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showDepositSuccess, setShowDepositSuccess] = useState(false);
  const [depositAmount, setDepositAmount] = useState('0');
  const [depositDailyYield, setDepositDailyYield] = useState('0');
  const [depositYearlyYield, setDepositYearlyYield] = useState('0');
  console.log(assets)
  // Updated to handle bestApyData from asset selection
  const handleSelectAsset = (asset: Asset, apyData?: BestApyResult) => {
    setSelectedAsset(asset);
    if (apyData) {
      setBestApyData(apyData);
    } else {
      setBestApyData(null);
    }
    setShowDepositForm(true);
    setShowDepositSuccess(false);
  };

  const handleBackToAssets = () => {
    setSelectedAsset(null);
    setBestApyData(null);
    setShowDepositForm(false);
    setShowDepositSuccess(false);
  };

  const handleDeposit = ({ amount, dailyYield, yearlyYield }: { amount: string; dailyYield: string; yearlyYield: string }) => {
    const protocol = bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
    
    setDepositAmount(amount);
    setDepositDailyYield(dailyYield);
    setDepositYearlyYield(yearlyYield);
    
    setShowDepositForm(false);
    setShowDepositSuccess(true);
  };

  const renderContent = () => {
    if (!wallet.isConnected) {
      return (
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeMessage}>
            <Logo
              slogan={true}
              className={styles.enalgeLogo}
            />
            <h2> </h2>

            <p>Find the best yield opportunities for your assets across multiple chains</p>
   
            <div className={styles.centerWalletConnect}>
              <button 
                onClick={openConnectModal}
                className={styles.connectButtonLarge}
              >
                Connect Wallet
              </button>
            </div>
            {/* <p className={styles.subtitle}>Connect your wallet to get started</p> */}
                <div className={styles.exploreAsGuest}>
              <Link to="/explore" className={styles.exploreLink}>
                Explore as guest →
              </Link>
            </div>
          </div>

        </div>
      );
    } else if (selectedAsset && showDepositSuccess) {
      const protocol = bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
      const usdPrice = parseFloat(selectedAsset.balanceUsd) / parseFloat(selectedAsset.balance);
      const amountUsd = (parseFloat(depositAmount) * usdPrice).toFixed(2);
      
      return (
        <div className={styles.stepContainer}>
          <div className={styles.depositContainer}>
            <DepositSuccess
              asset={selectedAsset}
              amount={depositAmount}
              amountUsd={amountUsd}
              dailyYieldUsd={depositDailyYield}
              yearlyYieldUsd={depositYearlyYield}
              protocol={protocol}
              onReturn={handleBackToAssets}
            />
          </div>
        </div>
      );
    } else if (selectedAsset && showDepositForm) {
      let selectedYieldOption: YieldOption;
      
      if (bestApyData && bestApyData.bestApy && bestApyData.bestProtocol) {
        selectedYieldOption = {
          id: '0',
          protocol: bestApyData.bestProtocol,
          token: selectedAsset.token,
          chain: selectedAsset.chain,
          apy: bestApyData.bestApy,
          tvl: '$0', 
          risk: 'Low',
          lockupDays: 0
        };
      } else {
        selectedYieldOption = yieldOptions[0] || {
          id: '0',
          protocol: 'Loading...',
          token: selectedAsset.token,
          chain: selectedAsset.chain,
          apy: 0,
          tvl: '$0',
          risk: 'Low',
          lockupDays: 0
        };
      }
      
      return (
        <div className={styles.stepContainer}>
          <div className={styles.backButtonContainer}>
            <button onClick={handleBackToAssets} className={styles.backButton}>
              &larr; Back to Assets
            </button>
          </div>
          <div className={styles.depositContainer}>
            <DepositForm 
              asset={selectedAsset}
              yieldOption={selectedYieldOption}
              onDeposit={handleDeposit}
              usdPrice={parseFloat(selectedAsset.balanceUsd) / parseFloat(selectedAsset.balance)}
              bestApyData={bestApyData || undefined}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.stepContainer}>
          <div className={styles.assetsWithYieldContainer}>
            {assetsLoading ? (
              <Loading
                message="Loading your assets"
                subtitle="Scanning blockchain for your tokens..." 
              />
            ) : (
              <AssetList 
                assets={assets} 
                loading={assetsLoading}
                onSelectAsset={handleSelectAsset}
                selectedAsset={selectedAsset}
              />
            )}
          </div>
        </div>
      );
    }
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

export default App;
