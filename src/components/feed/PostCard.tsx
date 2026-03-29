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

  if (!author) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard className="p-5 mb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={author} size="md" />
            <div>
              <p className="font-semibold text-white">{author.displayName}</p>
              <p className="text-xs text-white/50">@{author.username}</p>
              <p className="text-xs text-white/40">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreVertical size={18} className="text-white/70" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 mt-1 w-40 glass-card z-10 overflow-hidden"
                >
                  <button
                    onClick={() => { handleShare(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => { handleReport(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Flag size={14} />
                    Report
                  </button>
                  {(user?.isAdmin || user?.uid === post.authorId) && (
                    <button
                      onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          {post.type === 'text' && (
            <div 
              className="p-4 rounded-xl"
              style={{
                background: post.bgStyle || 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              }}
            >
              <p className="text-white whitespace-pre-wrap">{post.content}</p>
            </div>
          )}
          
          {post.type === 'image' && post.mediaURL && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={post.mediaURL}
                alt="Post image"
                className="w-full cursor-pointer"
                onClick={() => window.open(post.mediaURL || '', '_blank')}
              />
              {post.content && (
                <p className="text-white mt-2">{post.content}</p>
              )}
            </div>
          )}
          
          {post.type === 'video' && post.mediaURL && (
            <div className="rounded-xl overflow-hidden">
              <video
                src={post.mediaURL}
                controls
                className="w-full"
              />
              {post.content && (
                <p className="text-white mt-2">{post.content}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-white/10">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all ${
              liked ? 'text-red-500' : 'text-white/70 hover:text-red-500'
            }`}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            <span className="text-sm">{likeCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{post.commentCount}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="glass-input flex-1 px-3 py-2 text-white placeholder-white/50 focus:outline-none text-sm"
                />
                <Button type="submit" variant="primary" size="sm">
                  Post
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-white/50 text-sm">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    const loadAuthor = async () => {
      const userData = await firestoreService.getUser(comment.authorId);
      setAuthor(userData);
    };
    loadAuthor();
  }, [comment]);

  if (!author) return null;

  return (
    <div className="flex gap-2">
      <Avatar user={author} size="sm" />
      <div className="flex-1">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">{author.displayName}</span>
            <span className="text-xs text-white/40">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-white/80 text-sm">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};
