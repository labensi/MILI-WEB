import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Eye, EyeOff, Lock, Unlock, Archive, Trash2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export interface RoomSettings {
  muted: boolean;
  notifications: 'all' | 'mentions' | 'none';
  archived: boolean;
  hidden: boolean;
  isPrivate: boolean;
}

interface RoomQuickSettingsProps {
  settings: RoomSettings;
  onSettingChange: (key: keyof RoomSettings, value: any) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

/**
 * RoomQuickSettings Component
 * Compact settings panel for quick room configuration
 * Allows toggling notifications, muting, archiving, etc.
 */
export const RoomQuickSettings: React.FC<RoomQuickSettingsProps> = ({
  settings,
  onSettingChange,
  onDelete,
  isOwner = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleSetting = (key: keyof RoomSettings, toggleValue?: any) => {
    onSettingChange(key, toggleValue !== undefined ? toggleValue : !settings[key]);
  };

  if (!expanded) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(true)}
        className="glass-card p-2 rounded-lg hover:bg-white/15 transition-colors"
        title="Room settings"
      >
        ⚙️
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-4"
      onClick={() => setExpanded(false)}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-96 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Room Settings</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(false)}
            className="text-white/70 hover:text-white text-xl"
          >
            ✕
          </motion.button>
        </div>

        {/* Settings List */}
        <div className="space-y-2">
          {/* Muted Toggle */}
          <SettingItem
            icon={settings.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            label="Mute Notifications"
            description={settings.muted ? 'Muted' : 'Unmuted'}
            isActive={settings.muted}
            onChange={() => toggleSetting('muted')}
          />

          {/* Notification Level */}
          <SettingItem
            icon="🔔"
            label="Notification Level"
            description={
              settings.notifications === 'all'
                ? 'All messages'
                : settings.notifications === 'mentions'
                ? 'Mentions only'
                : 'None'
            }
            isDropdown
            onChange={() => {
              const next = settings.notifications === 'all' ? 'mentions' : settings.notifications === 'mentions' ? 'none' : 'all';
              toggleSetting('notifications', next);
            }}
          />

          {/* Visibility */}
          <SettingItem
            icon={settings.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
            label="Visibility"
            description={settings.hidden ? 'Hidden' : 'Visible'}
            isActive={settings.hidden}
            onChange={() => toggleSetting('hidden')}
          />

          {/* Archive */}
          <SettingItem
            icon={<Archive size={18} />}
            label="Archive Room"
            description={settings.archived ? 'Archived' : 'Active'}
            isActive={settings.archived}
            onChange={() => toggleSetting('archived')}
          />

          {/* Delete (Owner Only) */}
          {isOwner && onDelete && (
            <motion.button
              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              onClick={onDelete}
              className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <Trash2 size={18} />
              Delete Room
            </motion.button>
          )}
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(false)}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors font-medium"
        >
          Done
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive?: boolean;
  isDropdown?: boolean;
  onChange: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  isActive = false,
  isDropdown = false,
  onChange,
}) => {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      onClick={onChange}
      className="w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="text-xl">{typeof icon === 'string' ? icon : icon}</div>
        <div>
          <p className="font-medium text-white text-sm">{label}</p>
          <p className="text-xs text-white/50">{description}</p>
        </div>
      </div>
      {!isDropdown && (
        <motion.div
          animate={{ scale: isActive ? 1.2 : 1 }}
          className={`w-5 h-5 rounded-full border-2 transition-colors ${
            isActive
              ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)]'
              : 'border-white/30'
          }`}
        />
      )}
    </motion.button>
  );
};
