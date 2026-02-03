import { useState, useEffect } from 'react';

export type ThemeOption = 'light' | 'dark';

// Helper function to get initial theme synchronously
function getInitialTheme(): ThemeOption {
  if (typeof window === 'undefined') return 'dark'; // SSR fallback

  const savedTheme = localStorage.getItem('theme');
  const savedThemeMode = localStorage.getItem('themeMode');

  if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
    return savedThemeMode;
  }

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  // Default
  return 'dark';
}

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(getInitialTheme);

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  };

  // Apply theme on mount
  useEffect(() => {
    applyTheme(activeTheme);
  }, []);

  const handleThemeChange = (theme: ThemeOption) => {
    setActiveTheme(theme);
    applyTheme(theme);
    localStorage.setItem('themeMode', theme);
    localStorage.setItem('theme', theme); // legacy support
  };

  return {
    activeTheme,
    handleThemeChange,
  };
}
