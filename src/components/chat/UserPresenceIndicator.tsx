import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';

interface UserPresenceIndicatorProps {
  user?: User;
  isTyping?: boolean;
  showStatus?: boolean;
  compact?: boolean;
}

/**
 * UserPresenceIndicator Component
 * Shows user avatar, status, and typing indicator
 * Commonly used in member lists and DM headers
 */
export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  user,
  isTyping = false,
  showStatus = true,
  compact = false,
}) => {
  if (!user) return null;

  // Determine user status
  const getStatusColor = () => {
    if (isTyping) return '#3b82f6';
    if (user.isOnline) return '#4ade80';
    return 'rgba(255, 255, 255, 0.3)';
  };

  const getStatusText = () => {
    if (isTyping) return 'Typing...';
    if (user.isOnline) return 'Online';
    return 'Offline';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <Avatar user={user} size="sm" />
          {showStatus && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-1 ring-white"
              style={{ backgroundColor: getStatusColor() }}
            />
          )}
        </div>
        {getStatusText() === 'Typing...' && (
          <div className="text-xs text-blue-400 font-semibold">Typing...</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar user={user} size="md" />
          {showStatus && (
            <motion.div
              animate={isTyping ? { scale: [1, 1.2, 1] } : { opacity: 1 }}
              transition={
                isTyping ? { duration: 1.5, repeat: Infinity } : { duration: 0 }
              }
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white"
              style={{ backgroundColor: getStatusColor() }}
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-white">{user.displayName}</p>
          {showStatus && (
            <p className="text-xs font-semibold" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ChatStatusBarProps {
  typingUsers?: User[];
  onlineCount?: number;
}

/**
 * ChatStatusBar Component
 * Shows online users and typing indicators
 */
export const ChatStatusBar: React.FC<ChatStatusBarProps> = ({
  typingUsers = [],
  onlineCount = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-4 py-2 text-xs text-white/60 flex items-center justify-between"
    >
      {typingUsers.length > 0 ? (
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✍️
          </motion.div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].displayName} is typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>
            {onlineCount > 0 ? `${onlineCount} online` : 'No one online'}
          </span>
        </div>
      )}
    </motion.div>
  );
};
