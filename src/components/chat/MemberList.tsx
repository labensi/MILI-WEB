import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, Circle } from 'lucide-react';
import { Room, User } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { realtimeService } from '../../firebase/realtime';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface MemberListProps {
  room: Room;
}

interface MemberWithStatus extends User {
  online?: boolean;
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
            m.uid === member.uid ? { ...m, online: presence?.online || false } : m
          ));
        });
      }
      
      setMembers(membersWithStatus);
      setLoading(false);
    };

    loadMembers();
  }, [room]);

  const onlineMembers = members.filter(m => m.online);
  const offlineMembers = members.filter(m => !m.online);

  if (loading) {
    return (
      <div className="p-4 text-center text-white/50">
        Loading members...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-white/70" />
          <h3 className="text-white font-semibold">
            Members ({members.length})
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Online — {onlineMembers.length}
            </h4>
            <div className="space-y-2">
              {onlineMembers.map((member) => (
                <MemberItem
                  key={member.uid}
                  member={member}
                  isOwner={room.ownerId === member.uid}
                  isCurrentUser={currentUser?.uid === member.uid}
                />
              ))}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Offline — {offlineMembers.length}
            </h4>
            <div className="space-y-2">
              {offlineMembers.map((member) => (
                <MemberItem
                  key={member.uid}
                  member={member}
                  isOwner={room.ownerId === member.uid}
                  isCurrentUser={currentUser?.uid === member.uid}
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
}

const MemberItem: React.FC<MemberItemProps> = ({ member, isOwner, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="relative">
        <Avatar user={member} size="sm" />
        {member.online && (
          <Circle
            size={10}
            className="absolute bottom-0 right-0 text-green-500 fill-green-500"
          />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {member.displayName}
            {isCurrentUser && <span className="text-white/50 text-xs ml-1">(you)</span>}
          </span>
          {isOwner && (
            <Badge variant="primary" className="text-xs">
              <Crown size={10} className="inline mr-1" />
              Owner
            </Badge>
          )}
        </div>
        <p className="text-xs text-white/50">@{member.username}</p>
      </div>
    </motion.div>
  );
};
