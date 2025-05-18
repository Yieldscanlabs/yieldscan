import React from 'react';
import styles from './Protocol.module.css';
import aave from '../assets/protocols/aave.png'
import venus from '../assets/protocols/venus.svg'
import compound from '../assets/protocols/compound.svg'
interface ProtocolProps {
  name: string | null;
  showLogo?: boolean;
  showName?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const PROTOCOL_LOGOS: Record<string, string> = {
  'Aave': aave,
  'Compound': compound,
  'Venus': venus,
  'Curve': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
  'Yearn': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
  'Lido': 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png',
  // Add more protocols as needed
};

const Protocol: React.FC<ProtocolProps> = ({ 
  name, 
  showLogo = true, 
  showName = true,
  className = '',
  size = 'medium'
}) => {
  const logoUrl = name ? PROTOCOL_LOGOS[name] || null : null;
  
  return (
    <div className={`${styles.protocol} ${styles[size]} ${className} ${styles[name?.toLowerCase() || '']}`}>
      {showLogo && logoUrl && (
        <img 
          src={logoUrl} 
          alt={`${name} logo`} 
          className={styles.protocolLogo} 
        />
      )}
      <span className={styles.protocolName}>{showName ? name : ''}</span>
    </div>
  );
};

export default Protocol;