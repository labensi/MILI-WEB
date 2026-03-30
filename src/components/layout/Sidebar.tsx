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

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { rooms } = useRooms();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleNavClick = () => {
    onClose?.();
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
      animate={{ width: isCollapsed ? 70 : 280 }}
      className="relative h-screen glass-card rounded-none border-l-0 border-t-0 border-b-0 border-r border-white/10 overflow-hidden flex flex-col transition-all duration-300"
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 right-3 z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? <Menu size={18} /> : <X size={18} />}
      </button>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-custom">
        {/* Logo */}
        <div className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3 py-6' : 'px-6 py-8'}`}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--theme-accent)] to-[#ff9a9e] bg-clip-text text-transparent">
                MILI
              </h1>
              <p className="text-xs text-white/50 mt-2">🌸 Your cute corner</p>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold text-[var(--theme-accent)] text-center">
              🌸
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col">
          <div className={`space-y-1 ${isCollapsed ? 'px-1.5' : 'px-3'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] shadow-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
                aria-label={item.label}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
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
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm truncate"
                    title={room.name}
                  >
                    <Hash size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm">{room.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="px-3 pb-6 mt-auto border-t border-white/10 pt-6">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl bg-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--theme-accent)] to-[#ff9a9e] flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                <p className="text-xs text-white/50 truncate">@{user.username}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
            aria-label="Logout"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
