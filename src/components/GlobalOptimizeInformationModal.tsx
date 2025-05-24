import React from 'react';
import OptimizeInformationModal from './OptimizeInformationModal';
import { useOptimizeInformationStore } from '../store/optimizeInformationStore';

// This component will be mounted at the app level to ensure the modal persists
// regardless of component unmounting and renders with proper z-index
const GlobalOptimizeInformationModal: React.FC = () => {
  const { 
    isInformationModalOpen,
    currentAsset,
    optimizationData,
    closeInformationModal,
    confirmOptimization
  } = useOptimizeInformationStore();

  // Guard clause if there's no asset or optimization data
  if (!currentAsset || !optimizationData) return null;

  return (
    <OptimizeInformationModal
      isOpen={isInformationModalOpen}
      onClose={closeInformationModal}
      onConfirm={confirmOptimization}
      asset={currentAsset}
      optimizationData={optimizationData}
    />
  );
};

export default GlobalOptimizeInformationModal; 