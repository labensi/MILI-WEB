import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRooms } from '../../hooks/useRooms';
import { useAuthStore } from '../../store/authStore';
import { generateRoomCode } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roomThemes = [
  { id: 1, name: 'Neon City', colors: ['#ff00ff', '#00ffff', '#ff0066'] },
  { id: 2, name: 'Cozy Café', colors: ['#8B4513', '#D2691E', '#F5DEB3'] },
  { id: 3, name: 'Galaxy', colors: ['#4B0082', '#8B00FF', '#00BFFF'] },
  { id: 4, name: 'Garden', colors: ['#228B22', '#32CD32', '#98FB98'] },
  { id: 5, name: 'Ocean Depths', colors: ['#000080', '#1E90FF', '#00CED1'] },
  { id: 6, name: 'Sakura Dream', colors: ['#FFB7C5', '#FF69B4', '#FFC0CB'] },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { createRoom } = useRooms();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    theme: 1,
    primaryColor: '#ff6b9d',
    glowColor: '#ff9a9e',
    glowIntensity: 50,
    backgroundPreset: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const roomData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        ownerId: user.uid,
        code: formData.type === 'private' ? generateRoomCode() : null,
        members: [user.uid],
        memberCount: 1,
        fontStyle: 'classic',
      };
      
      await createRoom(roomData);
      toast.success('Room created successfully! 🎉');
      onClose();
      setFormData({
        name: '',
        description: '',
        type: 'public',
        theme: 1,
        primaryColor: '#ff6b9d',
        glowColor: '#ff9a9e',
        glowIntensity: 50,
        backgroundPreset: null,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const selectedTheme = roomThemes.find(t => t.id === formData.theme);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Room" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Room Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="glass-input w-full px-4 py-2 text-white placeholder-white/50 focus:outline-none"
            placeholder="Enter room name"
            maxLength={50}
            required
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="glass-input w-full px-4 py-2 text-white placeholder-white/50 focus:outline-none resize-none"
            placeholder="Describe your room"
            rows={3}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Room Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.type === 'public'}
                onChange={() => setFormData({ ...formData, type: 'public' })}
                className="text-[var(--accent)]"
              />
              <span className="text-white">Public</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.type === 'private'}
                onChange={() => setFormData({ ...formData, type: 'private' })}
                className="text-[var(--accent)]"
              />
              <span className="text-white">Private (requires code)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Room Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roomThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    theme: theme.id,
                    primaryColor: theme.colors[0],
                    glowColor: theme.colors[1],
                  });
                }}
                className={`p-2 rounded-lg transition-all ${
                  formData.theme === theme.id
                    ? 'ring-2 ring-[var(--accent)] bg-white/20'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div className="h-12 rounded-lg mb-1" style={{
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                }} />
                <p className="text-xs text-white">{theme.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={formData.primaryColor}
            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Glow Color
          </label>
          <input
            type="color"
            value={formData.glowColor}
            onChange={(e) => setFormData({ ...formData, glowColor: e.target.value })}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Glow Intensity: {formData.glowIntensity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.glowIntensity}
            onChange={(e) => setFormData({ ...formData, glowIntensity: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};
