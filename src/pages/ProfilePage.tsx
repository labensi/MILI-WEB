import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  MessageCircle,
  Calendar,
  Crown,
  Shield,
  Image as ImageIcon,
  Info,
  Grid,
  Heart,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { firestoreService } from '../firebase/firestore';
import { realtimeService } from '../firebase/realtime';
import { User, Post } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProfileEffect } from '../components/profile/ProfileEffect';
import { AvatarFrame } from '../components/profile/AvatarFrame';
import { PostCard } from '../components/feed/PostCard';
import { applyFontStyle, getFontStyleCSS } from '../utils/fontStyles';
import { formatDate, formatTimeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

type ProfileTab = 'posts' | 'liked' | 'about';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [startingDM, setStartingDM] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userData = await firestoreService.getUser(userId);
      if (!userData) {
        toast.error('User not found');
        navigate('/feed');
        return;
      }
      setProfileUser(userData);

      // Online presence
      realtimeService.onUserPresence(userId, (presence) => {
        setOnline(presence?.online || false);
      });

      // Load posts
      const allPosts = await firestoreService.getPosts(null, 100);
      setUserPosts(allPosts.filter((p) => p.authorId === userId));
      if (currentUser) {
        setLikedPosts(allPosts.filter((p) => p.likes.includes(currentUser.uid)));
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDM = async () => {
    if (!currentUser || !profileUser) return;
    setStartingDM(true);
    try {
      const dmId = [currentUser.uid, profileUser.uid].sort().join('_');
      const existing = await firestoreService.getDM(dmId);
      if (!existing) await firestoreService.createDM(currentUser.uid, profileUser.uid);
      navigate('/dm');
      toast.success(`DM with ${profileUser.displayName} opened!`);
    } catch {
      toast.error('Failed to start DM');
    } finally {
      setStartingDM(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/50">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  const displayName = applyFontStyle(profileUser.displayName, profileUser.fontStyle);
  const nameStyle = getFontStyleCSS(
    profileUser.fontStyle,
    profileUser.fontColor,
    profileUser.fontAnimation
  );

  const tabs: { id: ProfileTab; label: string; icon: React.FC<any>; count: number }[] = [
    { id: 'posts', label: 'Posts', icon: Grid, count: userPosts.length },
    { id: 'liked', label: 'Liked', icon: Heart, count: likedPosts.length },
    { id: 'about', label: 'About', icon: Info, count: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Profile Header Card */}
      <ProfileEffect effectId={profileUser.profileEffect}>
        <GlassCard className="overflow-hidden" hover={false}>
          {/* Banner */}
          <div
            className="h-52 relative"
            style={
              profileUser.bannerURL
                ? {
                    backgroundImage: `url(${profileUser.bannerURL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {
                    background: `linear-gradient(135deg, ${profileUser.accentColor}80, ${profileUser.accentColor}30)`,
                  }
            }
          >
            {profileUser.bannerURL && (
              <div className="absolute inset-0 bg-black/20" />
            )}
          </div>

          {/* Avatar + info */}
          <div className="relative px-8 pb-8">
            {/* Avatar floats above banner */}
            <div className="absolute -top-16 left-8">
              <AvatarFrame frameId={profileUser.avatarFrame} size="xl">
                {profileUser.photoURL ? (
                  <img
                    src={profileUser.photoURL}
                    alt={profileUser.displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${profileUser.accentColor}, #ff9a9e)`,
                    }}
                  >
                    {profileUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </AvatarFrame>
            </div>

            {/* Buttons top-right */}
            <div className="flex justify-end pt-4 gap-2">
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 size={14} />}
                  onClick={() => navigate('/settings')}
                >
                  Edit Profile
                </Button>
              ) : (
                currentUser && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<MessageCircle size={14} />}
                    loading={startingDM}
                    onClick={handleSendDM}
                  >
                    Message
                  </Button>
                )
              )}
            </div>

            {/* Name section — needs top margin for avatar */}
            <div className="mt-10">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-3xl font-bold"
                  style={nameStyle as React.CSSProperties}
                >
                  {displayName}
                </h1>
                {profileUser.isAdmin && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20">
                    <Crown size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-semibold">Admin</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      online ? 'bg-green-400' : 'bg-white/30'
                    }`}
                  />
                  <span className="text-white/50 text-xs">
                    {online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <p className="text-white/50 text-sm mt-1">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="text-white/80 mt-3 max-w-2xl">{profileUser.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/40">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Joined {formatDate(new Date(profileUser.createdAt))}</span>
                </div>
                {profileUser.lastSeen && !online && (
                  <div className="flex items-center gap-1">
                    <span>Last seen {formatTimeAgo(new Date(profileUser.lastSeen))}</span>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{userPosts.length}</p>
                  <p className="text-white/40 text-xs">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">
                    {userPosts.reduce((acc, p) => acc + p.likes.length, 0)}
                  </p>
                  <p className="text-white/40 text-xs">Likes received</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </ProfileEffect>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-b-2 border-[var(--accent)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && (
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'posts' && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">No posts yet</p>
              </div>
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </motion.div>
        )}

        {activeTab === 'liked' && (
          <motion.div
            key="liked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {!isOwnProfile ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">Liked posts are private</p>
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/50">No liked posts yet</p>
              </div>
            ) : (
              likedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">Display Style</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Font style</span>
                      <span className="text-white capitalize">{profileUser.fontStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Font color</span>
                      <span className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: profileUser.fontColor }}
                        />
                        <span className="text-white">{profileUser.fontColor}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Animation</span>
                      <span className="text-white capitalize">{profileUser.fontAnimation || 'None'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3">Customisation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Avatar frame</span>
                      <span className="text-white">Frame #{profileUser.avatarFrame}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Profile effect</span>
                      <span className="text-white">Effect #{profileUser.profileEffect}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Accent color</span>
                      <span className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: profileUser.accentColor }}
                        />
                        <span className="text-white">{profileUser.accentColor}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Theme</span>
                      <span className="text-white capitalize">{profileUser.theme}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
