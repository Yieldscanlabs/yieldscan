import React from 'react';
import { useDepositsAndWithdrawalsStore } from '../../store/depositsAndWithdrawalsStore';

const ScanProgressBar: React.FC = () => {
  const { isScanning, progress, scanStatus } = useDepositsAndWithdrawalsStore();

  if (!isScanning) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, // 🟢 Move to Bottom
      left: 0,
      width: '100%',
      zIndex: 9999,
      background: '#1a1b1e',
      borderTop: '1px solid #333', // 🟢 Border on top now
      padding: '8px 0', // Slightly more padding for bottom bar
      boxShadow: '0 -4px 10px rgba(0,0,0,0.3)' // Add shadow pointing up
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ 
          fontSize: '13px', 
          color: '#9ca3af', 
          fontFamily: 'monospace',
          minWidth: '280px', // More space for the text
          textAlign: 'left',
          fontWeight: 500
        }}>
          {scanStatus}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{
            height: '6px', // Slightly thicker
            background: '#333',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: '#3b82f6', // You can change this color if you want
              width: `${progress}%`,
              transition: 'width 0.3s ease-out'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanProgressBar;