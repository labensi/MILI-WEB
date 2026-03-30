import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Zap, Flame, Wind, Crown } from 'lucide-react';
import { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const avatarEffects = [
  { id: 'glow', name: 'Glow', icon: 'sparkles', color: 'text-amber-300', description: 'Soft glowing aura' },
  { id: 'flame', name: 'Flame', icon: 'flame', color: 'text-orange-500', description: 'Fiery energy' },
  { id: 'heart', name: 'Love', icon: 'heart', color: 'text-red-400', description: 'Love and warmth' },
  { id: 'lightning', name: 'Zap', icon: 'zap', color: 'text-yellow-400', description: 'Electric energy' },
  { id: 'wind', name: 'Wind', icon: 'wind', color: 'text-cyan-400', description: 'Cool breeze' },
  { id: 'crown', name: 'Crown', icon: 'crown', color: 'text-purple-400', description: 'Royal presence' },
];

const profileColors = [
  { id: 'gradient-1', name: 'Lavender', bg: 'from-purple-500/40 to-pink-500/40' },
  { id: 'gradient-2', name: 'Ocean', bg: 'from-blue-500/40 to-cyan-500/40' },
  { id: 'gradient-3', name: 'Sunset', bg: 'from-orange-500/40 to-red-500/40' },
  { id: 'gradient-4', name: 'Forest', bg: 'from-green-500/40 to-emerald-500/40' },
  { id: 'gradient-5', name: 'Neon', bg: 'from-pink-500/40 to-purple-500/40' },
  { id: 'gradient-6', name: 'Cool', bg: 'from-blue-500/40 to-purple-500/40' },
];

const glowIntensities = [
  { id: 'low', name: 'Subtle', value: 'shadow-lg shadow-white/20' },
  { id: 'medium', name: 'Medium', value: 'shadow-xl shadow-white/40' },
  { id: 'high', name: 'Intense', value: 'shadow-2xl shadow-white/60' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { user: currentUser } = useAuthStore();
  const [selectedEffect, setSelectedEffect] = useState<string>(user.avatarEffect || 'glow');
  const [selectedColor, setSelectedColor] = useState<string>(user.profileColor || 'gradient-1');
  const [selectedGlow, setSelectedGlow] = useState<string>(user.glowIntensity || 'medium');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.uid === user.uid;

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await firestoreService.updateUser(user.uid, {
        avatarEffect: selectedEffect,
        profileColor: selectedColor,
        glowIntensity: selectedGlow,
      });
      toast.success('Profile saved! ✨');
      onClose();
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getEffectIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles size={20} />;
      case 'flame': return <Flame size={20} />;
      case 'heart': return <Heart size={20} />;
      case 'zap': return <Zap size={20} />;
      case 'wind': return <Wind size={20} />;
      case 'crown': return <Crown size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`bg-gradient-to-br ${profileColors.find(c => c.id === selectedColor)?.bg} rounded-full p-1`}>
                    <Avatar user={user} size="lg" className={selectedGlow} />
                  </div>
                  {/* Effect indicator */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className={`absolute -top-2 -right-2 p-2 rounded-full bg-[var(--theme-accent)]/20 border border-[var(--theme-accent)]/50`}
                  >
                    {getEffectIcon(avatarEffects.find(e => e.id === selectedEffect)?.icon || 'sparkles')}
                  </motion.div>
                </motion.div>

                {/* User Info */}
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
                  <p className="text-white/60 text-sm">@{user.username}</p>
                  {isOwnProfile && (
                    <Badge variant="primary" className="mt-2 text-xs px-2 py-0.5">
                      Your Profile
                    </Badge>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-all"
              >
                <X size={24} className="text-white" />
              </motion.button>
            </div>

            {/* Only show customization for own profile */}
            {isOwnProfile ? (
              <>
                {/* Avatar Effects */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-[var(--theme-accent)]" />
                    Avatar Effects
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {avatarEffects.map((effect) => (
                      <motion.button
                        key={effect.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedEffect(effect.id)}
                        className={`
                          p-3 rounded-xl transition-all duration-200
                          ${selectedEffect === effect.id
                            ? 'bg-gradient-to-br from-[var(--theme-accent)]/50 to-[var(--theme-accent)]/20 border-2 border-[var(--theme-accent)] shadow-lg shadow-[var(--theme-accent)]/30'
                            : 'glass-panel hover:shadow-lg'
                          }
                        `}
                      >
                        <div className={`flex items-center justify-center mb-1 ${effect.color}`}>
                          {getEffectIcon(effect.icon)}
                        </div>
                        <p className="text-xs font-bold text-white">{effect.name}</p>
                        <p className="text-xs text-white/50">{effect.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Profile Colors */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Profile Colors</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {profileColors.map((color) => (
                      <motion.button
                        key={color.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color.id)}
                        className={`h-16 rounded-xl transition-all duration-200 ${
                          selectedColor === color.id
                            ? 'ring-2 ring-white/80 shadow-lg'
                            : 'hover:ring-2 hover:ring-white/50'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${color.bg.split(' ')[1].replace('to-', 'from-')}, ${color.bg.split(' ')[2]})`,
                        }}
                      >
                        {selectedColor === color.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-center text-white text-xs font-bold h-full flex items-center justify-center"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Glow Intensity</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {glowIntensities.map((glow) => (
                      <motion.button
                        key={glow.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedGlow(glow.id)}
                        className={`
                          p-3 rounded-xl transition-all duration-200 text-center
                          ${selectedGlow === glow.id
                            ? 'bg-gradient-to-br from-[var(--theme-accent)]/50 to-[var(--theme-accent)]/20 border-2 border-[var(--theme-accent)]'
                            : 'glass-panel'
                          }
                        `}
                      >
                        <p className="text-sm font-bold text-white">{glow.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSavePreferences}
                    loading={saving}
                    className="flex-1"
                  >
                    Save Changes ✨
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">This is {user.displayName}'s profile</p>
                <p className="text-white/40 text-sm mt-2">You can view their customizations but cannot edit them</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
