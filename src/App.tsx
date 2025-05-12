import { useState } from 'react';
import './App.css';
import WalletModal from './components/WalletModal';
import AssetList from './components/AssetList';
import DepositForm from './components/DepositForm';
import DepositSuccess from './components/DepositSuccess';
import Footer from './components/Footer';
import Header from './components/Header'; // Import the new Header component
import useWalletConnection from './hooks/useWalletConnection';
import useAssets from './hooks/useAssets';
import useYieldOptions from './hooks/useYieldOptions';
import type { Asset, YieldOption } from './types';
import type { BestApyResult } from './hooks/useBestApy';
import Loading from './components/Loading';

function App() {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal, disconnectWallet } = useWalletConnection();
  const { assets, loading: assetsLoading } = useAssets(wallet.address);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [bestApyData, setBestApyData] = useState<BestApyResult | null>(null);
  const { yieldOptions } = useYieldOptions(selectedAsset);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showDepositSuccess, setShowDepositSuccess] = useState(false);
  const [depositAmount, setDepositAmount] = useState('0');
  const [depositDailyYield, setDepositDailyYield] = useState('0');
  const [depositYearlyYield, setDepositYearlyYield] = useState('0');
  
  // Updated to handle bestApyData from asset selection
  const handleSelectAsset = (asset: Asset, apyData?: BestApyResult) => {
    setSelectedAsset(asset);
    // Store the best APY data if provided
    if (apyData) {
      setBestApyData(apyData);
    } else {
      setBestApyData(null);
    }
    // Skip yield options selection and go directly to deposit form
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
    // In a real implementation, you would call a smart contract function
    const protocol = bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
    console.log(`Depositing ${amount} ${selectedAsset?.token} into ${protocol}`);
    
    // Store deposit details for success screen
    setDepositAmount(amount);
    setDepositDailyYield(dailyYield);
    setDepositYearlyYield(yearlyYield);
    
    // Show success screen
    setShowDepositForm(false);
    setShowDepositSuccess(true);
  };

  // We'll make a cleaner rendering based on the app state
  const renderContent = () => {
    if (!wallet.isConnected) {
      // Step 1: Connect wallet screen
      return (
        <div className="welcome-container">
          <div className="welcome-message">
            <h2>Welcome to Yieldscan</h2>
            <p>Find the best yield opportunities for your assets across multiple chains</p>
   
            <div className="center-wallet-connect">
              <button 
                onClick={openConnectModal}
                className="connect-button-large"
              >
                Connect Wallet
              </button>
            </div>
            <p className="subtitle">Connect your wallet to get started</p>
          </div>
        </div>
      );
    } else if (selectedAsset && showDepositSuccess) {
      // Step 4: Deposit success screen
      const protocol = bestApyData?.bestProtocol || yieldOptions[0]?.protocol || 'Unknown';
      const usdPrice = parseFloat(selectedAsset.balanceUsd) / parseFloat(selectedAsset.balance);
      const amountUsd = (parseFloat(depositAmount) * usdPrice).toFixed(2);
      
      return (
        <div className="step-container">
          <div className="deposit-container">
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
      // Step 3: Deposit form with slider
      
      // Create a yield option from bestApyData or use the first yield option from the hook
      let selectedYieldOption: YieldOption;
      
      if (bestApyData && bestApyData.bestApy && bestApyData.bestProtocol) {
        selectedYieldOption = {
          id: '0',
          protocol: bestApyData.bestProtocol,
          token: selectedAsset.token,
          chain: selectedAsset.chain,
          apy: bestApyData.bestApy,
          tvl: '$0', // We might not have this from bestApyData
          risk: 'Low', // Default value
          lockupDays: 0  // Default value
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
        <div className="step-container">
          <div className="back-button-container">
            <button onClick={handleBackToAssets} className="back-button">
              &larr; Back to Assets
            </button>
          </div>
          <div className="deposit-container">
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
      // Step 2: Assets list with best yield options
      return (
        <div className="step-container">
          <div className="assets-with-yield-container">
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
    <div className="app-wrapper">
      <div className="app-container">
        <Header 
          isConnected={wallet.isConnected}
          address={wallet.address}
          disconnectWallet={disconnectWallet}
        />

        {renderContent()}
        
        <WalletModal 
          isOpen={isModalOpen}
          onClose={closeConnectModal}
        />
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
