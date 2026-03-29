import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '✨', '💕', '🔥'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
    >
      <GlassCard className="p-2">
        <div className="flex gap-1">
          {commonReactions.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(reaction);
                onClose();
              }}
              className="text-2xl p-2 hover:bg-white/10 rounded transition-all hover:scale-125"
            >
              {reaction}
            </button>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};
