import { useState } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import AssetList from './components/AssetList';
import DepositForm from './components/DepositForm';
import useWallet from './hooks/useWallet';
import useAssets from './hooks/useAssets';
import useYieldOptions from './hooks/useYieldOptions';
import type { Asset, YieldOption } from './types';
import { getBestYieldOptionForAsset, getCoinColor, shortenAddress, formatNumber, calculateDailyYield } from './utils/helpers';

function App() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { assets, loading: assetsLoading } = useAssets(wallet.address);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { yieldOptions, loading: optionsLoading } = useYieldOptions(selectedAsset);
  const [showDepositForm, setShowDepositForm] = useState(false);
  
  // Calculate best yield options for each asset with earnings in USD
  const assetsWithBestYield = assets.map(asset => {
    const bestOption = getBestYieldOptionForAsset(asset.token, asset.chain);
    
    // Calculate daily USD earnings
    const balanceNum = parseFloat(asset.balance);
    const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
    
    let dailyEarningsUsd = 0;
    let yearlyEarningsUsd = 0;
    
    if (bestOption) {
      const dailyEarningsToken = calculateDailyYield(balanceNum, bestOption.apy);
      dailyEarningsUsd = dailyEarningsToken * usdPrice;
      yearlyEarningsUsd = dailyEarningsUsd * 365;
    }
    
    return { 
      ...asset, 
      bestOption,
      usdPrice,
      dailyEarningsUsd,
      yearlyEarningsUsd
    };
  });

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    // Skip yield options selection and go directly to deposit form
    setShowDepositForm(true);
  };

  const handleBackToAssets = () => {
    setSelectedAsset(null);
    setShowDepositForm(false);
  };

  const handleDeposit = (amount: string) => {
    // In a real implementation, you would call a smart contract function
    console.log(`Depositing ${amount} ${selectedAsset?.token} into ${yieldOptions[0]?.protocol}`);
  };

  // We'll make a cleaner rendering based on the app state
  const renderContent = () => {
    if (!wallet.isConnected) {
      // Step 1: Connect wallet screen
      return (
        <div className="welcome-container">
          <div className="welcome-message">
            <h2>Welcome to YieldScanner</h2>
            <p>Find the best yield opportunities for your assets across multiple chains</p>
   
            <div className="center-wallet-connect">
              <button 
                onClick={connectWallet}
                className="connect-button-large"
              >
                Connect Wallet
              </button>
            </div>
            <p className="subtitle">Connect your wallet to get started</p>
          </div>
        </div>
      );
    } else if (selectedAsset && showDepositForm) {
      // Step 3: Deposit form with slider
      const selectedYieldOption = yieldOptions[0];
      const hasLockup = selectedYieldOption?.lockupDays > 0;
      
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
              yieldOption={selectedYieldOption || {
                id: '0',
                protocol: 'Loading...',
                token: selectedAsset.token,
                chain: selectedAsset.chain,
                apy: 0,
                tvl: '$0',
                risk: 'Low',
                lockupDays: 0
              }}
              onDeposit={handleDeposit}
              usdPrice={parseFloat(selectedAsset.balanceUsd) / parseFloat(selectedAsset.balance)}
            />
          </div>
        </div>
      );
    } else {
      // Step 2: Assets list with best yield options
      return (
        <div className="step-container">
          <div className="assets-with-yield-container">
            <h2>Your Assets</h2>
            {assetsLoading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <div className="loading-message">Loading your assets</div>
                <div className="loading-subtitle">Scanning blockchain for your tokens...</div>
              </div>
            ) : (
              <div className="assets-with-yield-grid">
                {assetsWithBestYield.map(asset => (
                  <div 
                    key={`${asset.token}-${asset.chain}`}
                    className="asset-with-yield-card"
                    onClick={() => handleSelectAsset(asset)}
                  >
                    <div className="asset-section">
                      <div className="asset-header">
                        <img src={asset.icon} alt={asset.token} className="asset-icon" />
                        <div className="asset-chain-badge" style={{ backgroundColor: getCoinColor(asset.token) }}>
                          {asset.token}
                        </div>
                      </div>
                      <div className="asset-balance">
                        <div className="asset-balance-amount">{asset.balance}</div>
                        <div className="asset-balance-usd">${formatNumber(asset.balanceUsd)}</div>
                      </div>
                    </div>
                    <div className="best-yield-section">
                      <div className="best-yield-header">Best Yield</div>
                      <div className="best-yield-protocol">{asset.bestOption?.protocol || 'No options'}</div>
                      <div className="best-yield-apy-row">
                        <span className="best-yield-apy">{asset.bestOption?.apy || 0}% APY</span>
                        {asset.bestOption?.lockupDays > 0 && (
                          <span className="lockup-badge">
                            <span className="lockup-icon">🔒</span>
                            {asset.bestOption.lockupDays}d
                          </span>
                        )}
                      </div>
                      
                      {asset.bestOption && (
                        <div className="best-yield-earnings">
                          <div className="earnings-daily">
                            <span className="earnings-label">Daily</span>
                            <span className="earnings-value">${formatNumber(asset.dailyEarningsUsd, 2)}</span>
                          </div>
                          <div className="earnings-yearly">
                            <span className="earnings-label">Yearly</span>
                            <span className="earnings-value">${formatNumber(asset.yearlyEarningsUsd, 2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>YieldScanner</h1>
        {wallet.isConnected && (
          <div className="wallet-info-header">
            <span className="wallet-address-header">
              {shortenAddress(wallet.address)}
            </span>
          </div>
        )}
      </header>

      {renderContent()}
    </div>
  );
}

export default App;
