import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX, Palette } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const themes = [
  {
    id: 'spring',
    name: 'Spring Bloom',
    icon: '🌸',
    colors: ['#ff9a9e', '#fecfef', '#98fb98'],
    description: 'Cherry blossoms and soft pastels',
  },
  {
    id: 'summer',
    name: 'Summer Glow',
    icon: '☀️',
    colors: ['#fad961', '#f76b1c', '#ffd700'],
    description: 'Warm sunshine and golden rays',
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    icon: '🍂',
    colors: ['#ff9966', '#ff5e62', '#8b4513'],
    description: 'Cozy amber and rust colors',
  },
  {
    id: 'winter',
    name: 'Winter Snow',
    icon: '❄️',
    colors: ['#a6c1ee', '#fbc2eb', '#b8e1fc'],
    description: 'Ice blue and silver white',
  },
];

export const ThemeSelector: React.FC = () => {
  const { currentTheme, darkMode, setTheme, setDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(50);

  const handleThemeChange = async (themeId: string) => {
    setTheme(themeId);
    if (user) {
      await firestoreService.updateUser(user.uid, { theme: themeId });
      toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}!`);
    }
  };

  const handleDarkModeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (user) {
      await firestoreService.updateUser(user.uid, { darkMode: newDarkMode });
    }
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Play ambient sound would go here
      toast.success('Ambient sounds enabled');
    } else {
      toast.success('Ambient sounds disabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Themes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Palette size={20} />
          Seasonal Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-4 rounded-xl transition-all ${
                currentTheme === theme.id
                  ? 'ring-2 ring-[var(--accent)] bg-white/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{theme.icon}</span>
                <div>
                  <h4 className="text-white font-semibold">{theme.name}</h4>
                  <p className="text-white/50 text-sm">{theme.description}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {theme.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dark/Light Mode Toggle */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold">Dark / Light Mode</h4>
            <p className="text-white/50 text-sm">Switch between dark and light themes</p>
          </div>
          <Button
            onClick={handleDarkModeToggle}
            variant="secondary"
            icon={darkMode ? <Moon size={18} /> : <Sun size={18} />}
          >
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </div>
      </GlassCard>

      {/* Ambient Sound */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white font-semibold">Ambient Sound</h4>
            <p className="text-white/50 text-sm">Background sounds for each season</p>
          </div>
          <Button
            onClick={handleSoundToggle}
            variant="secondary"
            icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          >
            {soundEnabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
        
        {soundEnabled && (
          <div className="mt-3">
            <label className="block text-white/70 text-sm mb-2">
              Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </GlassCard>
    </div>
  );
};
