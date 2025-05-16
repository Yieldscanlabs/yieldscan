import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';
import bear from '../assets/bear.png';

interface LogoProps {
  linkTo?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  linkTo = '/', 
  className = '' 
}) => {
  const LogoContent = () => (
    <div className={`${styles.logoContainer} ${className}`}>
      <img src={bear} alt="YieldScan logo" className={styles.logoImage} />
      <h1 className={styles.title}>YIELD<span>SCAN</span></h1>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={styles.logoLink}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;