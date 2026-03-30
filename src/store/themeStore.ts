import { create } from 'zustand';

interface ThemeState {
  currentTheme: string;
  darkMode: boolean;
  accentColor: string;
  glowIntensity: number;
  setTheme: (theme: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  setAccentColor: (color: string) => void;
  setGlowIntensity: (intensity: number) => void;
}

export const themePresets = {
  spring: {
    id: 'spring',
    name: '🌸 Spring Bloom',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a6c1ee 100%)',
    accent: '#ff6b9d',
    glow: 'rgba(255, 107, 157, 0.4)',
    emoji: '🌸',
  },
  summer: {
    id: 'summer',
    name: '☀️ Summer Vibes',
    gradient: 'linear-gradient(135deg, #f76b1c 0%, #fad961 50%, #74ebd5 100%)',
    accent: '#ff9a3c',
    glow: 'rgba(255, 154, 60, 0.4)',
    emoji: '☀️',
  },
  autumn: {
    id: 'autumn',
    name: '🍂 Autumn Leaves',
    gradient: 'linear-gradient(135deg, #ff5e62 0%, #ff9966 50%, #c94b4b 100%)',
    accent: '#ff6b35',
    glow: 'rgba(255, 107, 53, 0.4)',
    emoji: '🍂',
  },
  winter: {
    id: 'winter',
    name: '❄️ Winter Frost',
    gradient: 'linear-gradient(135deg, #4b6cb7 0%, #a6c1ee 50%, #fbc2eb 100%)',
    accent: '#89cff0',
    glow: 'rgba(137, 207, 240, 0.4)',
    emoji: '❄️',
  },
  galaxy: {
    id: 'galaxy',
    name: '🌌 Galaxy Dreams',
    gradient: 'linear-gradient(135deg, #1a0033 0%, #5a00cc 50%, #ff00ff 100%)',
    accent: '#ff00ff',
    glow: 'rgba(255, 0, 255, 0.4)',
    emoji: '🌌',
  },
  candy: {
    id: 'candy',
    name: '🍭 Cotton Candy',
    gradient: 'linear-gradient(135deg, #ff69b4 0%, #ffb6c1 50%, #87ceeb 100%)',
    accent: '#ff1493',
    glow: 'rgba(255, 20, 147, 0.4)',
    emoji: '🍭',
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'spring',
  darkMode: false,
  accentColor: themePresets.spring.accent,
  glowIntensity: 1,

  setTheme: (theme: string) => {
    set({ currentTheme: theme });
    document.documentElement.setAttribute('data-theme', theme);
    const preset = themePresets[theme as keyof typeof themePresets];
    if (preset) {
      document.documentElement.style.setProperty('--theme-primary', preset.gradient);
      document.documentElement.style.setProperty('--theme-accent', preset.accent);
      document.documentElement.style.setProperty('--theme-glow', preset.glow);
    }
  },

  setDarkMode: (darkMode: boolean) => {
    set({ darkMode });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setAccentColor: (color: string) => {
    set({ accentColor: color });
    document.documentElement.style.setProperty('--theme-accent', color);
  },

  setGlowIntensity: (intensity: number) => {
    set({ glowIntensity: intensity });
  },
}));
