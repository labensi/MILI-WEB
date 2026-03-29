import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Type, X, Upload } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { storageService } from '../../firebase/storage';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ImageFilterEditor } from './ImageFilterEditor';
import { TextPostEditor } from './TextPostEditor';
import toast from 'react-hot-toast';

type PostType = 'image' | 'video' | 'text';

export const CreatePost: React.FC<{ onPostCreated: () => void }> = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const [postType, setPostType] = useState<PostType>('text');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFilterEditor, setShowFilterEditor] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [textPostData, setTextPostData] = useState<{
    title?: string;
    bgStyle?: string;
    frameName?: string;
  }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: PostType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'video' ? 50 : 10;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    if (type === 'image') {
      setShowFilterEditor(true);
    }
  };

  const handlePost = async () => {
    if (!user) return;

    setUploading(true);
    try {
      let mediaURL = null;
      let filterName = null;

      if (postType === 'image' && selectedFile) {
        if (filteredImage) {
          // Convert base64 to blob
          const response = await fetch(filteredImage);
          const blob = await response.blob();
          mediaURL = await storageService.uploadImage(blob as File, user.uid, 'post');
          filterName = 'custom';
        } else {
          mediaURL = await storageService.uploadImage(selectedFile, user.uid, 'post');
        }
      } else if (postType === 'video' && selectedFile) {
        mediaURL = await storageService.uploadVideo(selectedFile, user.uid);
      }

      const postData = {
        authorId: user.uid,
        type: postType,
        content: caption,
        mediaURL,
        filterName: filterName,
        frameName: textPostData.frameName || null,
        bgStyle: textPostData.bgStyle || null,
      };

      await firestoreService.createPost(postData);
      toast.success('Post created! 🌟');
      onPostCreated();
      
      // Reset form
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setFilteredImage(null);
      setTextPostData({});
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const handleTextPost = () => {
    setShowTextEditor(true);
  };

  const handleTextPostSave = (data: { title: string; content: string; bgStyle: string; frameName: string }) => {
    setCaption(data.content);
    setTextPostData({
      title: data.title,
      bgStyle: data.bgStyle,
      frameName: data.frameName,
    });
    setShowTextEditor(false);
  };

  return (
    <>
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          {user && <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center text-white font-bold">
            {user.displayName.charAt(0)}
          </div>}
          <div className="flex-1">
            <p className="text-white font-semibold">{user?.displayName}</p>
            <p className="text-xs text-white/50">@{user?.username}</p>
          </div>
        </div>

        {/* Post Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPostType('text')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              postType === 'text'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Type size={18} />
            <span className="text-sm">Text</span>
          </button>
          <button
            onClick={() => setPostType('image')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              postType === 'image'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Image size={18} />
            <span className="text-sm">Image</span>
          </button>
          <button
            onClick={() => setPostType('video')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              postType === 'video'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Video size={18} />
            <span className="text-sm">Video</span>
          </button>
        </div>

        {/* Caption Input */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind? 🌸"
          className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none resize-none mb-4"
          rows={3}
          maxLength={500}
        />

        {/* File Upload for Image/Video */}
        {(postType === 'image' || postType === 'video') && !selectedFile && (
          <label className="block">
            <input
              type="file"
              accept={postType === 'image' ? 'image/*' : 'video/*'}
              className="hidden"
              onChange={(e) => handleFileSelect(e, postType)}
            />
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent)] transition-colors">
              <Upload className="mx-auto mb-2 text-white/50" size={32} />
              <p className="text-white/70">Click to upload {postType}</p>
              <p className="text-xs text-white/50 mt-1">
                Max size: {postType === 'image' ? '10MB' : '50MB'}
              </p>
            </div>
          </label>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="relative mb-4">
            {postType === 'image' ? (
              <img
                src={filteredImage || previewUrl}
                alt="Preview"
                className="w-full rounded-xl"
              />
            ) : (
              <video src={previewUrl} controls className="w-full rounded-xl" />
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setFilteredImage(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Post Button */}
        <Button
          onClick={postType === 'text' ? handleTextPost : handlePost}
          variant="primary"
          loading={uploading}
          className="w-full"
          disabled={postType !== 'text' && !selectedFile}
        >
          {postType === 'text' ? 'Create Text Post' : `Post ${postType}`}
        </Button>
      </GlassCard>

      {/* Image Filter Editor Modal */}
      {showFilterEditor && previewUrl && (
        <ImageFilterEditor
          imageUrl={previewUrl}
          onSave={(filteredUrl) => {
            setFilteredImage(filteredUrl);
            setShowFilterEditor(false);
          }}
          onClose={() => setShowFilterEditor(false)}
        />
      )}

      {/* Text Post Editor Modal */}
      {showTextEditor && (
        <TextPostEditor
          onSave={handleTextPostSave}
          onClose={() => setShowTextEditor(false)}
        />
      )}
    </>
  );
};
