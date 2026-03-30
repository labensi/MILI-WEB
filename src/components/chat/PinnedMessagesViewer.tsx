import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, X, MessageSquare } from 'lucide-react';
import { Message } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';
import { formatMessageTime } from '../../utils/helpers';

interface PinnedMessagesViewerProps {
  pinnedMessages?: Message[];
  onUnpin?: (messageId: string) => void;
  onJumpTo?: (message: Message) => void;
}

/**
 * PinnedMessagesViewer Component
 * Shows all pinned messages in a vertical stack
 * Allows unpinning and jumping to message in chat
 */
export const PinnedMessagesViewer: React.FC<PinnedMessagesViewerProps> = ({
  pinnedMessages = [],
  onUnpin,
  onJumpTo,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Pin className="w-5 h-5 text-[var(--theme-accent)]" />
        </motion.div>
        <h3 className="font-semibold text-white">
          Pinned Messages <span className="text-sm text-white/60">({pinnedMessages.length})</span>
        </h3>
      </div>

      {/* Messages List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-custom">
        <AnimatePresence>
          {pinnedMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                onClick={() => setExpandedId(expandedId === message.id ? null : message.id)}
                className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 transition-all"
              >
                {/* Sender Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar user={message.senderId as any} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--theme-accent)] truncate">
                        {(message.senderId as any)?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-white/40">
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin?.(message.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400"
                    title="Unpin message"
                  >
                    <X size={14} />
                  </motion.button>
                </div>

                {/* Message Content Preview */}
                <p className="text-sm text-white/80 line-clamp-2">
                  {message.content}
                </p>

                {/* Jump to Button */}
                {onJumpTo && (
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpTo(message);
                    }}
                    className="mt-2 text-xs text-[var(--theme-accent)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <MessageSquare size={12} />
                    Jump to message
                  </motion.button>
                )}
              </motion.button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === message.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-white/5 rounded-lg border-l-2 border-[var(--theme-accent)]"
                  >
                    <p className="text-sm text-white whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
