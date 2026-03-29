import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Lock, Users, Crown } from 'lucide-react';
import { Room } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface RoomCardProps {
  room: Room;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = room.ownerId === user?.uid;

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassCard
        className="p-4 cursor-pointer hover:shadow-xl transition-all"
        hover={true}
      >
        <div
          onClick={() => navigate(`/chat/${room.id}`)}
          className="flex items-start justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {room.type === 'private' ? (
                <Lock size={16} className="text-white/50" />
              ) : (
                <Hash size={16} className="text-white/50" />
              )}
              <h3 className="text-lg font-semibold text-white">{room.name}</h3>
              {isOwner && (
                <Badge variant="primary" className="text-xs">
                  <Crown size={12} className="inline mr-1" />
                  Owner
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-white/70 mb-3 line-clamp-2">
              {room.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{room.memberCount} members</span>
              </div>
              <div>
                Created {new Date(room.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div
            className="w-12 h-12 rounded-lg bg-gradient-to-br"
            style={{
              background: `linear-gradient(135deg, ${room.primaryColor}, ${room.glowColor})`,
            }}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
};
