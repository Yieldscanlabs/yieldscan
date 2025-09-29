import React, { useState } from 'react';
import styles from './ProtocolScoreCard.module.css';
import Protocol from './Protocol';
import { useAssetStore } from '../store/assetStore';
import useWalletConnection from '../hooks/useWalletConnection';
import WalletModal from './WalletModal';

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
    name: 'EigenLayer',
    trustScore: 95,
    liquidity: 11700 // $11.7B
  },
  {
    name: 'Morpho Blue',
    trustScore: 94,
    liquidity: 5200 // $5.2B
  },
  {
    name: 'Pendle',
    trustScore: 94,
    liquidity: 4584 // $4.58B
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
    name: 'Rocket Pool',
    trustScore: 89,
    liquidity: 1700 // $1.7B
  },
  {
    name: 'Fluid',
    trustScore: 85,
    liquidity: 1500 // $1.5B
  },
  {
    name: 'Radiant',
    trustScore: 60,
    liquidity: 245 // $245M
  },

  {
    name: 'Uniswap',
    trustScore: 96,
    liquidity: 5057
  },
  {
    name: 'Curve Finance',
    trustScore: 92,
    liquidity: 2275
  },
  {
    name: 'PancakeSwap',
    trustScore: 88,
    liquidity: 1837
  },
  {
    name: 'MakerDAO',
    trustScore: 94,
    liquidity: 10000
  },
  {
    name: 'Synthetix', trustScore: 90, liquidity: 1500
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
  const { assets } = useAssetStore();
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const [isHovered, setIsHovered] = useState(false);

  // Custom CTA component for protocol scoring
  const ProtocolScoreCTA = () => (
    <div className={styles.protocolScoreCta}>
      <div className={styles.ctaContent}>
        <div className={styles.ctaHeader}>
          <div className={styles.ctaIcon}>
            <div className={styles.scoreCircle}>
              <span className={styles.questionMark}>?</span>
            </div>
          </div>
          <div className={styles.ctaText}>
            <h3>Connect to see your risk score</h3>
            <p>Get personalized protocol exposure analysis</p>
          </div>
          <button
            className={styles.ctaButton}
            onClick={openConnectModal}
          >
            <span className={styles.buttonText}>Connect Wallet</span>
            <div className={styles.buttonIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Calculate protocol exposure percentages
  const calculateProtocolExposure = () => {
    const yieldBearingAssets = assets.filter(asset => asset.yieldBearingToken);
    const totalPortfolioValue = yieldBearingAssets.reduce((sum, asset) => sum + parseFloat(asset.balanceUsd), 0);

    if (totalPortfolioValue === 0) {
      return { exposures: {}, totalValue: 0, allProtocols: [] };
    }

    const protocolExposures: Record<string, number> = {};

    yieldBearingAssets.forEach(asset => {
      if (asset.protocol) {
        const protocolName = asset.protocol;
        const assetValue = parseFloat(asset.balanceUsd);
        const exposurePercentage = (assetValue / totalPortfolioValue) * 100;

        if (protocolExposures[protocolName]) {
          protocolExposures[protocolName] += exposurePercentage;
        } else {
          protocolExposures[protocolName] = exposurePercentage;
        }
      }
    });


    // Create a combined list of all protocols (predefined + user's protocols)
    const allProtocols = [...protocolScores];

    // Add any protocols the user has that aren't in our predefined list
    Object.keys(protocolExposures).forEach(protocolName => {
      if (!protocolScores.find(p => p.name === protocolName)) {
        allProtocols.push({
          name: protocolName,
          trustScore: 75, // Default score for unknown protocols
          liquidity: 0 // Unknown liquidity
        });
      }
    });

    return { exposures: protocolExposures, totalValue: totalPortfolioValue, allProtocols };
  };

  // Calculate total portfolio risk score
  const calculatePortfolioRiskScore = (exposures: Record<string, number>, allProtocols: ProtocolScore[]) => {
    let weightedScore = 0;
    let totalExposure = 0;

    Object.entries(exposures).forEach(([protocolName, exposure]) => {
      const protocolScore = allProtocols.find(p => p.name === protocolName);
      if (protocolScore) {
        weightedScore += (protocolScore.trustScore * exposure) / 100;
        totalExposure += exposure;
      }
    });

    return totalExposure > 0 ? Math.round(weightedScore) : 0;
  };

  const { exposures, totalValue, allProtocols } = calculateProtocolExposure();
  const portfolioRiskScore = calculatePortfolioRiskScore(exposures, allProtocols);

  // Determine trust score class for coloring
  const getTrustScoreClass = (score: number): string => {
    if (score >= 90) return styles.excellent;
    else if (score >= 80) return styles.good;
    else if (score >= 70) return styles.moderate;
    else return styles.caution;
  };

  // Sort protocols: those with exposure first, then by exposure amount, then by trust score
  const sortedProtocols = allProtocols.sort((a, b) => {
    const exposureA = exposures[a.name] || 0;
    const exposureB = exposures[b.name] || 0;

    if (exposureA > 0 && exposureB === 0) return -1;
    if (exposureA === 0 && exposureB > 0) return 1;
    if (exposureA > 0 && exposureB > 0) return exposureB - exposureA;
    return b.trustScore - a.trustScore;
  });
  console.log('exposures ', exposures)
  console.log('all ', allProtocols, sortedProtocols)
  return (
    <div className={styles.container}>
      {wallet.isConnected && totalValue > 0 && (
        <div className={styles.portfolioRiskHeader}>
          <h3>Portfolio Risk Score</h3>
          <div className={`${styles.portfolioRiskScore} ${getTrustScoreClass(portfolioRiskScore)}`}>
            {portfolioRiskScore}
          </div>
          <p className={styles.portfolioRiskDescription}>
            Weighted average based on your protocol exposure
          </p>
        </div>
      )}

      <div className={styles.scoreTable}>
        <div className={styles.tableHeader}>
          <div className={styles.protocolColumn}>Protocol</div>
          <div className={styles.scoreColumn}>Trust Score</div>
          <div className={styles.indicatorColumn}>Liquidity</div>
          <div className={styles.riskExposureColumn}>Risk Exposure %</div>
        </div>

        <div className={styles.tableBody}>
          {sortedProtocols.map((protocol) => {
            const exposure = exposures[protocol.name] || 0;
            return (
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
                    {protocol.liquidity > 0 ? formatLiquidity(protocol.liquidity) : 'N/A'}
                  </span>
                </div>
                <div className={styles.riskExposureColumn}>
                  <span className={styles.exposureValue}>
                    {wallet.isConnected && exposure > 0 ? `${exposure.toFixed(1)}%` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!wallet.isConnected && (
        <ProtocolScoreCTA />
      )}

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

      <WalletModal
        isOpen={isModalOpen}
        onClose={closeConnectModal}
      />
    </div>
  );
};

export default ProtocolScoreCard;