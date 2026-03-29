import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Home,
  Mail,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Hash,
  Users,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { logoutUser } from '../../firebase/auth';
import { useRooms } from '../../hooks/useRooms';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { rooms } = useRooms();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/chat', icon: MessageCircle, label: 'Chat Rooms' },
    { path: '/dm', icon: Mail, label: 'Direct Messages' },
    { path: `/profile/${user?.uid}`, icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/support', icon: HelpCircle, label: 'Support' },
  ];

  if (user?.isAdmin) {
    navItems.splice(5, 0, { path: '/admin', icon: Crown, label: 'Admin' });
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="relative h-screen glass-card rounded-none border-l-0 border-t-0 border-b-0 overflow-hidden"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <div className="h-full flex flex-col py-20">
        {/* Logo */}
        {!isCollapsed && (
          <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] bg-clip-text text-transparent">
              MILI CHAT
            </h1>
            <p className="text-xs text-white/50 mt-1">🌸 Your cute corner</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-2 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* Rooms Section */}
          {!isCollapsed && rooms.length > 0 && (
            <div className="mt-8 px-6">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                Your Rooms
              </h3>
              <div className="space-y-1">
                {rooms.slice(0, 5).map((room) => (
                  <NavLink
                    key={room.id}
                    to={`/chat/${room.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Hash size={16} />
                    <span className="text-sm truncate">{room.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="px-3 pb-6">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl bg-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#ff9a9e] flex items-center justify-center text-white font-bold">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{user.displayName}</p>
                <p className="text-xs text-white/50">@{user.username}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
