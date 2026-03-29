import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  glow?: string;
  blur?: number;
  opacity?: number;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glow,
  blur = 20,
  opacity = 0.1,
  className = '',
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: glow ? `0 0 20px ${glow}` : '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      {children}
    </motion.div>
  );
};
