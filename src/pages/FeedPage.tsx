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
    <div className="max-w-2xl mx-auto pb-8">
      {/* Stories strip */}
      <GlassCard className="p-4 mb-4" hover={false}>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin">
          <StoryCard isAddStory onClick={() => toast('Story creation coming soon!')} />
          {storyUsers.map((u) => (
            <StoryCard key={u.uid} userId={u.uid} onClick={() => {}} />
          ))}
        </div>
      </GlassCard>

      {/* Sort + Refresh bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSort('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              sort === 'recent'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Clock size={14} />
            Recent
          </button>
          <button
            onClick={() => setSort('trending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              sort === 'trending'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <TrendingUp size={14} />
            Trending
          </button>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/50">Loading posts...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-7xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-2">Nothing here yet</h2>
          <p className="text-white/50">Be the first to share something beautiful!</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {sortedPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <PostCard
                post={post}
                onDelete={() => handleDeletePost(post.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreTriggerRef} className="h-10" />

      {/* Loading spinner for pagination */}
      {loading && posts.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-white/30 text-sm">
          ✨ You've seen everything! ✨
        </div>
      )}
    </div>
  );
};
