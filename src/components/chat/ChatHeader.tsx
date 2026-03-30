import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Bell, X } from 'lucide-react';
import { Room } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ChatHeaderProps {
  room?: Room;
  memberCount?: number;
  onSettings?: () => void;
  onInfo?: () => void;
  onNotifications?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}

/**
 * ChatHeader Component
 * Displays room/channel information with quick action buttons
 * Shows member count, room name, description, and action buttons
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  memberCount = 0,
  onSettings,
  onInfo,
  onNotifications,
  onClose,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center justify-between"
    >
      {/* Room Info */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-5 bg-white/20 rounded w-32 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
          </div>
        ) : room ? (
          <>
            {/* Room Name */}
            <h2 className="text-lg font-bold text-white truncate">
              #{room.name}
            </h2>

            {/* Room Description & Member Count */}
            <div className="flex items-center gap-3 text-sm text-white/60">
              {room.description && (
                <span className="truncate">{room.description}</span>
              )}
              {memberCount > 0 && (
                <span className="flex items-center gap-1">
                  👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-white/50">Select a room to chat</p>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div className="flex items-center gap-2 ml-4" layout>
        {/* Notifications Button */}
        {onNotifications && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotifications}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Notification settings"
          >
            <Bell size={18} />
          </motion.button>
        )}

        {/* Info Button */}
        {onInfo && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInfo}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Room information"
          >
            <Info size={18} />
          </motion.button>
        )}

        {/* Settings Button */}
        {onSettings && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Room settings"
          >
            <Settings size={18} />
          </motion.button>
        )}

        {/* Close Button (for mobile) */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white lg:hidden"
            title="Close chat"
          >
            <X size={18} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};
