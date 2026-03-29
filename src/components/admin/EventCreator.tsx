import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Upload, Image as ImageIcon, X, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { firestoreService } from '../../firebase/firestore';
import { storageService } from '../../firebase/storage';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export const EventCreator: React.FC = () => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Banner too large. Max 5MB');
        return;
      }
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    setCreating(true);
    try {
      let bannerURL = null;
      if (bannerFile) {
        bannerURL = await storageService.uploadImage(bannerFile, user?.uid || 'admin', 'post');
      }

      await firestoreService.createEvent({
        title: title.trim(),
        description: description.trim(),
        bannerURL,
        startDate: start,
        endDate: end,
      });

      toast.success('Event created successfully! 🎉');
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setBannerFile(null);
      setBannerPreview(null);
      loadEvents();
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const loadEvents = async () => {
    const upcomingEvents = await firestoreService.getUpcomingEvents();
    setEvents(upcomingEvents);
  };

  // Load events on mount
  React.useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Create Event Form */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-[var(--accent)]" />
          <div>
            <h2 className="text-xl font-semibold text-white">Create Site Event</h2>
            <p className="text-white/50 text-sm">Schedule a special event for the community</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none"
              placeholder="e.g., Summer Festival, Holiday Party, etc."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Event Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none resize-none"
              placeholder="Describe the event details..."
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Clock size={14} className="inline mr-1" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input w-full px-4 py-3 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Clock size={14} className="inline mr-1" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input w-full px-4 py-3 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Event Banner (Optional)
            </label>
            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-white/20 rounded-lg hover:border-[var(--accent)] transition-colors text-center"
              >
                <Upload className="mx-auto mb-2 text-white/50" size={32} />
                <p className="text-white/70">Click to upload banner image</p>
                <p className="text-white/50 text-xs mt-1">Recommended size: 1200x400px</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateEvent}
            variant="primary"
            loading={creating}
            icon={<Plus size={18} />}
            className="w-full"
          >
            Create Event
          </Button>
        </div>
      </GlassCard>

      {/* Upcoming Events List */}
      {events.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  {event.bannerURL ? (
                    <img src={event.bannerURL} alt={event.title} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center">
                      <Calendar size={24} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <p className="text-white/50 text-sm">{event.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                      <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                      <span>⏰ {new Date(event.startDate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
