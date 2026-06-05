import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [appAppearance, setAppAppearance] = useState(() => localStorage.getItem('appAppearance') || 'modern');
  const [motionEnabled, setMotionEnabled] = useState(() => {
    const stored = localStorage.getItem('motionEnabled');
    return stored ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('appAppearance', appAppearance);
    const root = document.documentElement;
    root.classList.remove('theme-glass', 'theme-classic', 'theme-modern', 'theme-3d');
    root.classList.add(`theme-${appAppearance}`);
  }, [appAppearance]);

  useEffect(() => {
    localStorage.setItem('motionEnabled', String(motionEnabled));
    document.documentElement.classList.toggle('reduce-motion', !motionEnabled);
  }, [motionEnabled]);

  const value = {
    themeMode,
    setThemeMode,
    appAppearance,
    setAppAppearance,
    motionEnabled,
    setMotionEnabled,
    availableAppearances: ['modern', 'glass', 'classic', '3d']
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
