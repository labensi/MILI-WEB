import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useThemeStore, themePresets } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { ThemePreviewCard } from './ThemePreviewCard';
import { GlassCard } from '../ui/GlassCard';
import toast from 'react-hot-toast';

/**
 * ThemeGallery Component
 * Displays all available themes in a beautiful grid
 * Allows users to preview and select themes
 */
export const ThemeGallery: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const { user } = useAuthStore();

  const handleThemeChange = async (themeId: string) => {
    setTheme(themeId);
    
    if (user) {
      try {
        await firestoreService.updateUser(user.uid, { theme: themeId });
        const themeName = themePresets[themeId as keyof typeof themePresets]?.name || themeId;
        toast.success(`Theme changed to ${themeName}`);
      } catch (error) {
        toast.error('Failed to save theme preference');
        console.error('Error saving theme:', error);
      }
    }
  };

  const themes = Object.values(themePresets);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <GlassCard className="p-6 mb-6" hover={false}>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Palette className="w-6 h-6" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Theme Gallery</h2>
            <p className="text-white/60">Choose your favorite theme to customize MILI CHAT</p>
          </div>
        </div>
      </GlassCard>

      {/* Theme Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
      >
        {themes.map((theme) => (
          <motion.div key={theme.id} variants={itemVariants}>
            <ThemePreviewCard
              name={theme.name}
              emoji={theme.emoji}
              gradient={theme.gradient}
              accent={theme.accent}
              isActive={currentTheme === theme.id}
              onClick={() => handleThemeChange(theme.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <GlassCard className="p-4 border-l-4" hover={false}>
          <p className="text-sm text-white/70">
            💡 <span className="font-semibold">Tip:</span> Your theme preference is saved to your profile and will be applied on every login.
          </p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
