import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Palette as PaletteIcon, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { applyFontStyle, getFontStyleCSS } from '../../utils/fontStyles';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const fontStyles = [
  { id: 'classic', name: 'Classic', premium: false, example: 'Hello World' },
  { id: 'boldSerif', name: 'Bold Serif', premium: false, example: '𝐇𝐞𝐥𝐥𝐨 𝐖𝐨𝐫𝐥𝐝' },
  { id: 'scriptCursive', name: 'Script Cursive', premium: false, example: '𝓗𝓮𝓵𝓵𝓸 𝓦𝓸𝓻𝓵𝓭' },
  { id: 'fraktur', name: 'Fraktur Gothic', premium: false, example: '𝔊𝔬𝔱𝔥𝔦𝔠' },
  { id: 'doubleStruck', name: 'Double Struck', premium: true, example: '𝔻𝕠𝕦𝕓𝕝𝕖' },
  { id: 'smallCaps', name: 'Small Caps', premium: true, example: 'Sᴍᴀʟʟ Cᴀᴘs' },
  { id: 'vaporwave', name: 'Vaporwave', premium: true, example: 'Ｖａｐｏｒｗａｖｅ' },
];

const animations = [
  { id: 'none', name: 'None' },
  { id: 'shimmer', name: 'Shimmer' },
  { id: 'pulse', name: 'Pulse' },
  { id: 'wave', name: 'Wave' },
];

export const FontStylePicker: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedStyle, setSelectedStyle] = useState(user?.fontStyle || 'classic');
  const [selectedColor, setSelectedColor] = useState(user?.fontColor || '#ffffff');
  const [selectedAnimation, setSelectedAnimation] = useState(user?.fontAnimation || 'none');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await firestoreService.updateUser(user.uid, {
        fontStyle: selectedStyle,
        fontColor: selectedColor,
        fontAnimation: selectedAnimation,
      });
      toast.success('Font style updated! ✨');
    } catch (error) {
      toast.error('Failed to update font style');
    } finally {
      setSaving(false);
    }
  };

  const previewText = user?.displayName || 'Your Name';
  const previewStyle = getFontStyleCSS(selectedStyle, selectedColor, selectedAnimation);
  const transformedText = applyFontStyle(previewText, selectedStyle);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <GlassCard className="p-6 text-center">
        <h3 className="text-white/70 text-sm mb-3">Preview</h3>
        <div
          className="text-3xl font-bold mb-2"
          style={previewStyle as React.CSSProperties}
        >
          {transformedText}
        </div>
        <p className="text-white/50 text-sm">This is how your name appears everywhere</p>
      </GlassCard>

      {/* Font Styles */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Type size={20} />
          Font Styles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fontStyles.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-xl transition-all text-left ${
                selectedStyle === style.id
                  ? 'ring-2 ring-[var(--accent)] bg-white/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{style.name}</span>
                {style.premium && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm">{style.example}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <PaletteIcon size={20} />
          Font Color
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer"
          />
          <div className="flex-1">
            <p className="text-white/70 text-sm">Choose any color for your username</p>
            <p className="text-white/50 text-xs">Hex: {selectedColor}</p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles size={20} />
          Subtle Animation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {animations.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setSelectedAnimation(anim.id)}
              className={`p-3 rounded-xl transition-all text-center ${
                selectedAnimation === anim.id
                  ? 'ring-2 ring-[var(--accent)] bg-white/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-white text-sm">{anim.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        variant="primary"
        loading={saving}
        className="w-full"
      >
        Save Font Settings
      </Button>
    </div>
  );
};
