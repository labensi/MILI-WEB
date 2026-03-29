import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ParticleBackground } from '../components/layout/ParticleBackground';
import { SeasonalParticles } from '../components/ui/SeasonalParticles';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.isAdmin || user.email === 'admin@milichat.com') {
        navigate('/admin');
      } else {
        navigate('/feed');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Loading MILI CHAT...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <ParticleBackground />
      <SeasonalParticles />

      {/* Top left logo */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-8 left-8 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl">🌸</div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #fff, #ffd6e0)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              MILI CHAT
            </h1>
            <p className="text-white/60 text-xs">Your cute little corner of the internet 🌸</p>
          </div>
        </div>
      </motion.div>

      {/* Decorative blobs */}
      <div
        className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #ff9a9e, transparent)' }}
      />
      <div
        className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #a6c1ee, transparent)' }}
      />

      {/* Centered auth form */}
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm
                key="login"
                onSwitchToRegister={() => setIsLogin(false)}
                onSuccess={() => {
                  const { user } = useAuthStore.getState();
                  if (user?.isAdmin || user?.email === 'admin@milichat.com') {
                    navigate('/admin');
                  } else {
                    navigate('/feed');
                  }
                }}
              />
            ) : (
              <RegisterForm
                key="register"
                onSwitchToLogin={() => setIsLogin(true)}
                onSuccess={() => navigate('/feed')}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-0 right-0 text-center text-white/30 text-xs z-10"
      >
        <p>MADE BY LA BENS AI ✨ &nbsp;|&nbsp; MILI CHAT v1.0</p>
      </motion.div>
    </div>
  );
};
