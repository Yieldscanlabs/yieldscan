import React from 'react';
import LockAPYInformationModal from './LockAPYInformationModal';
import { useLockAPYInformationStore } from '../store/lockApyInformationStore';

// This component will be mounted at the app level to ensure the modal persists
// regardless of component unmounting and renders with proper z-index
const GlobalLockAPYInformationModal: React.FC = () => {
  const { 
    isLockAPYInformationModalOpen,
    currentAsset,
    protocol,
    expirationDate,
    currentAPY,
    amountToLock,
    closeLockAPYInformationModal,
    confirmLockAPY
  } = useLockAPYInformationStore();

  // Guard clause if there's no asset or protocol data
  if (!currentAsset || !protocol) return null;

  return (
    <LockAPYInformationModal
      isOpen={isLockAPYInformationModalOpen}
      onClose={closeLockAPYInformationModal}
      onConfirm={confirmLockAPY}
      asset={currentAsset}
      protocol={protocol}
      expirationDate={expirationDate}
      currentAPY={currentAPY}
      amountToLock={amountToLock}
    />
  );
};

export default GlobalLockAPYInformationModal; 