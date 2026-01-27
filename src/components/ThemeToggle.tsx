import React from 'react';
import styles from './ThemeToggle.module.css';
import { useTheme } from '../hooks/useTheme';

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
          onClick={(e) => {
            e.stopPropagation();
            handleThemeChange('light');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`${styles.segment} ${activeTheme === 'light' ? styles.active : ''}`}
          aria-label="Light theme"
        >
          Light
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleThemeChange('dark');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`${styles.segment} ${activeTheme === 'dark' ? styles.active : ''}`}
          aria-label="Dark theme"
        >
          Dark
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
