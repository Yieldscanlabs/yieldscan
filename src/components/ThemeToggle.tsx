import React, { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

type ThemeOption = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('dark');

  // Check for saved theme preference or default to system
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedThemeMode = localStorage.getItem('themeMode');
    
    if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
      setActiveTheme(savedThemeMode as ThemeOption);
      applyTheme(savedThemeMode as ThemeOption);
    } else if (savedTheme) {
      // Legacy support - convert old theme setting
      const themeMode = savedTheme === 'dark' ? 'dark' : 'light';
      setActiveTheme(themeMode);
      applyTheme(themeMode);
    } else {
      // Default to system
      setActiveTheme('system');
      applyTheme('system');
    }
  }, []);

  const applyTheme = (themeMode: ThemeOption) => {
    const root = document.documentElement;
    
    if (themeMode === 'system') {
      // Follow system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
    } else if (themeMode === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  };

  const handleThemeChange = (themeMode: ThemeOption) => {
    setActiveTheme(themeMode);
    applyTheme(themeMode);
    localStorage.setItem('themeMode', themeMode);
    // Keep legacy localStorage for backwards compatibility
    if (themeMode === 'system') {
      localStorage.setItem('theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      localStorage.setItem('theme', themeMode);
    }
  };

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (activeTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [activeTheme]);

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