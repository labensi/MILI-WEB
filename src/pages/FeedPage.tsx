import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { CreatePost } from '../components/feed/CreatePost';
import { PostCard } from '../components/feed/PostCard';
import { StoryCard } from '../components/feed/StoryCard';
import { firestoreService } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Post, User } from '../types';
import toast from 'react-hot-toast';

type FeedSort = 'recent' | 'trending';

export const FeedPage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<FeedSort>('recent');
  const [storyUsers, setStoryUsers] = useState<User[]>([]);
  const lastDocRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = useCallback(
    async (reset = false) => {
      if (!hasMore && !reset) return;
      try {
        const lastDoc = reset ? null : lastDocRef.current;
        const newPosts = await firestoreService.getPosts(lastDoc, 15);
        if (newPosts.length < 15) setHasMore(false);
        if (newPosts.length > 0) lastDocRef.current = newPosts[newPosts.length - 1];
        setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      } catch {
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [hasMore]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    lastDocRef.current = null;
    await loadPosts(true);
  };

  // Load story users
  useEffect(() => {
    const load = async () => {
      const allUsers = await firestoreService.getAllUsers();
      setStoryUsers(allUsers.filter((u) => u.uid !== user?.uid).slice(0, 8));
    };
    load();
  }, [user]);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, [sort]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadPosts]);

  const handlePostCreated = () => {
    setHasMore(true);
    lastDocRef.current = null;
    loadPosts(true);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const sortedPosts = sort === 'trending'
    ? [...posts].sort((a, b) => b.likes.length - a.likes.length)
    : posts;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Stories Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard className="p-4 rounded-2xl" hover={false}>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20">
            <StoryCard isAddStory onClick={() => toast('Story creation coming soon!')} />
            {storyUsers.map((u, idx) => (
              <motion.div
                key={u.uid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <StoryCard userId={u.uid} onClick={() => {}} />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between gap-3 mb-6 px-2"
      >
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSort('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              sort === 'recent'
                ? 'bg-[var(--theme-accent)]/30 text-[var(--theme-accent)] border border-[var(--theme-accent)]/50'
                : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/20'
            }`}
          >
            <Clock size={16} />
            <span className="hidden sm:inline">Recent</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSort('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              sort === 'trending'
                ? 'bg-[var(--theme-accent)]/30 text-[var(--theme-accent)] border border-[var(--theme-accent)]/50'
                : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/20'
            }`}
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Trending</span>
          </motion.button>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white/70 hover:text-white disabled:opacity-50"
          title="Refresh feed"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </motion.button>
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <CreatePost onPostCreated={handlePostCreated} />
      </motion.div>

      {/* Feed Content */}
      {loading && posts.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-12 w-12 border-3 border-white/30 border-t-[var(--theme-accent)] mx-auto mb-4"
          />
          <p className="text-white/60 font-medium">Loading posts...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-4"
        >
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-2">Nothing here yet</h2>
          <p className="text-white/50">Be the first to share something beautiful!</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {sortedPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <PostCard
                  post={post}
                  onDelete={() => handleDeletePost(post.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreTriggerRef} className="h-16" />

      {/* Loading spinner for pagination */}
      {loading && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-10 w-10 border-2.5 border-white/30 border-t-[var(--theme-accent)] mx-auto"
          />
        </motion.div>
      )}

      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-white/40 text-sm font-medium"
        >
          ✨ You've seen everything! ✨
        </motion.div>
      )}
    </div>
  );
};
