import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, ThumbsUp, Smile, MoreVertical, Edit2, Trash2, Copy, Flag, Pin } from 'lucide-react';
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
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <Avatar user={message.senderId as any} size="sm" />
        </div>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
        {showAvatar && !isOwn && (
          <div className="mb-1 ml-2">
            <span className="text-sm font-semibold text-white">
              {(message.senderId as any)?.displayName || 'User'}
            </span>
          </div>
        )}

        <div className="relative">
          <div className={`message-bubble ${isOwn ? 'bg-[var(--accent)]/30 ml-auto' : 'bg-white/10'}`}>
            {message.type === 'text' && (
              <p className="text-white whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            {message.type === 'image' && message.mediaURL && (
              <img
                src={message.mediaURL}
                alt="Message attachment"
                className="max-w-full rounded-lg cursor-pointer"
                onClick={() => window.open(message.mediaURL || '', '_blank')}
              />
            )}
            {message.type === 'video' && message.mediaURL && (
              <video
                src={message.mediaURL}
                controls
                className="max-w-full rounded-lg"
              />
            )}
            {message.type === 'embed' && message.embedData && (
              <MediaEmbed embedData={message.embedData} />
            )}
            
            <div className="text-xs text-white/50 mt-1">
              {formatMessageTime(message.createdAt)}
              {message.editedAt && <span className="ml-2">(edited)</span>}
            </div>
          </div>

          {/* Reactions */}
          {getReactionCount().length > 0 && (
            <div className="flex gap-1 mt-1 ml-2">
              {getReactionCount().map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={`px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 transition-all ${
                    reaction.hasReacted
                      ? 'bg-[var(--accent)]/30 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
            <Tooltip content="React">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Smile size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Copy">
              <button
                onClick={handleCopy}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Copy size={14} />
              </button>
            </Tooltip>
            {(isOwn || user?.isAdmin) && (
              <Tooltip content="Delete">
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-full bg-white/10 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            )}
          </div>
        )}

        {/* Reaction Picker */}
        {showReactions && (
          <div className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'}`}>
            <ReactionPicker onSelect={handleReaction} onClose={() => setShowReactions(false)} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
