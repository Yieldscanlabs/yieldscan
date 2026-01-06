import React from 'react';
import ManualWalletModal from './ManualWalletModal';
import { useManualWalletStore } from '../store/manualWalletStore';

const GlobalManualWalletModal: React.FC = () => {
  const { isManualModalOpen, closeManualModal } = useManualWalletStore();

  return (
    <ManualWalletModal
      isOpen={isManualModalOpen}
      onClose={closeManualModal}
    />
  );
};

export default GlobalManualWalletModal;


