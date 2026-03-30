import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { SeasonalParticles } from '../components/ui/SeasonalParticles';
import { useAuthStore } from '../store/authStore';
import { usePresence } from '../hooks/usePresence';
import { useThemeStore } from '../store/themeStore';
import { firestoreService } from '../firebase/firestore';
import { useNotificationStore } from '../store/notificationStore';

export const MainPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const { setNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  usePresence();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.isBanned) {
      navigate('/auth');
      return;
    }

    // Load notifications
    const loadNotifications = async () => {
      const notifs = await firestoreService.getUserNotifications(user.uid);
      setNotifications(notifs);
    };
    loadNotifications();
  }, [user, navigate, setNotifications]);

  const themeGradients: Record<string, string> = {
    spring: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a6c1ee 100%)',
    summer: 'linear-gradient(135deg, #f76b1c 0%, #fad961 50%, #74ebd5 100%)',
    autumn: 'linear-gradient(135deg, #ff5e62 0%, #ff9966 50%, #c94b4b 100%)',
    winter: 'linear-gradient(135deg, #4b6cb7 0%, #a6c1ee 50%, #fbc2eb 100%)',
  };

  if (!user) return null;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{ background: themeGradients[currentTheme] || themeGradients.spring }}
    >
      {/* Particle layer */}
      <SeasonalParticles />

      {/* Top bar */}
      <div className="relative z-topbar flex-shrink-0">
        <TopBar />
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed bottom-6 right-6 z-floating p-3 rounded-full bg-[var(--theme-accent)] text-white shadow-lg hover:shadow-xl transition-all md:hidden"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden relative z-content">
        {/* Sidebar with mobile overlay */}
        {(sidebarOpen || !isMobile) && (
          <>
            {/* Mobile backdrop */}
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 z-dropdown bg-black/30 backdrop-blur-sm md:hidden"
              />
            )}
            
            {/* Sidebar */}
            <motion.div
              animate={{
                x: sidebarOpen ? 0 : isMobile ? -320 : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`flex-shrink-0 h-full ${isMobile ? 'absolute z-floating w-80' : 'relative'}`}
            >
              <Sidebar onClose={() => isMobile && setSidebarOpen(false)} />
            </motion.div>
          </>
        )}

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto scrollbar-custom"
          style={{
            background: 'rgba(0,0,0,0.05)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="min-h-full p-4 md:p-6">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};
