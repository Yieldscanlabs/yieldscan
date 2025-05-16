import React from 'react';
import OptimizationModal from './OptimizationModal';
import { useOptimizationStore } from '../store/optimizationStore';

// This component will be mounted at the app level to ensure the modal persists
// regardless of component unmounting
const GlobalOptimizationModal: React.FC = () => {
  const { 
    isModalOpen, 
    currentAsset,
    currentProtocol,
    currentApy,
    betterProtocol,
    betterApy,
    additionalYearlyUsd,
    closeModal,
    completeOptimization
  } = useOptimizationStore();

  // Guard clause if there's no asset data
  if (!currentAsset) return null;

  return (
    <OptimizationModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onComplete={completeOptimization}
      asset={currentAsset}
      currentProtocol={currentProtocol}
      currentApy={currentApy}
      betterProtocol={betterProtocol}
      betterApy={betterApy}
      additionalYearlyUsd={additionalYearlyUsd}
    />
  );
};

export default GlobalOptimizationModal;