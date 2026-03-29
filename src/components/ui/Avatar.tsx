import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  showStatus = false,
  onClick,
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const ringSizes = {
    sm: 'ring-2',
    md: 'ring-2',
    lg: 'ring-3',
    xl: 'ring-4',
  };

  const frameColors = {
    1: 'ring-yellow-400',
    2: 'ring-gradient-to-r from-red-400 to-blue-400',
    3: 'ring-cyan-400',
    4: 'ring-pink-400',
    5: 'ring-purple-400',
    6: 'ring-indigo-400',
  };

  const getAvatarFrame = () => {
    if (user.avatarFrame === 2) {
      return 'ring-2 ring-gradient-to-r from-red-400 via-yellow-400 to-blue-400';
    }
    return `ring-2 ${frameColors[user.avatarFrame as keyof typeof frameColors] || frameColors[1]}`;
  };

  return (
    <div className="relative inline-block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizes[size]} rounded-full overflow-hidden ${getAvatarFrame()} cursor-pointer`}
        onClick={onClick}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center text-white font-bold text-lg">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </motion.div>
      {showStatus && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
      )}
    </div>
  );
};
