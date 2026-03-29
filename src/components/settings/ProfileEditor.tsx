import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { storageService } from '../../firebase/storage';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import toast from 'react-hot-toast';

const avatarFrames = [
  { id: 1, name: 'Golden Sparkle', color: '#ffd700' },
  { id: 2, name: 'Rainbow Gradient', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)' },
  { id: 3, name: 'Neon Glow', color: '#00ffff' },
  { id: 4, name: 'Cherry Blossom', color: '#ff9a9e' },
  { id: 5, name: 'Stars & Moon', color: '#667eea' },
  { id: 6, name: 'Cosmic Nebula', color: '#8B00FF' },
];

const profileEffects = [
  { id: 1, name: 'None', icon: '✨' },
  { id: 2, name: 'Floating Stars', icon: '⭐' },
  { id: 3, name: 'Rising Bubbles', icon: '🫧' },
  { id: 4, name: 'Sakura Petals', icon: '🌸' },
  { id: 5, name: 'Glittering Confetti', icon: '🎊' },
];

export const ProfileEditor: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    accentColor: user?.accentColor || '#ff6b9d',
    avatarFrame: user?.avatarFrame || 1,
    profileEffect: user?.profileEffect || 1,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar too large. Max 5MB');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Banner too large. Max 10MB');
        return;
      }
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      let photoURL = user.photoURL;
      let bannerURL = user.bannerURL;

      if (avatarFile) {
        photoURL = await storageService.uploadImage(avatarFile, user.uid, 'avatar');
      }
      if (bannerFile) {
        bannerURL = await storageService.uploadImage(bannerFile, user.uid, 'banner');
      }

      const updates = {
        ...formData,
        photoURL,
        bannerURL,
      };

      await firestoreService.updateUser(user.uid, updates);
      setUser({ ...user, ...updates } as any);
      toast.success('Profile updated! ✨');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.charAt(0)}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--accent)] text-white hover:scale-110 transition-transform"
            >
              <Camera size={14} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-white/70 text-sm">Upload a profile picture</p>
            <p className="text-white/50 text-xs">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>
      </GlassCard>

      {/* Banner Section */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Banner</h3>
        <div className="relative">
          <div
            className="h-32 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e]"
            style={{
              backgroundImage: bannerPreview ? `url(${bannerPreview})` : user?.bannerURL ? `url(${user.bannerURL})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <Upload size={16} />
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>
      </GlassCard>

      {/* Basic Info */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="glass-input w-full px-3 py-2 text-white focus:outline-none"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="glass-input w-full px-3 py-2 text-white focus:outline-none"
              maxLength={30}
            />
            <p className="text-white/50 text-xs mt-1">@username for mentions</p>
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="glass-input w-full px-3 py-2 text-white focus:outline-none resize-none"
              rows={3}
              maxLength={150}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </GlassCard>

      {/* Avatar Frame */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Avatar Frame</h3>
        <div className="grid grid-cols-3 gap-3">
          {avatarFrames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setFormData({ ...formData, avatarFrame: frame.id })}
              className={`p-3 rounded-xl transition-all ${
                formData.avatarFrame === frame.id
                  ? 'ring-2 ring-[var(--accent)] bg-white/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2"
                style={{ background: frame.color }}
              />
              <p className="text-white text-xs">{frame.name}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Profile Effect */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Effect</h3>
        <div className="grid grid-cols-3 gap-3">
          {profileEffects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => setFormData({ ...formData, profileEffect: effect.id })}
              className={`p-3 rounded-xl transition-all ${
                formData.profileEffect === effect.id
                  ? 'ring-2 ring-[var(--accent)] bg-white/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{effect.icon}</div>
              <p className="text-white text-xs">{effect.name}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Accent Color */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={formData.accentColor}
            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
            className="w-16 h-16 rounded-lg cursor-pointer"
          />
          <div className="flex-1">
            <p className="text-white/70 text-sm">Your personal accent color</p>
            <p className="text-white/50 text-xs">Used for profile card borders and highlights</p>
          </div>
        </div>
      </GlassCard>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        variant="primary"
        loading={saving}
        icon={<Save size={18} />}
        className="w-full"
      >
        Save All Changes
      </Button>
    </div>
  );
};
