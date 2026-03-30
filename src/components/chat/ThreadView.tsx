import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { GlassCard } from '../ui/GlassCard';

export interface ThreadMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  reactionCount?: number;
}

interface ThreadPreviewProps {
  parentMessage: ThreadMessage;
  replyCount: number;
  lastReplyAuthor?: string;
  onOpenThread?: () => void;
  compact?: boolean;
}

/**
 * ThreadPreview Component
 * Compact preview of a message thread with reply count
 * Shows parent message and link to open full thread
 */
export const ThreadPreview: React.FC<ThreadPreviewProps> = ({
  parentMessage,
  replyCount,
  lastReplyAuthor,
  onOpenThread,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = () => {
    if (onOpenThread && compact) {
      onOpenThread();
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Parent Message Display */}
      <GlassCard className="p-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Avatar src={parentMessage.userAvatar} alt={parentMessage.userName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{parentMessage.userName}</p>
                <span className="text-xs text-white/50">{formatDate(parentMessage.createdAt)}</span>
              </div>
              <p className="text-sm text-white/80 break-words">{parentMessage.content}</p>
            </div>
          </div>

          {/* Thread Info */}
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            onClick={toggleExpand}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded transition-colors"
          >
            <MessageSquare size={14} />
            <span className="font-medium">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
            {lastReplyAuthor && (
              <span className="text-white/50">Last by {lastReplyAuthor}</span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </motion.button>
        </div>
      </GlassCard>

      {/* Expanded Thread Preview (Not full view, just compact list) */}
      {expanded && !compact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pl-6 border-l-2 border-white/20 space-y-2"
        >
          <p className="text-xs text-white/50 italic">
            Open thread to see all {replyCount} replies
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenThread}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/30 transition-colors font-medium"
          >
            View All Replies →
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

interface ThreadViewProps {
  parentMessage: ThreadMessage;
  replies: ThreadMessage[];
  onClose?: () => void;
  onSendReply?: (content: string) => Promise<void>;
  isLoading?: boolean;
  currentUserId?: string;
}

/**
 * ThreadView Component
 * Full thread view with parent message and all replies
 * Allows viewing and replying to a specific message thread
 */
export const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  replies,
  onClose,
  onSendReply,
  isLoading = false,
  currentUserId,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !onSendReply) return;

    setIsSending(true);
    try {
      await onSendReply(replyContent);
      setReplyContent('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-bold text-white">Thread</h3>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white/70" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {/* Parent Message */}
        <div className="pb-3 border-b border-white/10">
          <ThreadMessage message={parentMessage} isParent currentUserId={currentUserId} />
        </div>

        {/* Replies */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-12 rounded-lg bg-white/5"
            />
          ) : replies.length > 0 ? (
            <motion.div className="space-y-3">
              {replies.map((reply, idx) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ThreadMessage
                    message={reply}
                    currentUserId={currentUserId}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/50 text-sm py-4"
            >
              No replies yet. Be the first to reply!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Reply Input */}
      {onSendReply && (
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              disabled={isSending}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[var(--theme-accent)] resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendReply();
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendReply}
              disabled={!replyContent.trim() || isSending}
              className="px-4 py-2 bg-[var(--theme-accent)] text-white rounded-lg font-medium hover:bg-[var(--theme-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSending ? '⏳' : '→'}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface ThreadMessageProps {
  message: ThreadMessage;
  isParent?: boolean;
  currentUserId?: string;
  onMenuOpen?: () => void;
}

const ThreadMessage: React.FC<ThreadMessageProps> = ({
  message,
  isParent = false,
  currentUserId,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.userId === currentUserId;

  return (
    <motion.div
      layout
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`flex gap-3 ${isParent ? 'p-3 bg-white/5 rounded-lg' : ''}`}
    >
      <Avatar src={message.userAvatar} alt={message.userName} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">{message.userName}</p>
            <p className="text-xs text-white/50">
              {message.createdAt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {message.updatedAt && (
                <span className="italic ml-1">(edited)</span>
              )}
            </p>
          </div>

          {showActions && isOwnMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-xs px-2 py-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                ✎
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-xs px-2 py-1 rounded hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors"
              >
                ✕
              </motion.button>
            </motion.div>
          )}
        </div>

        <p className="text-sm text-white/80 break-words mt-1">{message.content}</p>

        {message.reactionCount && message.reactionCount > 0 && (
          <p className="text-xs text-white/50 mt-1.5">
            {message.reactionCount} reaction{message.reactionCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
};
