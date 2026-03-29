import { create } from 'zustand';

interface ThemeState {
  currentTheme: string;
  darkMode: boolean;
  setTheme: (theme: string) => void;
  setDarkMode: (darkMode: boolean) => void;
}

const themes = {
  spring: {
    primary: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    accent: '#ff6b9d',
    particles: '🌸',
  },
  summer: {
    primary: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)',
    accent: '#ff9a3c',
    particles: '☀️',
  },
  autumn: {
    primary: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    accent: '#ff6b35',
    particles: '🍂',
  },
  winter: {
    primary: 'linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)',
    accent: '#89cff0',
    particles: '❄️',
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'spring',
  darkMode: false,
  setTheme: (theme) => {
    set({ currentTheme: theme });
    document.documentElement.setAttribute('data-theme', theme);
    const themeColors = themes[theme as keyof typeof themes];
    if (themeColors) {
      document.documentElement.style.setProperty('--bg-primary', themeColors.primary);
      document.documentElement.style.setProperty('--accent', themeColors.accent);
    }
  },
  setDarkMode: (darkMode) => {
    set({ darkMode });
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
