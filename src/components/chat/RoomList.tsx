import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Hash, Lock } from 'lucide-react';
import { useRooms } from '../../hooks/useRooms';
import { useAuthStore } from '../../store/authStore';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

export const RoomList: React.FC = () => {
  const { rooms, loading } = useRooms();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateRoom = rooms.length < 3;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Chat Rooms</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none"
          />
        </div>

        {/* Create Button */}
        {canCreateRoom && (
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus size={20} />}
            className="w-full"
          >
            Create New Room
          </Button>
        )}
        {!canCreateRoom && (
          <p className="text-sm text-white/50 text-center mt-2">
            You've reached the maximum of 3 rooms
          </p>
        )}
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-white/50 py-8">
            Loading rooms...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            {searchQuery ? 'No rooms found' : 'No rooms yet. Create one!'}
          </div>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
