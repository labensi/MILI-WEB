import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { Avatar } from '../ui/Avatar';
import { Plus } from 'lucide-react';

interface StoryCardProps {
  userId?: string;
  isAddStory?: boolean;
  onClick?: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ userId, isAddStory, onClick }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      const loadUser = async () => {
        const userData = await firestoreService.getUser(userId);
        setUser(userData);
      };
      loadUser();
    }
  }, [userId]);

  if (isAddStory) {
    return (
      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex-shrink-0 w-20 text-center"
      >
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-[var(--accent)] rounded-full px-2 py-0.5">
            <span className="text-white text-xs">New</span>
          </div>
        </div>
        <p className="text-white text-xs mt-1">Add Story</p>
      </motion.button>
    );
  }

  if (!user) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-shrink-0 w-20 text-center"
    >
      <div className="relative">
        <div className="ring-2 ring-[var(--accent)] rounded-full p-0.5">
          <Avatar user={user} size="lg" />
        </div>
      </div>
      <p className="text-white text-xs mt-1 truncate">{user.displayName}</p>
    </motion.button>
  );
};
