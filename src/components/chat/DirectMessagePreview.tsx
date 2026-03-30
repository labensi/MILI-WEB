import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, Pin, PinOff } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { GlassCard } from '../ui/GlassCard';

export interface DMPreview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount?: number;
  isPinned?: boolean;
  isOnline?: boolean;
}

interface DirectMessagePreviewProps {
  dm: DMPreview;
  isSelected?: boolean;
  onSelect?: (dmId: string) => void;
  onPin?: (dmId: string) => void;
  onDelete?: (dmId: string) => void;
  hoverable?: boolean;
}

/**
 * DirectMessagePreview Component
 * Compact preview of a direct message conversation
 * Shows user info, last message snippet, and unread count
 */
export const DirectMessagePreview: React.FC<DirectMessagePreviewProps> = ({
  dm,
  isSelected = false,
  onSelect,
  onPin,
  onDelete,
  hoverable = true,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (msg: string, maxLength = 40) => {
    return msg.length > maxLength ? msg.substring(0, maxLength) + '...' : msg;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect?.(dm.id)}
      className={`relative group cursor-pointer transition-all ${
        isSelected ? 'bg-white/10' : ''
      } ${hoverable ? 'hover:bg-white/10' : ''}`}
    >
      <GlassCard className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Avatar with Online Indicator */}
          <div className="relative flex-shrink-0">
            <Avatar
              src={dm.userAvatar}
              alt={dm.userName}
              size="md"
              className="ring-2 ring-transparent group-hover:ring-white/30 transition-all"
            />
            {dm.isOnline && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white/80"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-semibold text-sm sm:text-base text-white truncate">
                {dm.userName}
              </h4>
              <span className="text-xs text-white/50 whitespace-nowrap flex items-center gap-1">
                <Clock size={12} />
                {formatTime(dm.lastMessageTime)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 truncate">
              {truncateMessage(dm.lastMessage)}
            </p>
          </div>

          {/* Unread Badge or Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!showActions && dm.unreadCount ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--theme-accent)] flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
              >
                {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
              </motion.div>
            ) : null}

            {/* Action Buttons */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex gap-1"
              >
                {onPin && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(dm.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title={dm.isPinned ? 'Unpin' : 'Pin'}
                  >
                    {dm.isPinned ? (
                      <PinOff size={16} />
                    ) : (
                      <Pin size={16} />
                    )}
                  </motion.button>
                )}

                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(dm.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Selection Border */}
        {isSelected && (
          <motion.div
            layoutId="dmSelection"
            className="absolute inset-0 rounded-xl border-2 border-[var(--theme-accent)] pointer-events-none"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </GlassCard>
    </motion.div>
  );
};

interface DirectMessageListProps {
  dms: DMPreview[];
  selectedDmId?: string;
  onSelectDm?: (dmId: string) => void;
  onPinDm?: (dmId: string) => void;
  onDeleteDm?: (dmId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * DirectMessageList Component
 * Container for multiple DM previews with loading state
 */
export const DirectMessageList: React.FC<DirectMessageListProps> = ({
  dms,
  selectedDmId,
  onSelectDm,
  onPinDm,
  onDeleteDm,
  isLoading = false,
  emptyMessage = 'No direct messages yet',
}) => {
  // Separate pinned and unpinned DMs
  const pinnedDms = dms.filter((dm) => dm.isPinned);
  const unpinnedDms = dms.filter((dm) => !dm.isPinned);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-16 rounded-xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (!dms.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-white/50"
      >
        💬 {emptyMessage}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {/* Pinned DMs Section */}
      {pinnedDms.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-white/40 uppercase px-2 py-1">📌 Pinned</p>
          {pinnedDms.map((dm, idx) => (
            <motion.div
              key={dm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <DirectMessagePreview
                dm={dm}
                isSelected={selectedDmId === dm.id}
                onSelect={onSelectDm}
                onPin={onPinDm}
                onDelete={onDeleteDm}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Unpinned DMs Section */}
      {unpinnedDms.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {pinnedDms.length > 0 && (
            <p className="text-xs font-semibold text-white/40 uppercase px-2 py-1">💬 Messages</p>
          )}
          {unpinnedDms.map((dm, idx) => (
            <motion.div
              key={dm.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (pinnedDms.length + idx) * 0.05 }}
            >
              <DirectMessagePreview
                dm={dm}
                isSelected={selectedDmId === dm.id}
                onSelect={onSelectDm}
                onPin={onPinDm}
                onDelete={onDeleteDm}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
