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
    <header className="glass-card rounded-none border-t-0 border-r-0 border-l-0 px-4 md:px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users, rooms, posts..."
              className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sound Toggle - Hidden on mobile */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hidden sm:flex p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            title={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Theme Toggle - Hidden on mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative text-white/80 hover:text-white"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-96 max-w-[90vw] glass-card z-50 overflow-hidden rounded-xl shadow-xl"
                >
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-semibold text-white text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setShowNotifications(false);
                        }}
                        className="text-xs text-[var(--theme-accent)] hover:text-white transition-colors font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-white/50">
                        <p className="text-sm">🔔 No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-white/10' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notification.id);
                          }}
                        >
                          <p className="text-sm text-white font-medium">{notification.type}</p>
                          <p className="text-xs text-white/50 mt-1">
                            {new Date(notification.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          {user && (
            <div className="ml-2 pl-2 border-l border-white/10">
              <Avatar user={user} size="md" onClick={() => {}} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
