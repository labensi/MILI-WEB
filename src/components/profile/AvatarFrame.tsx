import React from 'react';
import { motion } from 'framer-motion';

interface AvatarFrameProps {
  frameId: number;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const frameStyles = {
  1: {
    name: 'Golden Sparkle',
    className: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent',
    gradient: 'conic-gradient(from 0deg, #ffd700, #ffed4e, #ffd700)',
  },
  2: {
    name: 'Rainbow Gradient',
    className: 'ring-4 ring-offset-2 ring-offset-transparent',
    gradient: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
  },
  3: {
    name: 'Neon Glow',
    className: 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-transparent shadow-lg shadow-cyan-400/50',
    gradient: '#00ffff',
  },
  4: {
    name: 'Cherry Blossom',
    className: 'ring-4 ring-pink-400 ring-offset-2 ring-offset-transparent',
    gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
  },
  5: {
    name: 'Stars & Moon',
    className: 'ring-4 ring-purple-400 ring-offset-2 ring-offset-transparent',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  6: {
    name: 'Cosmic Nebula',
    className: 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-transparent',
    gradient: 'radial-gradient(circle at center, #4B0082, #8B00FF, #00BFFF)',
  },
};

export const AvatarFrame: React.FC<AvatarFrameProps> = ({ frameId, children, size = 'md' }) => {
  const frame = frameStyles[frameId as keyof typeof frameStyles] || frameStyles[1];
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative inline-block"
    >
      <div
        className={`${sizeClasses[size]} rounded-full p-0.5 bg-gradient-to-r`}
        style={{ background: frame.gradient }}
      >
        <div className="w-full h-full rounded-full overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
