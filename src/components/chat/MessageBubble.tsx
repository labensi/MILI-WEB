import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, Smile, MoreVertical, Trash2, Copy, Pin, Reply } from 'lucide-react';
import { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useMessages } from '../../hooks/useMessages';
import { formatMessageTime } from '../../utils/helpers';
import { MediaEmbed } from './MediaEmbed';
import { ReactionPicker } from './ReactionPicker';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import toast from 'react-hot-toast';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar }) => {
  const { user } = useAuthStore();
  const { addReaction, removeReaction, deleteMessage } = useMessages();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message.id);
      toast.success('Message deleted');
    }
  };

  const handleReaction = async (emoji: string) => {
    const hasReacted = message.reactions[emoji]?.includes(user?.uid || '');
    if (hasReacted) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  const getReactionCount = () => {
    const reactions = [];
    for (const [emoji, users] of Object.entries(message.reactions)) {
      reactions.push({ emoji, count: users.length, hasReacted: users.includes(user?.uid || '') });
    }
    return reactions;
  };

  if (message.isDeleted) {
    return (
      <div className="flex justify-center my-2">
        <p className="text-white/30 text-sm italic">Message deleted</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex gap-3 group mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 mt-1">
          <Avatar user={message.senderId as any} size="sm" />
        </div>
      )}
      {showAvatar && isOwn && <div className="w-8 flex-shrink-0" />}

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] flex flex-col ${isOwn ? 'items-end' : ''}`}>
        {/* Sender Name */}
        {showAvatar && !isOwn && (
          <div className="mb-1 ml-2">
            <span className="text-xs font-bold text-[var(--theme-accent)] uppercase tracking-wide">
              {(message.senderId as any)?.displayName || 'User'}
            </span>
          </div>
        )}

        {/* Message Bubble with Glass Effect */}
        <div className="relative group/bubble">
          <motion.div
            whileHover={{ y: -2 }}
            className={`
              message-bubble px-4 py-3 rounded-2xl
              ${isOwn 
                ? 'bg-gradient-to-br from-[var(--theme-primary-gradient)] to-[var(--theme-accent)]/50 text-white shadow-lg shadow-[var(--theme-accent)]/20'
                : 'glass-panel bg-white/10 backdrop-blur-md border border-white/20 text-white'
              }
              transition-all duration-200
            `}
          >
            {/* Text Content */}
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Image Content */}
            {message.type === 'image' && message.mediaURL && (
              <motion.img
                src={message.mediaURL}
                alt="Message attachment"
                className="max-w-full max-h-64 rounded-xl cursor-pointer hover:brightness-110 transition-all"
                whileHover={{ scale: 1.02 }}
                onClick={() => window.open(message.mediaURL || '', '_blank')}
              />
            )}

            {/* Video Content */}
            {message.type === 'video' && message.mediaURL && (
              <video
                src={message.mediaURL}
                controls
                className="max-w-full max-h-64 rounded-xl"
              />
            )}

            {/* Media Embed */}
            {message.type === 'embed' && message.embedData && (
              <MediaEmbed embedData={message.embedData} />
            )}

            {/* Timestamp and Edit Status */}
            <div className={`text-xs mt-2 ${isOwn ? 'text-white/70' : 'text-white/50'} flex items-center gap-1 justify-end`}>
              {formatMessageTime(message.createdAt)}
              {message.editedAt && <span className="italic">(edited)</span>}
            </div>
          </motion.div>

          {/* Reactions Display */}
          <AnimatePresence>
            {getReactionCount().length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-wrap gap-1 mt-2 ${isOwn ? 'justify-end' : ''}`}
              >
                {getReactionCount().map((reaction, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`
                      px-2 py-1 rounded-full text-xs flex items-center gap-1
                      transition-all duration-200 font-semibold
                      ${reaction.hasReacted
                        ? 'bg-[var(--theme-accent)]/40 border border-[var(--theme-accent)] text-white shadow-lg shadow-[var(--theme-accent)]/30'
                        : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 backdrop-blur-md'
                      }
                    `}
                  >
                    <span className="text-base">{reaction.emoji}</span>
                    <span>{reaction.count > 1 ? reaction.count : ''}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`flex gap-1 mt-2 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              {/* React Button */}
              <Tooltip content="Add Reaction">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-2 rounded-full bg-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)]/40 border border-[var(--theme-accent)]/30 transition-all duration-200"
                >
                  <Smile size={16} className="text-[var(--theme-accent)]" />
                </motion.button>
              </Tooltip>

              {/* Copy Button */}
              <Tooltip content="Copy">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  <Copy size={16} className="text-white/70" />
                </motion.button>
              </Tooltip>

              {/* Delete Button - Only for own messages or admins */}
              {(isOwn || user?.isAdmin) && (
                <Tooltip content="Delete">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 transition-all duration-200"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </motion.button>
                </Tooltip>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Picker Dropdown */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full mt-2 ${isOwn ? 'right-0' : 'left-0'}`}
            >
              <ReactionPicker onSelect={handleReaction} onClose={() => setShowReactions(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
