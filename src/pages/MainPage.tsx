import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  usePresence();

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
      <div className="relative z-20 flex-shrink-0">
        <TopBar />
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className="flex-shrink-0 h-full">
          <Sidebar />
        </div>

        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto"
          style={{
            background: 'rgba(0,0,0,0.05)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="min-h-full p-6">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};
