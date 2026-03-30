import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  '⭐ Recent': [],
  '😊 Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  '🦄 Cute': ['🦄', '🐱', '🐶', '🐼', '🐨', '🐸', '🐧', '🐰', '🐹', '🐻', '🐻‍❄️', '🐻‍🍖', '🐷', '🐮', '🐵', '🐒', '🐶', '🦊', '🐻', '🦁'],
  '🌸 Nature': ['🌹', '🌺', '🌻', '🌼', '🌸', '🌿', '🍃', '🍂', '🍁', '🍄', '🌵', '🌲', '🌳', '🌴', '🌍', '🌎', '🌏', '🌈', '☀️', '⭐'],
  '🍕 Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍔', '🍕', '🌮', '🍣', '🍰'],
  '💻 Objects': ['💻', '📱', '⌚', '📷', '🎥', '📺', '🔮', '💡', '🔑', '🔒', '📚', '✏️', '📎', '📌', '✂️', '🎁', '🏆', '🎨', '🎭', '🎪'],
  '❤️ Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🎵', '🔔'],
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('😊 Smileys');

  const getAllEmojis = () => {
    const allEmojis: string[] = [];
    Object.values(emojiCategories).forEach(category => {
      if (Array.isArray(category)) {
        allEmojis.push(...category);
      }
    });
    return allEmojis;
  };

  const getFilteredEmojis = () => {
    if (!searchQuery) {
      const category = emojiCategories[activeCategory as keyof typeof emojiCategories];
      return Array.isArray(category) ? category : [];
    }
    return getAllEmojis().filter(emoji => 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const emojis = getFilteredEmojis();
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <GlassCard className="w-96 p-4 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">😊</span>
            Emoji Picker
          </h3>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 text-sm text-white
              backdrop-blur-md bg-white/10 border border-white/20 rounded-xl
              placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/50
              transition-all duration-200
            "
          />
        </div>

        {/* Categories Tabs */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide"
          >
            {Object.keys(emojiCategories).map((category, idx) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap
                  transition-all duration-200 flex-shrink-0
                  ${activeCategory === category
                    ? 'bg-gradient-to-r from-[var(--theme-accent)]/50 to-[var(--theme-accent)]/20 border border-[var(--theme-accent)]/50 text-white shadow-lg shadow-[var(--theme-accent)]/20'
                    : 'bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }
                `}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Emojis Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-8 gap-1 max-h-72 overflow-y-auto rounded-lg"
        >
          <AnimatePresence mode="popLayout">
            {emojis.map((emoji, idx) => (
              <motion.button
                key={`${emoji}-${idx}`}
                variants={itemVariants}
                whileHover={{ scale: 1.3, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="
                  text-2xl p-2 rounded-lg
                  hover:bg-[var(--theme-accent)]/40 hover:shadow-lg hover:shadow-[var(--theme-accent)]/30
                  transition-all duration-150 cursor-pointer
                  active:scale-75
                "
                layoutId={`emoji-${emoji}`}
              >
                {emoji}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {emojis.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center text-white/50 py-12"
            >
              <p className="text-3xl mb-2">🤔</p>
              <p className="text-sm">No emojis found</p>
              <p className="text-xs text-white/30">Try a different search</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        {emojis.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 pt-3 border-t border-white/10 text-xs text-white/50 text-center"
          >
            {searchQuery ? `Found ${emojis.length} emoji${emojis.length !== 1 ? 's' : ''}` : `${emojis.length} emojis in this category`}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
};
