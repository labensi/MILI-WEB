import { useThemeStore, themePresets } from '../store/themeStore';

/**
 * useTheme Hook
 * Provides easy access to theme functions and data
 * Usage:
 *   const { currentTheme, themes, setTheme, getThemeData } = useTheme();
 */
export const useTheme = () => {
  const { currentTheme, darkMode, accentColor, glowIntensity, setTheme, setDarkMode, setAccentColor, setGlowIntensity } = useThemeStore();

  return {
    currentTheme,
    darkMode,
    accentColor,
    glowIntensity,
    setTheme,
    setDarkMode,
    setAccentColor,
    setGlowIntensity,
    themes: Object.values(themePresets),
    getThemeData: (themeId?: string) => {
      const id = themeId || currentTheme;
      return themePresets[id as keyof typeof themePresets];
    },
    isThemeActive: (themeId: string) => currentTheme === themeId,
  };
};

/**
 * Theme Utilities
 */
export const themeUtils = {
  /**
   * Get all available themes
   */
  getThemes: () => Object.values(themePresets),

  /**
   * Get theme by ID
   */
  getTheme: (themeId: string) => themePresets[themeId as keyof typeof themePresets],

  /**
   * Get theme names for display
   */
  getThemeNames: () =>
    Object.values(themePresets).map((theme) => ({
      id: theme.id,
      name: theme.name,
      emoji: theme.emoji,
    })),

  /**
   * Get random theme
   */
  getRandomTheme: () => {
    const themes = Object.values(themePresets);
    return themes[Math.floor(Math.random() * themes.length)];
  },

  /**
   * Get theme by emoji
   */
  getThemeByEmoji: (emoji: string) => {
    return Object.values(themePresets).find((theme) => theme.emoji === emoji);
  },

  /**
   * Check if theme exists
   */
  themeExists: (themeId: string): boolean => {
    return themeId in themePresets;
  },

  /**
   * Get all theme colors
   */
  getThemeColors: (themeId: string) => {
    const theme = themePresets[themeId as keyof typeof themePresets];
    if (!theme) return null;
    return {
      gradient: theme.gradient,
      accent: theme.accent,
      glow: theme.glow,
    };
  },

  /**
   * Convert theme accent color to RGB
   */
  accentToRgb: (accent: string): { r: number; g: number; b: number } | null => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = accent;
    const computed = ctx.fillStyle;
    const rgb = computed.match(/\d+/g);
    if (!rgb || rgb.length < 3) return null;
    return {
      r: parseInt(rgb[0]),
      g: parseInt(rgb[1]),
      b: parseInt(rgb[2]),
    };
  },

  /**
   * Get contrasting text color for a background
   */
  getContrastColor: (bgColor: string): string => {
    const rgb = themeUtils.accentToRgb(bgColor);
    if (!rgb) return '#ffffff';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },
};
