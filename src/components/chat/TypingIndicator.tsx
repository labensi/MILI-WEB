import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';

export const TypingIndicator: React.FC = () => {
  const { typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const [typingNames, setTypingNames] = useState<string[]>([]);

  useEffect(() => {
    const loadTypingNames = async () => {
      const names = await Promise.all(
        typingUsers
          .filter(uid => uid !== user?.uid)
          .map(async (uid) => {
            const userData = await firestoreService.getUser(uid);
            return userData?.displayName || 'Someone';
          })
      );
      setTypingNames(names);
    };
    loadTypingNames();
  }, [typingUsers, user]);

  if (typingNames.length === 0) return null;

  const getTypingText = () => {
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    }
    if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    }
    return `${typingNames.length} people are typing...`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-2 ml-12 mb-2"
      >
        <div className="flex gap-1">
          <div className="typing-dot w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="typing-dot w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="typing-dot w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-xs text-white/50">{getTypingText()}</p>
      </motion.div>
    </AnimatePresence>
  );
};
