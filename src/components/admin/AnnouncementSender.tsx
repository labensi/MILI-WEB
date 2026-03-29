import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Calendar, Bell, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const AnnouncementSender: React.FC = () => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setSending(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresIn);

      await firestoreService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        createdBy: user?.uid || 'admin',
        expiresAt,
      });

      toast.success('Announcement sent to all users! 📢');
      setTitle('');
      setContent('');
      setExpiresIn(24);
    } catch (error) {
      toast.error('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-[var(--accent)]" />
          <div>
            <h2 className="text-xl font-semibold text-white">Send Announcement</h2>
            <p className="text-white/50 text-sm">Broadcast a message to all users</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none"
              placeholder="e.g., Server Maintenance, New Features, etc."
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Announcement Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none resize-none"
              placeholder="Write your announcement message here..."
              rows={6}
              maxLength={500}
            />
            <p className="text-white/50 text-xs mt-1 text-right">
              {content.length}/500 characters
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Calendar size={14} className="inline mr-1" />
              Expires in: {expiresIn} hours
            </label>
            <input
              type="range"
              min="1"
              max="168"
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>1 hour</span>
              <span>24 hours</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Preview */}
          {(title || content) && (
            <div className="mt-4 p-4 rounded-lg bg-white/5">
              <h4 className="text-white/70 text-sm mb-2">Preview</h4>
              <div className="glass-card p-3">
                <h3 className="font-semibold text-white mb-1">{title || 'Announcement Title'}</h3>
                <p className="text-white/70 text-sm">{content || 'Announcement content will appear here...'}</p>
                <div className="mt-2 text-xs text-white/30">
                  Will appear as a banner on user's main page
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white/80 text-sm">Announcement will:</p>
              <ul className="text-white/50 text-xs mt-1 space-y-1">
                <li>• Appear as a banner on every user's main page</li>
                <li>• Send a push notification to all online users</li>
                <li>• Automatically expire after selected duration</li>
              </ul>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            variant="primary"
            loading={sending}
            icon={<Send size={18} />}
            className="w-full"
          >
            Send Announcement to All Users
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
