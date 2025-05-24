import React from 'react';
import styles from './ProtocolScoreCard.module.css';
import Protocol from './Protocol';

interface ProtocolScore {
  name: string;
  trustScore: number;
  liquidity: number; // Now in millions/billions
}

export const protocolScores: ProtocolScore[] = [
  { 
    name: 'Aave', 
    trustScore: 98,
    liquidity: 40000 // $5.4B
  },
  { 
    name: 'Lido', 
    trustScore: 95, 
    liquidity: 18700 // $18.7B
  },
  { 
    name: 'Morpho Blue', 
    trustScore: 94, 
    liquidity: 5200 // $5.2B
  },
  { 
    name: 'Spark', 
    trustScore: 94, 
    liquidity: 3200 // $3.2B
  },
  { 
    name: 'Compound', 
    trustScore: 91, 
    liquidity: 2488 // $2.3B
  },
  { 
    name: 'Venus', 
    trustScore: 90, 
    liquidity: 2313 // $850M
  },
  { 
    name: 'Radiant', 
    trustScore: 60, 
    liquidity: 245 // $245M
  }
];

// Format liquidity with appropriate suffix
const formatLiquidity = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  } else {
    return `$${value}M`;
  }
};

const ProtocolScoreCard: React.FC = () => {
  // Determine trust score class for coloring
  const getTrustScoreClass = (score: number): string => {
    if (score >= 90) return styles.excellent;
    else if (score >= 80) return styles.good;
    else if (score >= 70) return styles.moderate;
    else return styles.caution;
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
                <div className={styles.protocolName}><Protocol name={protocol.name} showLogo={true} /></div>
              </div>
              <div className={styles.scoreColumn}>
                <span className={`${styles.trustScoreValue} ${getTrustScoreClass(protocol.trustScore)}`}>
                  {protocol.trustScore}
                </span>
              </div>
              <div className={styles.indicatorColumn}>
                <span className={styles.liquidityValue}>
                  {formatLiquidity(protocol.liquidity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.infoFooter}>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={`${styles.scoreIndicator} ${styles.excellent}`}>90+</div>
            <span>Excellent</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.scoreIndicator} ${styles.good}`}>80+</div>
            <span>Good</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.scoreIndicator} ${styles.moderate}`}>70+</div>
            <span>Moderate</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.scoreIndicator} ${styles.caution}`}>&lt;70</div>
            <span>Caution</span>
          </div>
        </div>
        <p>
          <span className={styles.infoIcon}>ℹ️</span>
          Yieldscan ranks protocols based on TVL, historical performance, and smart contract risk.
        </p>
      </div>
    </div>
  );
};

export default ProtocolScoreCard;