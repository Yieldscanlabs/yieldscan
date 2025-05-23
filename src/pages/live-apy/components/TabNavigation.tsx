import React from 'react';
import styles from '../styles/LiveApy.module.css';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabNavigation}>
      <button 
        className={`${styles.tabButton} ${activeTab === 'best-apy' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('best-apy')}
      >
        Best APY
      </button>
      <button 
        className={`${styles.tabButton} ${activeTab === 'trust-scores' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('trust-scores')}
      >
        Trust Scores
      </button>
    </div>
  );
};

export default TabNavigation; 