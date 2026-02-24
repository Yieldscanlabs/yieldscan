import React from 'react';
import styles from './InfoIcon.module.css';

interface InfoIconProps {
    size?: number;
    tooltipText: string;
    tooltipTitle?: string;
    className?: string;
    position?: 'top' | 'bottom'; 
}

const InfoIcon: React.FC<InfoIconProps> = ({ size = 12, tooltipText, tooltipTitle, className='', position = 'top' }) => {
  
    const tooltipClass = position === 'bottom' ? styles.infoTooltipDown : styles.infoTooltip;
  const wrapperClass = position === 'bottom' 
    ? `${styles.infoTooltipWrapper} ${styles.infoTooltipWrapperDown} ${className}`
    : `${styles.infoTooltipWrapper} ${className}`;

    return (
        <span className={wrapperClass}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.infoIcon}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className={tooltipClass}>
            {tooltipTitle && <strong>{tooltipTitle}</strong>}
            {tooltipText}
          </span>
        </span>
      );
};

export default InfoIcon;