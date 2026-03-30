import React, { useEffect } from 'react';
import { useThemeStore, themePresets } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider Component
 * Loads user's theme preferences from Firestore and applies them
 * Should be placed at the root of your application
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { setTheme, setDarkMode } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadThemePreferences = async () => {
      if (!user) {
        // Apply default theme
        setTheme('spring');
        return;
      }

      try {
        // Load user's saved theme preferences
        const userData = await firestoreService.getUser(user.uid);
        if (userData?.theme) {
          setTheme(userData.theme);
        }
        if (userData?.darkMode !== undefined) {
          setDarkMode(userData.darkMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
        // Fall back to default theme
        setTheme('spring');
      }
    };

    loadThemePreferences();
  }, [user, setTheme, setDarkMode]);

  useEffect(() => {
    // Initialize CSS variables on mount
    const root = document.documentElement;
    const preset = themePresets.spring;
    
    if (!root.style.getPropertyValue('--theme-primary')) {
      root.style.setProperty('--theme-primary', preset.gradient);
      root.style.setProperty('--theme-accent', preset.accent);
      root.style.setProperty('--theme-glow', preset.glow);
    }
  }, []);

  return <>{children}</>;
};
