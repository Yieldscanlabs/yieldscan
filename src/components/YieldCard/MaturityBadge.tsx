import React, { useState } from 'react';
import type { MaturityBadgeProps } from './types';

const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturityDate,
  formattedMaturityDate,
  daysUntilMaturity
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const maturityLabel = daysUntilMaturity === 0 ? 'Matured' : `${daysUntilMaturity}d`;

  return (
    <div 
      className="maturityBadge"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: 'relative',
        marginLeft: '8px',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 600,
        backgroundColor: 'rgba(79, 209, 197, 0.15)',
        color: '#4FD1C5',
        border: '1px solid rgba(79, 209, 197, 0.3)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }}>
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      </svg>
      {maturityLabel}
      {showTooltip && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: '0',
            backgroundColor: '#2D3748',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            maxWidth: '350px',
            zIndex: 10,
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            lineHeight: '1.5',
            whiteSpace: 'normal'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Maturity: {formattedMaturityDate}</div>
          <p style={{ margin: 0 }}>
            The PT can be redeemed only with the YT before the maturity date, and after the maturity the PT can be redeemed alone.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaturityBadge; 