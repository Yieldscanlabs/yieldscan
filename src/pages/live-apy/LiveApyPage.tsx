import React, { useState, useEffect } from 'react';
import { useApyStore } from '../../store/apyStore';
import styles from './styles/LiveApy.module.css';
import useWalletConnection from '../../hooks/useWalletConnection';
import WalletCtaCard from '../../components/WalletCtaCard';
import TabNavigation from './components/TabNavigation';
import ApyTable from './components/ApyTable';
import TrustScores from './components/TrustScores';
import PageHeader from '../../components/PageHeader';

const LiveApyPage: React.FC = () => {
  const { apyData, isLoading, error, fetchApys } = useApyStore();
  const { wallet } = useWalletConnection();
  const [activeTab, setActiveTab] = useState<string>('best-apy');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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