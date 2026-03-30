import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface ThemePreviewProps {
  name: string;
  emoji: string;
  gradient: string;
  accent: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * ThemePreviewCard Component
 * Displays a single theme option with preview
 * Shows visual representation of the theme colors and styles
 */
export const ThemePreviewCard: React.FC<ThemePreviewProps> = ({
  name,
  emoji,
  gradient,
  accent,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        ${isActive ? 'ring-2 ring-offset-2' : 'hover:shadow-lg'}
      `}
      style={{
        ringColor: accent,
      }}
    >
      <GlassCard className="p-4 h-full w-full" hover={false}>
        {/* Gradient preview background */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ background: gradient }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Emoji */}
          <motion.div
            className="text-5xl mb-3"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {emoji}
          </motion.div>

          {/* Theme Name */}
          <p className="font-semibold text-base mb-3 line-clamp-2">{name}</p>

          {/* Color Swatches */}
          <div className="flex gap-2 justify-center mb-3">
            <motion.div
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
              style={{ background: accent }}
              whileHover={{ scale: 1.2 }}
            />
            <div
              className="w-6 h-6 rounded-full border-2 border-white/30 opacity-60"
              style={{
                background: gradient,
                backgroundSize: 'cover',
              }}
            />
          </div>

          {/* Active Indicator */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${accent}40`, color: accent }}
            >
              <Check size={14} />
              Active
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.button>
  );
};
