import React from 'react';
import { Tooltip } from 'react-tooltip';
import type { MaturityBadgeProps } from './types';

const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturityDate,
  formattedMaturityDate,
  daysUntilMaturity
}) => {
  const tooltipId = `maturity-tooltip-${daysUntilMaturity}`;
  const maturityLabel = daysUntilMaturity === 0 ? 'Matured' : `${daysUntilMaturity}d`;

  return (
    <>
      <div 
        className="maturityBadge"
        data-tooltip-id={tooltipId}
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          cursor: 'help'
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px' }}>
          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        </svg>
        {maturityLabel}
      </div>

      <Tooltip 
        id={tooltipId}
        place="top"
        style={{
          backgroundColor: '#2D3748',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.5',
          maxWidth: '350px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '10px 14px',
          zIndex: 9999
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Maturity: {formattedMaturityDate}</div>
          <p style={{ margin: 0, textAlign: 'left' }}>
            The PT can be redeemed only with the YT before the maturity date, and after the maturity the PT can be redeemed alone.
          </p>
        </div>
      </Tooltip>
    </>
  );
};

export default MaturityBadge; 