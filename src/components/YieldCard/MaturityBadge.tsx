import React from 'react';
import type { MaturityBadgeProps } from './types';
import './MaturityBadge.css';

const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturityDate,
  formattedMaturityDate,
  daysUntilMaturity
}) => {
  const maturityLabel = daysUntilMaturity === 0 ? 'Matured' : `${daysUntilMaturity}d`;

  return (
    <div className="maturityBadge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }}>
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      </svg>
      {maturityLabel}
      
      {/* CSS-only tooltip */}
      <div className="tooltip">
        <div className="tooltip-title">Maturity: {formattedMaturityDate}</div>
        <p className="tooltip-description">
          Before maturity, Principal Tokens (PT) can only be redeemed together with their corresponding Yield Tokens (YT). After the maturity date, PT can be redeemed on its own without needing the YT.
        </p>
      </div>
    </div>
  );
};

export default MaturityBadge; 