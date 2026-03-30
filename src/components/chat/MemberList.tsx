import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Circle, Radio } from 'lucide-react';
import { Room, User } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { realtimeService } from '../../firebase/realtime';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { TypingIndicator } from './TypingIndicator';

interface MemberListProps {
  room: Room;
}

interface MemberWithStatus extends User {
  online?: boolean;
  typing?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({ room }) => {
  const { user: currentUser } = useAuthStore();
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      const memberPromises = room.members.map(async (memberId) => {
        const userData = await firestoreService.getUser(memberId);
        return userData;
      });
      const memberData = (await Promise.all(memberPromises)).filter(Boolean) as User[];
      
      // Get online status for each member
      const membersWithStatus: MemberWithStatus[] = [...memberData];
      for (const member of membersWithStatus) {
        realtimeService.onUserPresence(member.uid, (presence) => {
          setMembers(prev => prev.map(m => 
            m.uid === member.uid ? { ...m, online: presence?.online || false, typing: presence?.typing || false } : m
          ));
        });
      }
      
      setMembers(membersWithStatus);
      setLoading(false);
    };

    loadMembers();
  }, [room]);

  const typingMembers = members.filter(m => m.typing && m.uid !== currentUser?.uid);
  const onlineMembers = members.filter(m => m.online && !m.typing);
  const offlineMembers = members.filter(m => !m.online);

  if (loading) {
    return (
      <div className="p-4 text-center text-white/50">
        <TypingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white/5 to-transparent">
      {/* Header */}
      <div className="p-4 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[var(--theme-accent)]" />
          <div>
            <h3 className="text-white font-bold text-lg">Members</h3>
            <p className="text-xs text-white/50">{members.length} total</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Typing Members */}
        {typingMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[var(--theme-accent)] uppercase tracking-wider mb-3 px-2">
              ✏️ Typing
            </h4>
            <div className="space-y-2">
              {typingMembers.map((member) => (
                <MemberItem
                  key={member.uid}
                  member={member}
                  isOwner={room.ownerId === member.uid}
                  isCurrentUser={currentUser?.uid === member.uid}
                  typing={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <Circle size={8} className="fill-green-400" />
              Online — {onlineMembers.length}
            </h4>
            <div className="space-y-2">
              {onlineMembers.map((member) => (
                <MemberItem
                  key={member.uid}
                  member={member}
                  isOwner={room.ownerId === member.uid}
                  isCurrentUser={currentUser?.uid === member.uid}
                  online={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <Circle size={8} className="fill-white/40" />
              Offline — {offlineMembers.length}
            </h4>
            <div className="space-y-2">
              {offlineMembers.map((member) => (
                <MemberItem
                  key={member.uid}
                  member={member}
                  isOwner={room.ownerId === member.uid}
                  isCurrentUser={currentUser?.uid === member.uid}
                  online={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MemberItemProps {
  member: MemberWithStatus;
  isOwner: boolean;
  isCurrentUser: boolean;
  online?: boolean;
  typing?: boolean;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, isOwner, isCurrentUser, online = false, typing = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${typing ? 'glass-panel border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/10' : ''}
        ${online && !typing ? 'glass-panel hover:bg-white/10 border border-white/10' : ''}
        ${!online ? 'bg-white/5 hover:bg-white/8 border border-white/5' : ''}
      `}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative flex-shrink-0">
        <Avatar user={member} size="sm" />
        {typing ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--theme-accent)] rounded-full border-2 border-white/20"
          />
        ) : online ? (
          <motion.div
            animate={{ boxShadow: ['0 0 0 3px transparent', '0 0 0 3px rgba(34, 197, 94, 0.5)', '0 0 0 3px transparent'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"
          />
        ) : (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-white/40 rounded-full" />
        )}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-bold truncate ${typing ? 'text-[var(--theme-accent)]' : 'text-white'}`}>
            {member.displayName}
            {isCurrentUser && <span className="text-xs text-white/40 ml-1">(you)</span>}
          </span>
          
          {/* Role Badges */}
          {isOwner && (
            <motion.div whileHover={{ scale: 1.1 }}>
              <Badge variant="primary" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-amber-500/30 border border-amber-500/50 text-amber-200">
                <Crown size={12} />
                Owner
              </Badge>
            </motion.div>
          )}

          {member.isAdmin && !isOwner && (
            <motion.div whileHover={{ scale: 1.1 }}>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-purple-500/30 border border-purple-500/50 text-purple-200">
                <Shield size={12} />
                Admin
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Username and Status */}
        <div className="text-xs text-white/50 flex items-center gap-1">
          @{member.username}
          {typing && <span className="text-[var(--theme-accent)] font-semibold">is typing...</span>}
        </div>
      </div>

      {/* Status Indicator for Online Members */}
      {online && !typing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 text-xs font-semibold"
        >
          ●
        </motion.div>
      )}
    </motion.div>
  );
};
