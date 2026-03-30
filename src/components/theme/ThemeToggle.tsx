import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';
import { useThemeStore, themePresets } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import toast from 'react-hot-toast';

/**
 * ThemeToggle Component
 * Quick dropdown menu for switching themes
 * Ideal for sidebar/topbar integration
 */
export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();
  const { user } = useAuthStore();

  const handleThemeChange = async (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);

    if (user) {
      try {
        await firestoreService.updateUser(user.uid, { theme: themeId });
      } catch (error) {
        toast.error('Failed to save theme preference');
      }
    }
  };

  const currentThemeData = themePresets[currentTheme as keyof typeof themePresets];
  const themes = Object.values(themePresets);

  if (compact) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Change theme"
        >
          <div className="text-xl">{currentThemeData?.emoji}</div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute right-0 mt-2 w-48 z-dropdown"
              onClick={() => setIsOpen(false)}
            >
              <GlassCard className="p-2">
                <div className="space-y-1">
                  {themes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-left text-sm
                        flex items-center gap-2 transition-all
                        ${
                          currentTheme === theme.id
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-lg">{theme.emoji}</span>
                      <span className="flex-1 truncate">{theme.name}</span>
                      {currentTheme === theme.id && (
                        <span className="text-xs font-semibold">✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default full-sized version
  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5" />
          <div className="text-left">
            <p className="text-sm text-white/60">Current Theme</p>
            <p className="font-semibold">{currentThemeData?.name}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <GlassCard className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`
                      p-3 rounded-lg text-center transition-all
                      ${
                        currentTheme === theme.id
                          ? 'ring-2 ring-offset-2'
                          : 'hover:bg-white/10'
                      }
                    `}
                    style={{
                      ringColor: theme.accent,
                      ringOffsetColor: 'transparent',
                    }}
                  >
                    <div className="text-3xl mb-1">{theme.emoji}</div>
                    <p className="text-xs font-semibold line-clamp-2">
                      {theme.name.split(' ').slice(1).join(' ')}
                    </p>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
