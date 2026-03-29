import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Palette, Type, Frame } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface TextPostEditorProps {
  onSave: (data: { title: string; content: string; bgStyle: string; frameName: string }) => void;
  onClose: () => void;
}

const backgroundStyles = [
  { name: 'Solid Pink', value: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { name: 'Solid Blue', value: 'linear-gradient(135deg, #a6c1ee, #fbc2eb)' },
  { name: 'Solid Purple', value: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: 'Notebook', value: 'repeating-linear-gradient(#f0f0f0 0px, #f0f0f0 24px, #e0e0e0 25px)' },
  { name: 'Grid', value: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent)' },
  { name: 'Lined Paper', value: 'repeating-linear-gradient(transparent, transparent 29px, rgba(0,0,0,0.1) 30px)' },
];

const frames = [
  { name: 'Simple', class: 'rounded-xl' },
  { name: 'Ribbon', class: 'relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-8 before:bg-red-400 before:rounded-b-lg' },
  { name: 'Stars', class: 'relative before:absolute before:top-2 before:left-2 before:content-["⭐"] before:text-yellow-400 before:text-xl' },
  { name: 'Hearts', class: 'relative before:absolute before:top-2 before:right-2 before:content-["❤️"] before:text-red-400 before:text-xl' },
  { name: 'Floral', class: 'relative before:absolute before:bottom-2 before:left-2 before:content-["🌸"] before:text-pink-400 before:text-xl' },
  { name: 'Minimal', class: 'border-2 border-white/30' },
];

export const TextPostEditor: React.FC<TextPostEditorProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(backgroundStyles[0]);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);

  const handleSave = () => {
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }
    onSave({
      title,
      content,
      bgStyle: selectedBg.value,
      frameName: selectedFrame.name,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Text Post" size="lg">
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-input w-full px-3 py-2 text-white placeholder-white/50 focus:outline-none"
            placeholder="Give your post a title..."
            maxLength={100}
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="glass-input w-full px-3 py-2 text-white placeholder-white/50 focus:outline-none resize-none"
            placeholder="Write something beautiful..."
            rows={6}
            maxLength={1000}
            required
          />
        </div>

        {/* Background Styles */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
            <Palette size={16} />
            Background Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {backgroundStyles.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setSelectedBg(bg)}
                className={`p-2 rounded-lg transition-all ${
                  selectedBg.name === bg.name
                    ? 'ring-2 ring-[var(--accent)]'
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
              >
                <div
                  className="h-16 rounded-lg mb-1"
                  style={{ background: bg.value }}
                />
                <p className="text-white text-xs">{bg.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Frames */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
            <Frame size={16} />
            Decorative Frame
          </label>
          <div className="grid grid-cols-3 gap-2">
            {frames.map((frame) => (
              <button
                key={frame.name}
                onClick={() => setSelectedFrame(frame)}
                className={`p-2 rounded-lg transition-all ${
                  selectedFrame.name === frame.name
                    ? 'ring-2 ring-[var(--accent)] bg-white/10'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className={`h-12 ${frame.class} bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] mb-1`} />
                <p className="text-white text-xs">{frame.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
            <Type size={16} />
            Preview
          </label>
          <div
            className={`p-4 min-h-[150px] ${selectedFrame.class}`}
            style={{ background: selectedBg.value }}
          >
            {title && (
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            )}
            <p className="text-white">{content || 'Your beautiful text will appear here...'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} className="flex-1">
            <Check size={16} className="mr-2" />
            Create Post
          </Button>
        </div>
      </div>
    </Modal>
  );
};
