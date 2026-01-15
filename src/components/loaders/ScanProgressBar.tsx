import React from 'react';
import { useDepositsAndWithdrawalsStore } from '../../store/depositsAndWithdrawalsStore';

const ScanProgressBar: React.FC = () => {
  const { isScanning, progress, scanStatus } = useDepositsAndWithdrawalsStore();

  if (!isScanning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999,
      background: '#1a1b1e',
      borderBottom: '1px solid #333',
      padding: '4px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            height: '4px',
            background: '#333',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: '#3b82f6',
              width: `${progress}%`,
              transition: 'width 0.3s ease-out'
            }} />
          </div>
        </div>
        <span style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          fontFamily: 'monospace',
          minWidth: '200px',
          textAlign: 'right'
        }}>
          {scanStatus}
        </span>
      </div>
    </div>
  );
};

export default ScanProgressBar;