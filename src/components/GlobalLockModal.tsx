import React, { useEffect } from 'react';
import LockModal from './LockModal';
import { useLockStore } from '../store/lockStore';

// This component will be mounted at the app level to ensure the modal persists
// regardless of component unmounting
const GlobalLockModal: React.FC = () => {
  const { 
    isModalOpen, 
    asset,
    protocol,
    expirationDate,
    lockDetails,
    closeModal,
    completeLock
  } = useLockStore();

  // Guard clause if there's no asset data
  if (!asset || !lockDetails) return null;
  return (
    <LockModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onComplete={completeLock}
      asset={asset}
      protocol={protocol}
      expirationDate={expirationDate}
      lockDetails={lockDetails}
    />
  );
};

export default GlobalLockModal; 