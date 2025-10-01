import React from 'react';
import styles from './Protocol.module.css';
import aave from '../assets/protocols/aave.png'
import radiant from '../assets/protocols/radiant.png'
import venus from '../assets/protocols/venus.svg'
import morphoblue from '../assets/protocols/morphoblue.svg'
import compound from '../assets/protocols/compound.svg'
import lido from '../assets/protocols/lido.svg'
import spark from '../assets/protocols/spark.png'
import pendle from '../assets/protocols/pendle.svg'
import fluid from '../assets/protocols/fluid.png'
import rocketpool from '../assets/protocols/rocketpool.webp'
import eigenlayer from '../assets/protocols/eigenlayer.svg'
import uniswap from '../assets/protocols/uniswap.png'
import curvefinance from '../assets/protocols/curvefinance.png'
import synthetix from '../assets/protocols/synthetix.png'
import pancake from '../assets/protocols/pancake.png'
import markerdao from '../assets/protocols/marker_dao.png'
import dolomite from '../assets/protocols/dolomite.jpg'
import euler from '../assets/protocols/euler.jpg'
import fluxFinance from '../assets/protocols/fluxFinance.jpg'
import sparklend from '../assets/protocols/sparklend.jpg'
import zerolend from '../assets/protocols/zerolend.jpg'
import ethena from '../assets/protocols/ethena.jpg'
import creamFinance from '../assets/protocols/creamFinance.jpg'
import maple from '../assets/protocols/maple.jpg'
import kinza_finance from '../assets/protocols/kinza_finance.jpg'

interface ProtocolProps {
  name: string | null;
  showLogo?: boolean;
  showName?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean; // Prop to control tooltip visibility
}

const PROTOCOL_LOGOS: Record<string, string> = {
  'Aave': aave,
  'Compound': compound,
  'Venus': venus,
  'Morpho Blue': morphoblue,
  'Radiant': radiant,
  'Curve': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
  'Yearn': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
  'Lido': lido,
  'Spark': spark,
  'Pendle': pendle,
  'Fluid': fluid,
  'Rocket Pool': rocketpool,
  'EigenLayer': eigenlayer,
  'Uniswap': uniswap,
  'Curve Finance': curvefinance,
  'PancakeSwap': pancake,
  'Synthetix': synthetix,
  'MakerDAO': markerdao,
  'Dolomite': dolomite,
  'Euler': euler,
  'fluxfinance': fluxFinance,
  'Sparklend': sparklend,
  'Zerolend': zerolend,
  'kinzafinance': kinza_finance,
  'Ethena': ethena,
  'creamfinance': creamFinance,
  'Maple': maple,
  // Add more protocols as needed
};

// Tooltip content for each protocol
const PROTOCOL_TOOLTIPS: Record<string, string> = {
  'Aave': 'Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers.',
  'Compound': 'Compound is an algorithmic, autonomous interest rate protocol built for developers, to unlock a universe of open financial applications.',
  'Venus': 'Venus is a synthetic stablecoin-powered decentralized money market system that enables users to utilize their cryptocurrencies by supplying collateral.',
  'Radiant': 'Radiant is an L2-native DeFi protocol that enables cross-chain lending and borrowing with omnichain yield and liquidity.',
  'Curve': 'Curve is an exchange liquidity pool designed for efficient stablecoin trading.',
  'Yearn': 'Yearn Finance is a suite of products providing lending aggregation, yield generation, and insurance on the Ethereum blockchain.',
  'Lido': 'Lido is a liquid staking solution for Ethereum and other PoS blockchains that lets users stake their assets while maintaining liquidity.',
  // Add more protocol descriptions as needed
};

const Protocol: React.FC<ProtocolProps> = ({
  name,
  showLogo = true,
  showName = true,
  className = '',
  size = 'medium',
  showTooltip = false
}) => {
  const logoUrl = name ? PROTOCOL_LOGOS[name] || null : null;
  const tooltipText = name ? PROTOCOL_TOOLTIPS[name] || `Information about ${name}` : null;
  const tooltipId = name ? `protocol-tooltip-${name.toLowerCase()}` : 'protocol-tooltip';
  const formatProtocolName = (name: string) => {
    console.log('name name', name)
    switch (name) {
      case 'fluxfinance':
        return 'Flux Finance';
      case 'kinzafinance':
        return 'Kinza Finance';
      case 'creamfinance':
        return 'Cream Finance';
      default:
        return name;
    }
  };

  return (
    <>
      <div
        className={`${styles.protocol} ${styles[size]} ${className} ${styles[name?.toLowerCase() || '']}`}
        data-tooltip-id={showTooltip ? tooltipId : undefined}
        data-tooltip-content={tooltipText || ''}
      >
        {showLogo && logoUrl && (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className={styles.protocolLogo}
            referrerPolicy="no-referrer"
          />
        )}
        <span className={styles.protocolName}>
          {showName ? formatProtocolName(name || '') : ''}
        </span>

        {/* <span className={styles.protocolName}>{showName ? name : ''}</span> */}
      </div>

    </>
  );
};

export default Protocol;