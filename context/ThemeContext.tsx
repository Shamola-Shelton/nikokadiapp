import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  card: {
    front: string;
    back: string;
  };
  suits: {
    hearts: string;
    diamonds: string;
    clubs: string;
    spades: string;
  };
}

interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#6366F1',      // Indigo
  secondary: '#8B5CF6',    // Purple
  background: '#F8FAFC',   // Light gray
  surface: '#FFFFFF',     // White
  text: '#1E293B',        // Dark gray
  textSecondary: '#64748B', // Medium gray
  border: '#E2E8F0',      // Light border
  error: '#EF4444',       // Red
  warning: '#F59E0B',     // Amber
  success: '#10B981',     // Green
  card: {
    front: '#FFFFFF',
    back: '#1E293B',
  },
  suits: {
    hearts: '#DC2626',    // Red
    diamonds: '#DC2626',  // Red
    clubs: '#1E293B',     // Black
    spades: '#1E293B',    // Black
  },
};

const darkColors: ThemeColors = {
  primary: '#818CF8',      // Light indigo
  secondary: '#A78BFA',     // Light purple
  background: '#0F172A',    // Dark blue
  surface: '#1E293B',      // Darker surface
  text: '#F1F5F9',         // Light text
  textSecondary: '#94A3B8', // Medium light text
  border: '#334155',       // Dark border
  error: '#F87171',        // Light red
  warning: '#FBBF24',      // Light amber
  success: '#34D399',      // Light green
  card: {
    front: '#1E293B',
    back: '#F1F5F9',
  },
  suits: {
    hearts: '#F87171',     // Light red
    diamonds: '#F87171',   // Light red
    clubs: '#F1F5F9',      // Light
    spades: '#F1F5F9',     // Light
  },
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const theme: Theme = {
    colors,
    isDark: colorScheme === 'dark',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
