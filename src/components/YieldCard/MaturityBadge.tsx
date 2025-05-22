import React, { useState, useRef } from 'react';
import type { MaturityBadgeProps } from './types';
import {
  useFloating,
  useInteractions,
  useHover,
  FloatingPortal,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  useTransitionStyles
} from '@floating-ui/react';

const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturityDate,
  formattedMaturityDate,
  daysUntilMaturity
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);
  const maturityLabel = daysUntilMaturity === 0 ? 'Matured' : `${daysUntilMaturity}d`;

  // Set up floating-ui
  const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(8),
      flip(),
      shift(),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate
  });

  // Set up hover interactions
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  // Animation styles for the tooltip
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)'
    },
    open: {
      opacity: 1,
      transform: 'scale(1)'
    },
    close: {
      opacity: 0,
      transform: 'scale(0.8)'
    }
  });

  // Calculate arrow position
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]];

  const arrowStyles = middlewareData.arrow
    ? {
        left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : '',
        top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : '',
        right: '',
        bottom: '',
        [staticSide as string]: '-4px',
      }
    : {};

  return (
    <>
      <div 
        ref={refs.setReference}
        {...getReferenceProps()}
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

      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              ...transitionStyles,
              maxWidth: '350px',
              zIndex: 1000,
            }}
            {...getFloatingProps()}
          >
            <div
              style={{
                backgroundColor: '#2D3748',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                lineHeight: '1.5',
                position: 'relative'
              }}
            >
              <div
                ref={arrowRef}
                style={{
                  position: 'absolute',
                  background: '#2D3748',
                  width: '8px',
                  height: '8px',
                  transform: 'rotate(45deg)',
                  ...arrowStyles,
                }}
              />
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Maturity: {formattedMaturityDate}</div>
              <p style={{ margin: 0 }}>
                The PT can be redeemed only with the YT before the maturity date, and after the maturity the PT can be redeemed alone.
              </p>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default MaturityBadge; 