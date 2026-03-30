import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Loader } from 'lucide-react';
import { Button } from '../ui/Button';

interface EnhancedMessageInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  hasAttachments?: boolean;
  onAttachmentClick?: () => void;
}

/**
 * EnhancedMessageInput Component
 * Advanced message input with typing indicators, auto-expand, and attachment support
 * Features:
 * - Auto-growing textarea
 * - Typing indicator
 * - Rich formatting hints
 * - Attachment button
 * - Command palette integration
 */
export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  hasAttachments = false,
  onAttachmentClick,
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const MAX_LENGTH = 4000;

  // Auto-expand textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessage(text);
    setCharCount(text.length);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }

    // Send typing indicator
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSend(message);
      setMessage('');
      setCharCount(0);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (onTyping) onTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = charCount > MAX_LENGTH;
  const isNearLimit = charCount > MAX_LENGTH * 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 space-y-2"
    >
      {/* Character Count Warning */}
      <AnimatePresence>
        {charCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-xs font-medium ${
              isOverLimit
                ? 'text-red-400'
                : isNearLimit
                ? 'text-yellow-400'
                : 'text-white/50'
            }`}
          >
            {charCount} / {MAX_LENGTH}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="flex gap-2 items-end">
        {/* Attachment Button */}
        {hasAttachments && onAttachmentClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAttachmentClick}
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white flex-shrink-0"
            title="Add attachment"
          >
            <Plus size={20} />
          </motion.button>
        )}

        {/* Text Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            maxLength={MAX_LENGTH}
            className={`
              w-full max-h-48 p-3 rounded-xl
              glass-input
              resize-none
              text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isOverLimit ? 'border-red-500' : ''}
            `}
            rows={1}
          />

          {/* Hint */}
          <p className="absolute bottom-2 right-3 text-xs text-white/30 pointer-events-none">
            Enter to send • Shift+Enter for new line
          </p>
        </div>

        {/* Send Button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleSend}
          disabled={!message.trim() || isLoading || isOverLimit}
          loading={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>

      {/* Format Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-white/30 space-y-1"
      >
        <p>💡 Pro tips:</p>
        <ul className="space-y-0.5 ml-3">
          <li>• **bold** for <strong>bold</strong> text</li>
          <li>• _italic_ for <em>italic</em> text</li>
          <li>• `code` for monospace</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};
