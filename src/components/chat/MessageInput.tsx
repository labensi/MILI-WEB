import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Video, Smile, Sticker, Mic, Paperclip } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../firebase/storage';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface MessageInputProps {
  roomId?: string;
  dmId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ roomId, dmId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { sendMessage, sendTyping } = useMessages();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 1000);
    } else {
      sendTyping(false);
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) return;

    const maxSize = type === 'image' ? 10 : 50;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      let mediaURL;
      if (type === 'image') {
        mediaURL = await storageService.uploadImage(file, user.uid, 'post');
      } else {
        mediaURL = await storageService.uploadVideo(file, user.uid);
      }
      await sendMessage('', type, mediaURL);
      toast.success(`${type === 'image' ? 'Image' : 'Video'} sent!`);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleStickerSelect = async (stickerUrl: string) => {
    await sendMessage('', 'image', stickerUrl);
    setShowStickerPicker(false);
  };

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          
          {/* Formatting Buttons */}
          <div className="absolute right-2 bottom-2 flex gap-1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Smile size={18} className="text-white/70" />
            </button>
            <button
              onClick={() => setShowStickerPicker(!showStickerPicker)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Sticker size={18} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* File Upload Buttons */}
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'image');
              }}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Image size={18} />}
              disabled={uploading}
            />
          </label>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'video');
              }}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Video size={18} />}
              disabled={uploading}
            />
          </label>
          
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSend}
            icon={<Send size={18} />}
            disabled={!message.trim() && !uploading}
          />
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
        </div>
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
};
