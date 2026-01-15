import React, { useState, useEffect } from 'react';
import { useApyStore } from '../../store/apyStore';
import { useAssetStore } from '../../store/assetStore';
import styles from './styles/LiveApy.module.css';
import useWalletConnection from '../../hooks/useWalletConnection';
import WalletCtaCard from '../../components/WalletCtaCard';
import TabNavigation from './components/TabNavigation';
import ApyTable from './components/ApyTable';
import TrustScores from './components/TrustScores';
import PageHeader from '../../components/PageHeader';
import { useLocation } from 'react-router-dom';

const LiveApyPage: React.FC = () => {
  const location = useLocation();
  const { apyData, isLoading, error, fetchApys, fetchDefinitions } = useApyStore();
  const { wallet } = useWalletConnection();
  const [activeTab, setActiveTab] = useState<string>('best-apy');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedChain, setSelectedChain] = useState<number | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<string | 'all'>('all');
  const { assets } = useAssetStore();

  const filteredAssetList = React.useMemo(() => {
    let working = assets;
    if (selectedChain !== 'all') {
      working = working.filter(asset => asset.chainId === selectedChain);
    }
    // Deduplicate by token (first found)
    const map = new Map();
    for (const asset of working) {
      if (!map.has(asset.token)) {
        map.set(asset.token, { ...asset, label: asset.token });
      }
    }
    return Array.from(map.values());
  }, [assets, selectedChain]);

  // Update initial state or useEffect to apply filter
  useEffect(() => {
    // Typecast the location state safely
    const navigationState = location.state as { filterNetwork?: number | 'all' } | null;
    console.log("navigationState: ", navigationState)
    // Check if filterNetwork is actually defined (not null or undefined)
    if (navigationState && navigationState.filterNetwork !== undefined) {
      setSelectedChain(navigationState.filterNetwork!)

      // Clear the state so it doesn't persist on refresh/back navigation
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Format timestamp for last updated
  const formattedLastUpdate = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }).format(lastUpdated);

  // Refresh data on mount
  useEffect(() => {
    fetchApys(true);
    fetchDefinitions()
    setLastUpdated(new Date());
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchApys(true);
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchApys]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Explore"
        subtitle="Discover the best yield opportunities across DeFi protocols"
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={styles.tabContent}>
        {activeTab === 'best-apy' && (
          <ApyTable
            apyData={apyData}
            isLoading={isLoading}
            error={error}
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            selectedChain={selectedChain}
            onChainChange={setSelectedChain}
            filteredAssetList={filteredAssetList}
          />
        )}

        {activeTab === 'trust-scores' && (
          <TrustScores />
        )}
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.column}>
          {/* Left column intentionally empty for now */}
        </div>

      </div>
    </div>
  );
};

export default LiveApyPage; 