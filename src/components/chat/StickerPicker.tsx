import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, X, Star, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../firebase/storage';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

const stickerCategories = {
  '😊 Faces': ['😊', '🥰', '😍', '🎉', '😂', '🤩', '😘', '🥳'],
  '🐾 Animals': ['🐱', '🐶', '🐼', '🐨', '🐸', '🐧', '🦄', '🐹'],
  '🌸 Nature': ['🌸', '🌺', '✨', '⭐', '🌈', '🌟', '💫', '🍃'],
  '💕 Love': ['💕', '💖', '🎀', '💝', '💗', '💓', '💞', '🌹'],
  '🎉 Celebration': ['🎉', '🎈', '🎁', '🎂', '🎊', '🥳', '🎆', '🎇'],
  '🍕 Food': ['🍕', '🍰', '🍪', '🍩', '🍓', '🍉', '🍫', '🍬'],
};

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const { user } = useAuthStore();
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('😊 Faces');

  useEffect(() => {
    if (user) {
      loadCustomStickers();
    }
  }, [user]);

  const loadCustomStickers = async () => {
    if (!user) return;
    const stickers = await storageService.getUserStickers(user.uid);
    setCustomStickers(stickers);
  };

  const handleUploadSticker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await storageService.uploadSticker(file, user.uid);
      setCustomStickers([...customStickers, url]);
      toast.success('Sticker uploaded! 🎉');
    } catch (error) {
      toast.error('Failed to upload sticker');
    } finally {
      setUploading(false);
    }
  };

  const currentStickers = stickerCategories[activeCategory as keyof typeof stickerCategories] || [];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
            <span className="text-2xl">🎨</span>
            Stickers
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

        {/* Upload Button */}
        <label className="cursor-pointer block mb-4">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadSticker}
            disabled={uploading}
          />
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--theme-accent)]/20 to-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/50 hover:border-[var(--theme-accent)]"
              disabled={uploading}
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Custom Sticker'}
            </Button>
          </motion.div>
        </label>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {Object.keys(stickerCategories).map((category, idx) => (
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

        {/* Stickers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto mb-4 pb-2"
        >
          <AnimatePresence mode="popLayout">
            {currentStickers.map((sticker, idx) => (
              <motion.button
                key={`${sticker}-${idx}`}
                variants={itemVariants}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelect(sticker);
                  onClose();
                }}
                className="
                  text-3xl p-2 rounded-lg
                  hover:bg-[var(--theme-accent)]/40 hover:shadow-lg hover:shadow-[var(--theme-accent)]/30
                  transition-all duration-150 cursor-pointer
                  active:scale-75
                "
              >
                {sticker}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Custom Stickers Section */}
        {customStickers.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-white/10"
            >
              <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-400" />
                Your Stickers ({customStickers.length})
              </h4>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-6 gap-2"
              >
                {customStickers.map((url, idx) => (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onSelect(url);
                      onClose();
                    }}
                    className="
                      aspect-square rounded-lg overflow-hidden
                      hover:ring-2 hover:ring-[var(--theme-accent)]/50
                      hover:shadow-lg hover:shadow-[var(--theme-accent)]/20
                      transition-all duration-150
                      p-1 bg-white/10 backdrop-blur-md
                    "
                  >
                    <img
                      src={url}
                      alt="Custom sticker"
                      className="w-full h-full object-contain"
                    />
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50 text-center"
        >
          💡 Click to select sticker
        </motion.div>
      </GlassCard>
    </motion.div>
  );
};
