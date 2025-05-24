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
    </div>
  );
};

export default TrustScores; 