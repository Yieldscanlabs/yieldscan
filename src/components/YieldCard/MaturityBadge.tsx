import React, { useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import type { MaturityBadgeProps } from './types';

// Create a style object for the Tippy tooltip
const tippyStyles = {
  backgroundColor: '#2D3748',
  color: '#fff',
  borderRadius: '6px',
  fontSize: '12px',
  lineHeight: 1.5,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  padding: '10px 14px',
};

const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturityDate,
  formattedMaturityDate,
  daysUntilMaturity
}) => {
  const maturityLabel = daysUntilMaturity === 0 ? 'Matured' : `${daysUntilMaturity}d`;

  // Add custom styles once when component mounts
  useEffect(() => {
    const styleElement = document.getElementById('tippy-custom-styles');
    
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = 'tippy-custom-styles';
      style.innerHTML = `
        .tippy-box[data-theme='dark'] {
          background-color: #2D3748;
          color: #fff;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .tippy-box[data-theme='dark'] .tippy-content {
          padding: 10px 14px;
        }
        .tippy-box[data-theme='dark'] .tippy-arrow {
          color: #2D3748;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const tooltipContent = (
    <div style={tippyStyles}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Maturity: {formattedMaturityDate}</div>
      <p style={{ margin: 0, textAlign: 'left' }}>
        The PT can be redeemed only with the YT before the maturity date, and after the maturity the PT can be redeemed alone.
      </p>
    </div>
  );

  return (
    <Tippy
      content={tooltipContent}
      animation="shift-away"
      placement="top"
      arrow={true}
      duration={200}
      maxWidth={350}
      interactive={true}
      appendTo={document.body}
    >
      <div 
        className="maturityBadge"
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
    </Tippy>
  );
};

export default MaturityBadge; 