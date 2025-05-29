import React from 'react';
import styles from '../Header.module.css';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button 
      className={styles.hamburgerButton}
      onClick={onClick}
      aria-label="Toggle mobile menu"
    >
      <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineActive : ''}`}></span>
      <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineActive : ''}`}></span>
      <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineActive : ''}`}></span>
    </button>
  );
};

export default HamburgerButton; 