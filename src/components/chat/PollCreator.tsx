import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Send, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface PollCreatorProps {
  onClose: () => void;
  onCreatePoll: (question: string, options: string[], duration: number) => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({ onClose, onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(24);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      toast.error('Maximum 6 options');
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    if (options.some(opt => !opt.trim())) {
      toast.error('Please fill in all options');
      return;
    }
    onCreatePoll(question, options.filter(opt => opt.trim()), duration);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <GlassCard className="w-96 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Create a Poll</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Question */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="glass-input w-full px-3 py-2 text-white placeholder-white/50 focus:outline-none"
            placeholder="Ask a question..."
            maxLength={200}
          />
        </div>

        {/* Options */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="glass-input flex-1 px-3 py-2 text-white placeholder-white/50 focus:outline-none"
                placeholder={`Option ${index + 1}`}
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          {options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm mt-2"
            >
              <Plus size={16} />
              Add Option
            </button>
          )}
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Duration: {duration} hours
          </label>
          <input
            type="range"
            min="1"
            max="168"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>1 hour</span>
            <span>7 days</span>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          variant="primary"
          icon={<Send size={16} />}
          className="w-full"
        >
          Create Poll
        </Button>
      </GlassCard>
    </motion.div>
  );
};
