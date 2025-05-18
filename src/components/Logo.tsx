import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';
import owl from '../assets/owl.png';

interface LogoProps {
  linkTo?: string;
  className?: string;
  slogan?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  linkTo = '/', 
  className = '',
  slogan = false
}) => {
  const LogoContent = () => (
    <div className={`${styles.logoContent}  ${className}` }>
    <div className={`${styles.logoContainer}`}>
      <img src={owl} alt="YieldScan logo" className={styles.logoImage} />
      <h1 className={styles.title}>YIELD<span>SCAN</span></h1>
 
    </div>
         {
        slogan ?
        <p className={styles.slogan}>Earn like a billionaire</p>
        : ''
      }
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