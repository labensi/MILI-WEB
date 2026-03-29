import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Bell, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface PrivacySettingsData {
  whoCanDM: 'everyone' | 'nobody';
  whoCanSeeProfile: 'everyone' | 'nobody';
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundNotifications: boolean;
}

export const PrivacySettings: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<PrivacySettingsData>({
    whoCanDM: 'everyone',
    whoCanSeeProfile: 'everyone',
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await firestoreService.updateUser(user.uid, settings as any);
      toast.success('Privacy settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct Messages */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Mail size={20} className="text-white/70 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Direct Messages</h3>
            <p className="text-white/50 text-sm mb-3">Control who can send you direct messages</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.whoCanDM === 'everyone'}
                  onChange={() => setSettings({ ...settings, whoCanDM: 'everyone' })}
                  className="text-[var(--accent)]"
                />
                <span className="text-white">Everyone</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.whoCanDM === 'nobody'}
                  onChange={() => setSettings({ ...settings, whoCanDM: 'nobody' })}
                  className="text-[var(--accent)]"
                />
                <span className="text-white">Nobody</span>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Profile Visibility */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Eye size={20} className="text-white/70 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Profile Visibility</h3>
            <p className="text-white/50 text-sm mb-3">Control who can view your profile</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.whoCanSeeProfile === 'everyone'}
                  onChange={() => setSettings({ ...settings, whoCanSeeProfile: 'everyone' })}
                  className="text-[var(--accent)]"
                />
                <span className="text-white">Everyone</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.whoCanSeeProfile === 'nobody'}
                  onChange={() => setSettings({ ...settings, whoCanSeeProfile: 'nobody' })}
                  className="text-[var(--accent)]"
                />
                <span className="text-white">Nobody</span>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Bell size={20} className="text-white/70 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Notification Preferences</h3>
            <p className="text-white/50 text-sm mb-3">Choose how you want to be notified</p>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-white">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="toggle"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="toggle"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-white">Sound Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.soundNotifications}
                  onChange={(e) => setSettings({ ...settings, soundNotifications: e.target.checked })}
                  className="toggle"
                />
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Security Note */}
      <GlassCard className="p-6 border border-green-500/30">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-green-400 mt-1" />
          <div>
            <h3 className="text-green-400 font-semibold mb-1">Security Note</h3>
            <p className="text-white/70 text-sm">
              Your privacy is important to us. All settings are encrypted and secure.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        variant="primary"
        loading={saving}
        className="w-full"
      >
        Save Privacy Settings
      </Button>
    </div>
  );
};
