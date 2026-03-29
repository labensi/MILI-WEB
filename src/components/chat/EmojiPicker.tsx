import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  'Recent': [],
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  'Kawaii': ['🌸', '✨', '⭐', '🌟', '💫', '💕', '💖', '💗', '💓', '💞', '💝', '🎀', '🦄', '🐱', '🐶', '🐼', '🐨', '🐸', '🐧', '🐰'],
  'Nature': ['🌹', '🌺', '🌻', '🌼', '🌸', '🌿', '🍃', '🍂', '🍁', '🍄', '🌵', '🌲', '🌳', '🌴', '🌍', '🌎', '🌏', '🌈', '☀️', '⭐'],
  'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍔', '🍕', '🌮', '🍣', '🍰'],
  'Objects': ['💻', '📱', '⌚', '📷', '🎥', '📺', '🔮', '💡', '🔑', '🔒', '📚', '✏️', '📎', '📌', '✂️', '🎁', '🏆', '🎨', '🎭', '🎪'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🎵', '🔔'],
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Smileys');

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      <GlassCard className="w-80 p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Emojis</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-8 pr-2 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none"
          />
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {Object.keys(emojiCategories).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Emojis Grid */}
        <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(emoji)}
              className="text-2xl p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>

        {emojis.length === 0 && (
          <div className="text-center text-white/50 py-8">
            No emojis found
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
