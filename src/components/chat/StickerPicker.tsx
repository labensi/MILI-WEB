import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../firebase/storage';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

const defaultStickers = [
  '🐱', '🐶', '🐼', '🐨', '🐸', '🐧', '🦄', '🌸',
  '✨', '⭐', '💕', '💖', '🎀', '🌈', '🍕', '🎂',
  '😊', '🥰', '😍', '🎉', '🎈', '🎁', '💝', '🌟'
];

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const { user } = useAuthStore();
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
      toast.success('Sticker uploaded!');
    } catch (error) {
      toast.error('Failed to upload sticker');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      <GlassCard className="w-96 p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Stickers</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Upload Button */}
        <div className="mb-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadSticker}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={uploading ? undefined : <Upload size={16} />}
              className="w-full"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Custom Sticker'}
            </Button>
          </label>
        </div>

        {/* Default Stickers */}
        <div className="mb-3">
          <h4 className="text-white/70 text-xs mb-2">Default Stickers</h4>
          <div className="grid grid-cols-6 gap-2">
            {defaultStickers.map((sticker, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(sticker)}
                className="text-3xl p-2 hover:bg-white/10 rounded transition-colors"
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Stickers */}
        {customStickers.length > 0 && (
          <div>
            <h4 className="text-white/70 text-xs mb-2">Your Stickers</h4>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {customStickers.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(url)}
                  className="aspect-square hover:bg-white/10 rounded p-1 transition-colors"
                >
                  <img src={url} alt="Custom sticker" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
