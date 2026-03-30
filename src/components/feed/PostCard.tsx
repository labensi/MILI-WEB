import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Flag, MoreVertical, Trash2, Copy, Check } from 'lucide-react';
import { Post, User, Comment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatTimeAgo, copyToClipboard } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuthStore();
  const [author, setAuthor] = useState<User | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAuthor = async () => {
      const userData = await firestoreService.getUser(post.authorId);
      setAuthor(userData);
    };
    loadAuthor();

    if (user) {
      setLiked(post.likes.includes(user.uid));
    }
  }, [post, user]);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    const commentsData = await firestoreService.getComments(post.id);
    setComments(commentsData);
  };

  const handleLike = async () => {
    if (!user) return;

    if (liked) {
      await firestoreService.unlikePost(post.id, user.uid);
      setLikeCount(prev => prev - 1);
    } else {
      await firestoreService.likePost(post.id, user.uid);
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    await firestoreService.addComment(post.id, {
      authorId: user.uid,
      content: commentText,
      replyTo: null,
    });

    setCommentText('');
    await loadComments();
    toast.success('Comment added!');
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    await copyToClipboard(postUrl);
    setCopied(true);
    toast.success('Post link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = async () => {
    if (!user) return;
    await firestoreService.createReport({
      reporterId: user.uid,
      targetType: 'post',
      targetId: post.id,
      reason: 'Inappropriate content',
    });
    toast.success('Post reported to admin');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete?.();
      toast.success('Post deleted');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard className="p-5 mb-4 rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={author} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm md:text-base">{author?.displayName}</p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <p>@{author?.username}</p>
                <span>•</span>
                <p>{formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Options"
            >
              <MoreVertical size={18} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 glass-card z-10 overflow-hidden rounded-xl shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => {
                      handleShare();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-white/5"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => {
                      handleReport();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-white/5"
                  >
                    <Flag size={16} />
                    <span>Report Post</span>
                  </motion.button>
                  {user?.uid === post.authorId && (
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(239,68,68,0.2)' }}
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <p className="text-white text-base leading-relaxed break-words">{post.content}</p>
        </motion.div>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`mb-4 rounded-xl overflow-hidden ${
              post.mediaUrls.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-2'
            }`}
          >
            {post.mediaUrls.map((url, idx) => (
              <motion.img
                key={idx}
                src={url}
                alt={`Post media ${idx + 1}`}
                className="w-full h-40 md:h-56 object-cover rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              />
            ))}
          </motion.div>
        )}

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between pt-4 border-t border-white/10"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                liked
                  ? 'text-red-400 bg-red-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">{likeCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white text-white/70 transition-all text-sm font-medium"
              title={showComments ? 'Hide comments' : 'Show comments'}
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">{comments.length}</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white text-white/70 transition-all text-sm font-medium"
            title="Share"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
        </motion.div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 pt-5 border-t border-white/10 space-y-4"
            >
              {/* Comments List */}
              {comments.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map((comment, idx) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <p className="text-sm text-white/80">{comment.content}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {formatTimeAgo(comment.createdAt)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[var(--theme-accent)]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Post
                </motion.button>
              </form>

              {comments.length === 0 && !commentText.trim() && (
                <p className="text-sm text-white/50 text-center italic">No comments yet</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};
