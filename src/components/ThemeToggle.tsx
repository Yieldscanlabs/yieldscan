import React from 'react';
import styles from './ThemeToggle.module.css';
import { useTheme, type ThemeOption } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { activeTheme, handleThemeChange } = useTheme();

  return (
    <div className={`${styles.themeSelector} ${className}`}>
      <div className={styles.themeSelectorLabel}>Theme</div>
      <div className={styles.segmentedControl}>
        <button
          onClick={() => handleThemeChange('light')}
          className={`${styles.segment} ${activeTheme === 'light' ? styles.active : ''}`}
          aria-label="Light theme"
        >
          Light
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className={`${styles.segment} ${activeTheme === 'dark' ? styles.active : ''}`}
          aria-label="Dark theme"
        >
          Dark
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          className={`${styles.segment} ${activeTheme === 'system' ? styles.active : ''}`}
          aria-label="System theme"
        >
          System
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle; 