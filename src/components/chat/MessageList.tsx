import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '../../hooks/useMessages';
import { useAuthStore } from '../../store/authStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export const MessageList: React.FC = () => {
  const { messages, loading } = useMessages();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
      <AnimatePresence>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center min-h-[400px]"
          >
            <div className="text-center text-white/50">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          </motion.div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.uid}
                showAvatar={showAvatar}
              />
            );
          })
        )}
      </AnimatePresence>
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  );
};
