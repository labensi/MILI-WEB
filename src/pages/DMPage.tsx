import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageCircle,
  UserPlus,
  X,
  Circle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { firestoreService } from '../firebase/firestore';
import { realtimeService } from '../firebase/realtime';
import { DM, User } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { formatTimeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export const DMPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentDM, setCurrentDM } = useChatStore();
  const [dms, setDms] = useState<DM[]>([]);
  const [dmUsers, setDmUsers] = useState<Record<string, User>>({});
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDM, setShowNewDM] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Load conversations
  const loadDMs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userDMs = await firestoreService.getUserDMs(user.uid);
      const sorted = userDMs.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      setDms(sorted);

      // Load other user data for each DM
      const usersMap: Record<string, User> = {};
      for (const dm of sorted) {
        const otherId = dm.participants.find((id) => id !== user.uid);
        if (otherId && !usersMap[dm.id]) {
          const otherUser = await firestoreService.getUser(otherId);
          if (otherUser) usersMap[dm.id] = otherUser;
        }
      }
      setDmUsers(usersMap);

      // Subscribe to presence for each user
      Object.values(usersMap).forEach((u) => {
        realtimeService.onUserPresence(u.uid, (presence) => {
          setOnlineStatus((prev) => ({ ...prev, [u.uid]: presence?.online || false }));
        });
      });
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDMs();
  }, [loadDMs]);

  // Load all users for new DM search
  useEffect(() => {
    if (showNewDM) {
      firestoreService.getAllUsers().then((users) =>
        setAllUsers(users.filter((u) => u.uid !== user?.uid))
      );
    }
  }, [showNewDM, user]);

  const handleStartDM = async (targetUser: User) => {
    if (!user) return;
    const dmId = [user.uid, targetUser.uid].sort().join('_');
    try {
      let dm = await firestoreService.getDM(dmId);
      if (!dm) {
        await firestoreService.createDM(user.uid, targetUser.uid);
        dm = await firestoreService.getDM(dmId);
      }
      if (dm) {
        setDmUsers((prev) => ({ ...prev, [dmId]: targetUser }));
        setCurrentDM(dmId);
        setShowNewDM(false);
        setUserSearch('');
        await loadDMs();
      }
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  const filteredDMs = dms.filter((dm) => {
    const otherUser = dmUsers[dm.id];
    if (!otherUser) return true;
    return (
      otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const currentOtherUser = currentDM ? dmUsers[currentDM] : null;
  const currentOtherOnline = currentOtherUser
    ? onlineStatus[currentOtherUser.uid] || false
    : false;

  return (
    <div className="flex h-full rounded-2xl overflow-hidden">
      {/* Conversations sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <button
              onClick={() => setShowNewDM(!showNewDM)}
              className={`p-2 rounded-lg transition-colors ${
                showNewDM
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="New message"
            >
              {showNewDM ? <X size={18} /> : <UserPlus size={18} />}
            </button>
          </div>

          {/* New DM user search */}
          <AnimatePresence>
            {showNewDM && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="glass-input w-full pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none text-sm"
                      autoFocus
                    />
                  </div>
                  {userSearch && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/10">
                      {filteredUsers.length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-3">No users found</p>
                      ) : (
                        filteredUsers.slice(0, 8).map((u) => (
                          <button
                            key={u.uid}
                            onClick={() => handleStartDM(u)}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors text-left"
                          >
                            <Avatar user={u} size="sm" />
                            <div>
                              <p className="text-white text-sm font-medium">{u.displayName}</p>
                              <p className="text-white/40 text-xs">@{u.username}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search existing DMs */}
          {!showNewDM && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none text-sm"
              />
            </div>
          )}
        </div>

        {/* DM list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="text-center text-white/50 py-8 text-sm">
              Loading conversations...
            </div>
          ) : filteredDMs.length === 0 ? (
            <div className="text-center text-white/50 py-12">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-white/30 mt-1">
                Click the + button to start chatting
              </p>
            </div>
          ) : (
            filteredDMs.map((dm) => {
              const otherUser = dmUsers[dm.id];
              if (!otherUser) return null;
              const isActive = currentDM === dm.id;
              const unread = dm.unreadCount?.[user?.uid || ''] || 0;
              const isOnline = onlineStatus[otherUser.uid] || false;

              return (
                <motion.button
                  key={dm.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                  onClick={() => setCurrentDM(dm.id)}
                  className={`w-full p-4 text-left transition-colors ${
                    isActive ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar user={otherUser} size="md" />
                      {isOnline && (
                        <Circle
                          size={10}
                          className="absolute bottom-0 right-0 text-green-500 fill-green-500"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white text-sm truncate">
                          {otherUser.displayName}
                        </p>
                        {dm.lastMessageAt && (
                          <span className="text-white/30 text-xs flex-shrink-0 ml-1">
                            {formatTimeAgo(new Date(dm.lastMessageAt))}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-xs truncate">
                        {dm.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">{unread}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {currentDM ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div
            className="flex-shrink-0 px-5 py-3 border-b border-white/10 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
          >
            {currentOtherUser && (
              <>
                <div className="relative">
                  <Avatar user={currentOtherUser} size="md" />
                  {currentOtherOnline && (
                    <Circle
                      size={10}
                      className="absolute bottom-0 right-0 text-green-500 fill-green-500"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-none">
                    {currentOtherUser.displayName}
                  </h2>
                  <p className="text-xs mt-0.5">
                    {currentOtherOnline ? (
                      <span className="text-green-400">Online</span>
                    ) : (
                      <span className="text-white/40">
                        @{currentOtherUser.username}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Messages + input */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <MessageList />
            <div className="flex-shrink-0 relative">
              <MessageInput dmId={currentDM} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-4">💌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-white/50 mb-4">
              Select a conversation or start a new one
            </p>
            <Button
              variant="primary"
              icon={<UserPlus size={18} />}
              onClick={() => setShowNewDM(true)}
            >
              New Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
