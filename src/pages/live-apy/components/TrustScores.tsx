import React from 'react';
import styles from '../styles/LiveApy.module.css';
import ProtocolScoreCard from '../../../components/ProtocolScoreCard';

interface TrustScoresProps {
  // Add any props needed
}

const TrustScores: React.FC<TrustScoresProps> = () => {
  return (
    <div className={styles.trustScoresContainer}>
      <ProtocolScoreCard />
      
      <div className={styles.infoCard}>
        <div className={styles.infoHeader}>
          <div className={styles.infoIcon}>🛡️</div>
          <h3>Understanding Trust Scores</h3>
        </div>
        <div className={styles.infoContent}>
          <p>
            Trust scores represent a comprehensive assessment of protocol security, 
            reliability, and risk factors. Each protocol is evaluated based on audits, 
            TVL history, code quality, and community trust.
          </p>
          <p>
            <strong>Higher scores</strong> indicate protocols with better security records
            and lower risk profiles. Always conduct your own research before using any DeFi protocol.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustScores; 