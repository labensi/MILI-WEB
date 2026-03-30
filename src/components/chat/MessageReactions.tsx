import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
  currentUserReacted: boolean;
}

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * MessageReactions Component
 * Display and manage emoji reactions on messages
 * Shows reaction counts and allows adding/removing reactions
 */
export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onAddReaction,
  onRemoveReaction,
  disabled = false,
  compact = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const commonEmojis = [
    '👍', '❤️', '😂', '😮', '😢', '🔥',
    '✨', '😍', '🎉', '👏', '💯', '🚀',
    '🤔', '😴', '💀', '👿', '🙌', '💪',
  ];

  const handleReactionClick = (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji);
    if (reaction?.currentUserReacted) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    onAddReaction?.(emoji);
    setShowPicker(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Reaction Pills */}
      <AnimatePresence mode="popLayout">
        {reactions.map((reaction, idx) => (
          <motion.button
            key={reaction.emoji}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => !disabled && handleReactionClick(reaction.emoji)}
            className={`group px-2 py-1 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
              reaction.currentUserReacted
                ? 'bg-[var(--theme-accent)]/30 border border-[var(--theme-accent)]'
                : 'bg-white/10 border border-white/20 hover:bg-white/15'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            title={`${reaction.count} reaction${reaction.count !== 1 ? 's' : ''}`}
          >
            <span className="text-base">{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
            
            {/* Tooltip on hover */}
            {reaction.userIds.length > 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                {reaction.userIds.slice(0, 3).join(', ')}
                {reaction.userIds.length > 3 && ` +${reaction.userIds.length - 3}`}
              </div>
            )}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Add Reaction Button */}
      {!disabled && onAddReaction && (
        <motion.div
          animate={{ scale: showPicker ? 1.2 : 1 }}
          className="relative"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPicker(!showPicker)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Add reaction"
          >
            <Plus size={16} />
          </motion.button>

          {/* Emoji Picker Dropdown */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 grid grid-cols-6 gap-2 z-50 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {commonEmojis.map((emoji, idx) => (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddEmoji(emoji)}
                    className="text-xl hover:bg-white/10 rounded p-1 transition-all"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export interface ReactionSummary {
  emoji: string;
  count: number;
}

interface ReactionSummaryProps {
  topReactions: ReactionSummary[];
  total: number;
  onViewAll?: () => void;
}

/**
 * ReactionSummary Component
 * Shows top reaction emojis with counts in a compact view
 */
export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  topReactions,
  total,
  onViewAll,
}) => {
  return (
    <div className="flex items-center gap-1 text-sm text-white/70">
      <div className="flex -space-x-1">
        {topReactions.slice(0, 3).map((reaction, idx) => (
          <motion.span
            key={reaction.emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="text-base"
          >
            {reaction.emoji}
          </motion.span>
        ))}
      </div>
      <span className="font-medium">{total}</span>
      {onViewAll && total > 3 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={onViewAll}
          className="text-blue-400 hover:text-blue-300 underline text-xs ml-1"
        >
          +{total - 3} more
        </motion.button>
      )}
    </div>
  );
};

export interface ReactionDetailsProps {
  emoji: string;
  userReactions: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
  }>;
  currentUserId?: string;
  onRemoveMyReaction?: () => void;
}

/**
 * ReactionDetails Component
 * Shows detailed view of who reacted with a specific emoji
 */
export const ReactionDetails: React.FC<ReactionDetailsProps> = ({
  emoji,
  userReactions,
  currentUserId,
  onRemoveMyReaction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-semibold text-white/70">{userReactions.length}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {userReactions.map((reaction, idx) => {
          const isCurrentUser = reaction.userId === currentUserId;
          return (
            <motion.div
              key={reaction.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {reaction.userAvatar && (
                  <img
                    src={reaction.userAvatar}
                    alt={reaction.userName}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm text-white truncate">
                  {reaction.userName}
                  {isCurrentUser && (
                    <span className="text-xs text-white/50 ml-1">(you)</span>
                  )}
                </span>
              </div>

              {isCurrentUser && onRemoveMyReaction && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRemoveMyReaction}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                  title="Remove your reaction"
                >
                  <X size={14} />
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
