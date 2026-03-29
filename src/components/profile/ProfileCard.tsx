import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Mail, Send, Edit2, Shield, Crown } from 'lucide-react';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ProfileEffect } from './ProfileEffect';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface ProfileCardProps {
  userId: string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ userId, isOwnProfile, onEdit }) => {
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingDM, setSendingDM] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await firestoreService.getUser(userId);
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, [userId]);

  const handleSendDM = async () => {
    if (!currentUser) return;
    setSendingDM(true);
    try {
      const dmId = [currentUser.uid, userId].sort().join('_');
      const existingDM = await firestoreService.getDM(dmId);
      if (!existingDM) {
        await firestoreService.createDM(currentUser.uid, userId);
      }
      toast.success('DM conversation started!');
      // Navigate to DM page would go here
    } catch (error) {
      toast.error('Failed to start DM');
    } finally {
      setSendingDM(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="text-center text-white/50">Loading profile...</div>
      </GlassCard>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ProfileEffect effectId={user.profileEffect}>
        <GlassCard className="overflow-hidden">
          {/* Banner */}
          <div
            className="h-32 bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] relative"
            style={{
              backgroundImage: user.bannerURL ? `url(${user.bannerURL})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {user.bannerURL && <div className="absolute inset-0 bg-black/30" />}
          </div>

          {/* Avatar Section */}
          <div className="relative px-6">
            <div className="absolute -top-12 left-6">
              <Avatar user={user} size="xl" />
            </div>
            
            {/* Edit Button */}
            {isOwnProfile && (
              <div className="absolute top-4 right-6">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 size={16} />}
                  onClick={onEdit}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 pt-16">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
              {user.isAdmin && (
                <Crown size={18} className="text-yellow-400" />
              )}
            </div>
            <p className="text-white/50 text-sm mb-3">@{user.username}</p>
            
            {user.bio && (
              <p className="text-white/80 mb-4">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-white/50">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              {user.lastSeen && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Last seen {formatDate(user.lastSeen)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <Button
                onClick={handleSendDM}
                variant="primary"
                icon={<Send size={16} />}
                loading={sendingDM}
              >
                Send Direct Message
              </Button>
            )}

            {/* Admin Badge */}
            {user.isAdmin && (
              <div className="mt-4 flex items-center gap-2 p-2 bg-yellow-500/20 rounded-lg">
                <Shield size={16} className="text-yellow-400" />
                <span className="text-yellow-400 text-sm">Verified Admin</span>
              </div>
            )}
          </div>
        </GlassCard>
      </ProfileEffect>
    </motion.div>
  );
};
