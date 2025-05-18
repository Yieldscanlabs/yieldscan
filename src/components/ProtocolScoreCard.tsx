import React from 'react';
import styles from './ProtocolScoreCard.module.css';
import { PROTOCOL_NAMES } from '../utils/constants';
import Protocol from './Protocol';

interface ProtocolScore {
  name: string;
  trustScore: number;
  liquidity: number;
}

const protocolScores: ProtocolScore[] = [
  { 
    name: 'Aave', 
    trustScore: 95, 
    liquidity: 95
  },
    { 
    name: 'Venus', 
    trustScore: 90, 
    liquidity: 85
  },
  { 
    name: 'Compound', 
    trustScore: 85, 
    liquidity: 75
  }
];

const ProtocolScoreCard: React.FC = () => {
  const renderScoreBar = (score: number) => {
    let colorClass = '';
    if (score >= 90) colorClass = styles.excellent;
    else if (score >= 80) colorClass = styles.good;
    else if (score >= 70) colorClass = styles.moderate;
    else colorClass = styles.caution;

    return (
      <div className={styles.scoreBarContainer}>
        <div 
          className={`${styles.scoreBar} ${colorClass}`} 
          style={{ width: `${score}%` }}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
  
      
      <div className={styles.scoreTable}>
        <div className={styles.tableHeader}>
          <div className={styles.protocolColumn}>Protocol</div>
          <div className={styles.scoreColumn}>Trust Score</div>
          <div className={styles.indicatorColumn}>Liquidity</div>
        </div>
        
        <div className={styles.tableBody}>
          {protocolScores.map((protocol) => (
            <div key={protocol.name} className={styles.tableRow}>
              <div className={styles.protocolColumn}>
                <div className={styles.protocolName}><Protocol name={protocol.name} showLogo={true}  /> </div>
              </div>
              <div className={styles.scoreColumn}>
                <div className={styles.trustScore}>
                  <span className={styles.scoreValue}>{protocol.trustScore}</span>
                  {renderScoreBar(protocol.trustScore)}
                </div>
              </div>
              <div className={styles.indicatorColumn}>
                {renderScoreBar(protocol.liquidity)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.infoFooter}>
        <p>
          <span className={styles.infoIcon}>ℹ️</span>
          Yieldscan ranks protocols based on liquidity, volume, and security.
        </p>
      </div>
    </div>
  );
};

export default ProtocolScoreCard;