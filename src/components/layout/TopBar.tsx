import React, { useState } from 'react';
import { Bell, Search, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export const TopBar: React.FC = () => {
  const { user } = useAuthStore();
  const { darkMode, setDarkMode } = useThemeStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <header className="glass-card rounded-none border-t-0 border-r-0 border-l-0 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users, rooms, posts..."
              className="glass-input w-full pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 glass-card z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[var(--accent)] hover:text-white"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-white/50">
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-white/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <p className="text-sm text-white">{notification.type}</p>
                          <p className="text-xs text-white/50">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          {user && (
            <Avatar user={user} size="md" onClick={() => {}} />
          )}
        </div>
      </div>
    </header>
  );
};
