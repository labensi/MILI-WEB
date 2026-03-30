import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Lock,
  Users,
  Settings,
  ArrowLeft,
  Plus,
  Globe,
  Search,
  LogOut,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { MemberList } from '../components/chat/MemberList';
import { RoomList } from '../components/chat/RoomList';
import { CreateRoomModal } from '../components/chat/CreateRoomModal';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useRooms } from '../hooks/useRooms';
import { firestoreService } from '../firebase/firestore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Room } from '../types';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { currentRoom, setCurrentRoom } = useChatStore();
  const { user } = useAuthStore();
  const { rooms, leaveRoom } = useRooms();
  const [showMembers, setShowMembers] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allPublicRooms, setAllPublicRooms] = useState<Room[]>([]);
  const [showPublicBrowse, setShowPublicBrowse] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);

  // Load room from URL param
  useEffect(() => {
    if (!roomId) {
      setCurrentRoom(null);
      return;
    }
    const loadRoom = async () => {
      setLoadingRoom(true);
      try {
        const room = await firestoreService.getRoom(roomId);
        if (!room) {
          toast.error('Room not found');
          navigate('/chat');
          return;
        }
        if (!room.members.includes(user?.uid || '')) {
          toast.error('You are not a member of this room');
          navigate('/chat');
          return;
        }
        setCurrentRoom(room);
      } catch {
        toast.error('Failed to load room');
        navigate('/chat');
      } finally {
        setLoadingRoom(false);
      }
    };
    loadRoom();
    return () => setCurrentRoom(null);
  }, [roomId, user?.uid]);

  // Load public rooms for browse
  useEffect(() => {
    if (showPublicBrowse) {
      firestoreService.getAllRooms().then((r) =>
        setAllPublicRooms(r.filter((room) => room.type === 'public'))
      );
    }
  }, [showPublicBrowse]);

  const handleJoinPublicRoom = async (room: Room) => {
    if (!user) return;
    if (room.members.includes(user.uid)) {
      navigate(`/chat/${room.id}`);
      setShowPublicBrowse(false);
      return;
    }
    try {
      await firestoreService.joinRoom(room.id, user.uid);
      navigate(`/chat/${room.id}`);
      setShowPublicBrowse(false);
      toast.success(`Joined ${room.name}! 🎉`);
    } catch {
      toast.error('Failed to join room');
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (!user || !joinCodeInput.trim()) return;
    setJoining(true);
    try {
      const allRooms = await firestoreService.getAllRooms();
      const targetRoom = allRooms.find(
        (r) => r.type === 'private' && r.code === joinCodeInput.toUpperCase().trim()
      );
      if (!targetRoom) {
        toast.error('Invalid room code');
        return;
      }
      if (targetRoom.members.includes(user.uid)) {
        navigate(`/chat/${targetRoom.id}`);
        return;
      }
      await firestoreService.joinRoom(targetRoom.id, user.uid);
      navigate(`/chat/${targetRoom.id}`);
      setJoinCodeInput('');
      toast.success(`Joined ${targetRoom.name}! 🎉`);
    } catch {
      toast.error('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !user) return;
    if (window.confirm('Are you sure you want to leave this room?')) {
      await leaveRoom(currentRoom.id);
      navigate('/chat');
      toast.success('Left the room');
    }
  };

  // No room selected — show room browser
  if (!currentRoom) {
    return (
      <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6">
        {/* Left: My Rooms - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <RoomList />
        </div>

        {/* Right: Welcome / Browse - Full width on mobile, flex-1 on lg+ */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Join by code */}
          <GlassCard className="p-4 lg:p-6" hover={false}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm lg:text-base">
              <Lock size={18} />
              Join Private Room
            </h3>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="glass-input flex-1 px-4 py-2 text-white placeholder-white/50 focus:outline-none uppercase tracking-widest text-sm"
                placeholder="Enter 6-char code"
                maxLength={6}
                aria-label="Private room code"
              />
              <Button
                variant="primary"
                size="md"
                loading={joining}
                onClick={handleJoinPrivateRoom}
                disabled={joinCodeInput.length !== 6}
                className="w-full sm:w-auto"
              >
                Join
              </Button>
            </div>
          </GlassCard>

          {/* Browse public rooms */}
          <GlassCard className="p-4 lg:p-6 flex-1 overflow-hidden flex flex-col" hover={false}>
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm lg:text-base truncate">
                <Globe size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline">Browse Public Rooms</span>
                <span className="sm:hidden">Browse Rooms</span>
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPublicBrowse(!showPublicBrowse)}
              >
                {showPublicBrowse ? 'Hide' : 'Browse'}
              </Button>
            </div>

            {showPublicBrowse ? (
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-custom">
                {allPublicRooms.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🚀</div>
                    <p className="empty-state-text">No public rooms yet</p>
                    <p className="empty-state-subtext">Create one to get started!</p>
                  </div>
                ) : (
                  allPublicRooms.map((room) => {
                    const isMember = room.members.includes(user?.uid || '');
                    return (
                      <motion.div
                        key={room.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => handleJoinPublicRoom(room)}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${room.primaryColor}, ${room.glowColor})`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-medium text-sm truncate">{room.name}</p>
                            {isMember && <Badge variant="success" className="text-xs">Joined</Badge>}
                          </div>
                          <p className="text-white/50 text-xs truncate">{room.description}</p>
                          <p className="text-white/30 text-xs">{room.memberCount} members</p>
                        </div>
                        <ChevronRight size={16} className="text-white/30 flex-shrink-0 hidden sm:block" />
                      </motion.div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Welcome to Chat</h2>
                  <p className="text-white/50 mb-4 text-sm">
                    Select a room from the list, join with a code, or browse public rooms
                  </p>
                  <Button
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Create a Room
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    );
  }

  if (loadingRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    );
  }

  const isOwner = currentRoom.ownerId === user?.uid;

  return (
    <div className="flex h-full flex-col lg:flex-row min-w-0">
      {/* Rooms sidebar - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 border-r border-white/10 overflow-hidden">
        <RoomList />
      </div>

      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="flex-shrink-0 px-3 lg:px-5 py-3 border-b border-white/10 flex items-center justify-between gap-2"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate('/chat')}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white flex-shrink-0"
              aria-label="Back to rooms"
            >
              <ArrowLeft size={18} />
            </button>
            {currentRoom.type === 'private' ? (
              <Lock size={18} className="text-white/50 flex-shrink-0" />
            ) : (
              <Hash size={18} className="text-white/50 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-bold text-lg lg:text-xl leading-none truncate">
                  {currentRoom.name}
                </h2>
                {isOwner && (
                  <Crown size={14} className="text-yellow-400 flex-shrink-0" />
                )}
              </div>
              {currentRoom.type === 'private' && currentRoom.code && isOwner && (
                <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded font-mono inline-block mt-1">
                  {currentRoom.code}
                </span>
              )}
              <p className="text-white/40 text-xs mt-0.5 truncate hidden sm:block">{currentRoom.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="items-center gap-1 text-white/50 text-sm hidden sm:flex">
              <Users size={16} />
              <span>{currentRoom.memberCount}</span>
            </div>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-lg transition-colors ${
                showMembers ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              aria-label={showMembers ? 'Hide members' : 'Show members'}
            >
              <Users size={18} />
            </button>
            <button
              onClick={handleLeaveRoom}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              aria-label="Leave room"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Messages + Members Container */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 lg:gap-0 min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 order-last lg:order-first">
            <MessageList />
            <div className="flex-shrink-0 relative p-4 lg:p-0">
              <MessageInput roomId={currentRoom.id} />
            </div>
          </div>

          {/* Members panel - Mobile: Modal-like, Desktop: Sidebar */}
          <AnimatePresence>
            {showMembers && (
              <motion.div
                initial={{ width: 0, opacity: 0, x: 20 }}
                animate={{ width: 'auto', opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0 lg:w-80 border-l border-white/10 overflow-hidden"
              >
                <MemberList room={currentRoom} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
