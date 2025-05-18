import React, { useState } from 'react';
import styles from './WalletCtaCard.module.css';
import WalletModal from './WalletModal';

interface WalletCtaCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onConnect?: () => void; // Make this optional since we'll handle opening the modal internally
}

const WalletCtaCard: React.FC<WalletCtaCardProps> = ({
  title = "Like what you see?",
  description = "Connect your wallet to earn these yields on your assets.",
  buttonText = "Connect Wallet",
  onConnect
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleButtonClick = () => {
    if (onConnect) {
      // If onConnect is provided, use it (for backward compatibility)
      onConnect();
    } else {
      // Otherwise, open our modal directly
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.walletCtaCard}>
        <div className={styles.walletCtaContent}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <button 
            onClick={handleButtonClick} 
            className={styles.connectButton}
          >
            {buttonText}
          </button>
        </div>
      </div>
      
      {/* Render the wallet modal */}
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default WalletCtaCard;