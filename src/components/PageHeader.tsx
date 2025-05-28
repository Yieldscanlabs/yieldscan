import React from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <div className={`${styles.pageHeader} ${className || ''}`}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <p className={styles.pageSubtitle}>{subtitle}</p>
    </div>
  );
};

export default PageHeader; 