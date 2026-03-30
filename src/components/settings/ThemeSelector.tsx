import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX, Palette } from 'lucide-react';
import { useThemeStore, themePresets } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, darkMode, setTheme, setDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(50);

  const handleThemeChange = async (themeId: string) => {
    setTheme(themeId);
    if (user) {
      try {
        await firestoreService.updateUser(user.uid, { theme: themeId });
        toast.success(`Theme changed to ${themeId}`);
      } catch (error) {
        toast.error('Failed to save theme preference');
      }
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    setDarkMode(enabled);
    if (user) {
      try {
        await firestoreService.updateUser(user.uid, { darkMode: enabled });
        toast.success(enabled ? 'Dark mode enabled' : 'Dark mode disabled');
      } catch (error) {
        toast.error('Failed to save dark mode preference');
      }
    }
  };

  const themes = Object.values(themePresets);

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Themes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                glass-panel p-4 text-center rounded-lg transition-all
                ${currentTheme === theme.id ? 'ring-2 ring-[var(--theme-accent)]' : ''}
                hover:border-[var(--theme-accent)]
              `}
            >
              {/* Emoji */}
              <div className="text-4xl mb-3">{theme.emoji}</div>

              {/* Name */}
              <p className="font-semibold text-lg mb-1">{theme.name}</p>

              {/* Color preview */}
              <div className="flex gap-2 mb-3 justify-center">
                {theme.gradient.includes('linear-gradient') && (
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{
                      background: theme.gradient.split('to ')[1]?.split('(')[1]?.split(',')[0] || theme.accent,
                    }}
                  />
                )}
              </div>

              {/* Active indicator */}
              {currentTheme === theme.id && (
                <div className="text-xs font-semibold text-[var(--theme-accent)]">✓ Active</div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <div>
              <h4 className="font-semibold">Dark Mode</h4>
              <p className="text-sm text-white/60">
                {darkMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <Button
            variant={darkMode ? 'primary' : 'secondary'}
            onClick={() => handleDarkModeToggle(!darkMode)}
          >
            {darkMode ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
            <div>
              <h4 className="font-semibold">Sound Effects</h4>
              <p className="text-sm text-white/60">
                {soundEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <Button
            variant={soundEnabled ? 'primary' : 'secondary'}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? 'On' : 'Off'}
          </Button>
        </div>

        {soundEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <label className="block text-sm font-medium mb-3">
              Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
            />
          </motion.div>
        )}
      </div>

      {/* Theme Info */}
      <div className="glass-card p-4 bg-white/5">
        <p className="text-sm text-white/70">
          💡 <strong>Tip:</strong> Your theme choice is saved and will be applied when you log back in.
        </p>
      </div>
    </div>
  );
};
