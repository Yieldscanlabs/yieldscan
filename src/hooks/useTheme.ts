import { useState, useEffect } from 'react';

export type ThemeOption = 'light' | 'dark' | 'system';

// Helper function to get initial theme synchronously
function getInitialTheme(): ThemeOption {
  if (typeof window === 'undefined') return 'dark'; // SSR fallback
  
  const savedTheme = localStorage.getItem('theme');
  const savedThemeMode = localStorage.getItem('themeMode');
  
  if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
    return savedThemeMode as ThemeOption;
  } else if (savedTheme) {
    // Legacy support - convert old theme setting
    return savedTheme === 'dark' ? 'dark' : 'light';
  } else {
    // Default to system
    return 'dark';
  }
}

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(getInitialTheme);

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

  // Apply the theme on mount (since we now initialize with the correct theme)
  useEffect(() => {
    applyTheme(activeTheme);
  }, []); // Only run once on mount

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

  return {
    activeTheme,
    handleThemeChange,
  };
} 