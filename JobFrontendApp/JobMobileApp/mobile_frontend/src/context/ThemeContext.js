import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme';

const STORAGE_KEY = 'theme_mode';

const ThemeContext = createContext({
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  // Restore the saved theme on launch.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') setMode(saved);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failure
    }
  };

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
